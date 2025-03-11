import { eventStream } from "remix-utils/sse/server";
import { getRoomStatus, subscribeToMessages } from "~/utils/chat.server";
import type { Route } from "./+types/stream";
import { redisPublisher } from "~/integrations/redis/service.server";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ request, context }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    if (!roomId) {
        throw new Response("roomId is required", { status: 400 });
    }
    const userId = getSessionContext(context).get("userId");
    const userIdFromUrl = url.searchParams.get("userId");
    if (userIdFromUrl && userIdFromUrl !== userId) {
        throw new Response("User ID mismatch", { status: 403 });
    }

    // Check if the session is active
    const { status } = await getRoomStatus(roomId)

    if (status !== "active") {
        console.log(`room: ${userId}, status: ${status}`);
        // Session is inactive; return a response to close the connection
        return new Response(null, { status: 204 }); // 204 No Content closes the SSE connection
    }
    const participantKey = `room:${roomId}:participants`;
    const channel = `chat:${roomId}`;
    const streamKey = `room:${roomId}:stream:${userId}`;

    const existingStreams = await redisPublisher.keys(streamKey);
    if (existingStreams.length > 0) {
        console.log(`[${new Date().toISOString()}] Existing stream detected for ${userId}, terminating`);
        await redisPublisher.del(streamKey);
    }

    return eventStream(request.signal, (send) => {
        console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

        const join = async () => {
            await redisPublisher.sAdd(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);
            await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
            await redisPublisher.set(streamKey, "active", { PX: 15000 }).catch(err =>
                console.error(`[${new Date().toISOString()}] Failed to set ${streamKey}:`, err)
            );
            if ((await redisPublisher.get(streamKey)) !== "active") {
                console.error(`[${new Date().toISOString()}] Failed to verify ${streamKey} after set`);
            }
            console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
            send({ event: "participants", data: JSON.stringify({ count }) });
        };

        const leave = async () => {
            const removed = await redisPublisher.sRem(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);

            if (removed > 0) {
                await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
                console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
                send({ event: "participants", data: JSON.stringify({ count }) });
            }
            await redisPublisher.del(streamKey);
        };

        const unsubscribe = subscribeToMessages(roomId, (message) => {
            if (message.event === "participants") {
                send({ event: "participants", data: JSON.stringify({ count: message.data }) });
            } else {
                send({ event: "new-message", data: JSON.stringify(message) });
            }
        });

        let lastActivity = Date.now();
        let heartbeatInterval: NodeJS.Timeout | undefined;

        const originalSend = send;
        send = (event) => {
            lastActivity = Date.now();
            originalSend(event);
        };

        if (request.signal.aborted) {
            console.log(`[${new Date().toISOString()}] Immediate abort for ${userId}`);
            unsubscribe();
            leave();
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        } else {
            join();
            setTimeout(() => {
                heartbeatInterval = setInterval(async () => {
                    try {
                        const streamActive = await redisPublisher.get(streamKey)
                        if (!streamActive) {
                            console.log(`[${new Date().toISOString()}] Stream expired for ${userId}`);
                            unsubscribe();
                            leave();
                            clearInterval(heartbeatInterval);
                        } else {
                            send({ event: "heartbeat", data: String(Date.now()) });
                            redisPublisher.set(streamKey, "active", { PX: 15000 }).catch(err =>
                                console.error(`[${new Date().toISOString()}] Failed to refresh ${streamKey}:`, err)
                            );
                        }
                    } catch (e) {
                        console.error(`[${new Date().toISOString()}] Failed to get ${streamKey}:`, e)
                    }

                }, 2000);
            }, 5000);

            // let abortTimeout: NodeJS.Timeout | undefined;
            request.signal.addEventListener("abort", async () => {
                // clearTimeout(abortTimeout);
                // abortTimeout = setTimeout(() => {
                console.log(`[${new Date().toISOString()}] Abort for ${userId}`);
                unsubscribe();
                await leave();
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                // }, 3000);
            }, { once: true });
        }

        return () => {
            console.log(`[${new Date().toISOString()}] Cleanup for ${userId}`);
            unsubscribe();
            leave();
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    });
}