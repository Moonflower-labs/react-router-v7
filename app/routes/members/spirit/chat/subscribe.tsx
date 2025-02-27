import { eventStream } from "remix-utils/sse/server";
import { subscribeToMessages } from "~/utils/chat.server";
import type { Route } from "./+types/subscribe";
import { redisPublisher } from "~/integrations/redis/service.server";
import { requireUserId } from "~/utils/session.server";


export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    if (!roomId) {
        throw new Response("roomId is required", { status: 400 });
    }
    const userId = await requireUserId(request)
    const participantKey = `room:${roomId}:participants`;
    const channel = `chat:${roomId}`;

    return eventStream(request.signal, (send) => {
        console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

        const join = async () => {
            await redisPublisher.sAdd(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);
            await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
            console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
        };

        const leave = async () => {
            const removed = await redisPublisher.sRem(participantKey, userId);
            if (removed > 0) { // Only publish if user was actually removed
                const count = await redisPublisher.sCard(participantKey);
                await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
                console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
            }
        };

        const unsubscribe = subscribeToMessages(roomId, (message) => {
            // Differentiate event types
            if (message.event === "participants") {
                send({ event: "participants", data: JSON.stringify({ count: message.data }) });
            } else {
                send({ event: "new-message", data: JSON.stringify(message) });
            }
        });

        let lastActivity = Date.now();
        const heartbeatInterval = setInterval(async () => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (timeSinceLastActivity > 30000) {
                console.log(`[${new Date().toISOString()}] Timeout for ${userId}`);
                unsubscribe();
                await leave();
                clearInterval(heartbeatInterval);
            } else if (timeSinceLastActivity > 2000) {
                send({ event: "heartbeat", data: String(Date.now()) });
            }
        }, 2000);

        const originalSend = send;
        send = (event) => {
            lastActivity = Date.now();
            originalSend(event);
        };


        if (request.signal.aborted) {
            console.log(`[${new Date().toISOString()}] Immediate abort for ${userId}`);
            unsubscribe();
            leave();
        } else {
            join();
            request.signal.addEventListener("abort", () => {
                console.log(`[${new Date().toISOString()}] Abort for ${userId}`);
                unsubscribe();
                leave();
                clearInterval(heartbeatInterval);
            }, { once: true });
        }

        return () => {

            console.log(`[${new Date().toISOString()}] Cleanup for ${userId}`);
            unsubscribe();
            leave().catch((err) => console.error(`Cleanup failed for ${userId}:`, err));
            clearInterval(heartbeatInterval);
        };
    });
}