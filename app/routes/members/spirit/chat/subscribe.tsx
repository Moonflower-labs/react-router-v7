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
    const userId = await requireUserId(request);
    const userIdFromUrl = url.searchParams.get("userId");
    if (userIdFromUrl && userIdFromUrl !== userId) {
        throw new Response("User ID mismatch", { status: 403 });
    }
    const participantKey = `room:${roomId}:participants`;
    const channel = `chat:${roomId}`;
    const streamId = crypto.randomUUID();
    const streamKey = `room:${roomId}:stream:${userId}:${streamId}`;
    const streamPrefix = `room:${roomId}:stream:${userId}:`;

    // Deduplicate before eventStream (async OK here)
    redisPublisher.keys(`${streamPrefix}*`).then(existingStreams => {
        if (existingStreams.length > 0) {
            const oldStreams = existingStreams.filter(key => key !== streamKey);
            if (oldStreams.length > 0) {
                console.log(`[${new Date().toISOString()}] Existing streams detected for ${userId}, terminating ${oldStreams.length} old streams`);
                Promise.all(oldStreams.map(key => redisPublisher.del(key))).catch(err => 
                    console.error(`[${new Date().toISOString()}] Failed to delete old streams:`, err)
                );
            }
        }
    }).catch(err => console.error(`[${new Date().toISOString()}] Failed to check existing streams:`, err));

    return eventStream(request.signal, (send) => {
        console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

        const join = async () => {
            await redisPublisher.sAdd(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);
            await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
            console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
            await redisPublisher.set(streamKey, "active", { PX: 15000 });
            if ((await redisPublisher.get(streamKey)) !== "active") {
                console.error(`[${new Date().toISOString()}] Failed to set ${streamKey}`);
            }
        };

        const leave = async () => {
            const removed = await redisPublisher.sRem(participantKey, userId);
            if (removed > 0) {
                const count = await redisPublisher.sCard(participantKey);
                await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
                console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
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
                heartbeatInterval = setInterval(() => {
                    redisPublisher.get(streamKey).then(streamActive => {
                        if (!streamActive) {
                            console.log(`[${new Date().toISOString()}] Stream expired for ${userId}`);
                            unsubscribe();
                            leave();
                            clearInterval(heartbeatInterval);
                        } else if (Date.now() - lastActivity > 2000) {
                            send({ event: "heartbeat", data: String(Date.now()) });
                            redisPublisher.set(streamKey, "active", { PX: 15000 }).catch(err => 
                                console.error(`[${new Date().toISOString()}] Failed to refresh ${streamKey}:`, err)
                            );
                        }
                    }).catch(err => console.error(`[${new Date().toISOString()}] Failed to get ${streamKey}:`, err));
                }, 2000);
            }, 2000); // 2s delay to ensure join completes

            let abortTimeout: NodeJS.Timeout | undefined;
            request.signal.addEventListener("abort", () => {
                clearTimeout(abortTimeout);
                abortTimeout = setTimeout(() => {
                    console.log(`[${new Date().toISOString()}] Abort for ${userId}`);
                    unsubscribe();
                    leave();
                    if (heartbeatInterval) clearInterval(heartbeatInterval);
                }, 3000);
            }, { once: true });
        }

        return () => {
            console.log(`[${new Date().toISOString()}] Cleanup for ${userId}`);
            unsubscribe();
            leave().catch(err => console.error(`Cleanup failed for ${userId}:`, err));
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    });
}


// export async function loader1({ request }: Route.LoaderArgs) {
//     const url = new URL(request.url);
//     const roomId = url.searchParams.get("roomId");
//     if (!roomId) {
//         throw new Response("roomId is required", { status: 400 });
//     }
//     const userId = await requireUserId(request);
//     const userIdFromUrl = url.searchParams.get("userId");
//     if (userIdFromUrl && userIdFromUrl !== userId) {
//         throw new Response("User ID mismatch", { status: 403 });
//     }
//     const participantKey = `room:${roomId}:participants`;
//     const channel = `chat:${roomId}`;
//     const streamId = crypto.randomUUID();
//     const streamKey = `room:${roomId}:stream:${userId}:${streamId}`;
//     const streamPrefix = `room:${roomId}:stream:${userId}:`;
    
//     const existingStreams = await redisPublisher.keys(`${streamPrefix}*`);
//     if (existingStreams.length > 0) {
//         console.log(`[${new Date().toISOString()}] Existing streams detected for ${userId}, terminating ${existingStreams.length} old streams`);
//         await Promise.all(existingStreams.map(key => redisPublisher.del(key)));
//     }

//     return eventStream(request.signal,  (send) => {
//         console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

//         const join = async () => {
//             await redisPublisher.sAdd(participantKey, userId);
//             const count = await redisPublisher.sCard(participantKey);
//             await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//             console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
//             let setSuccess = false;
//             for (let i = 0; i < 3 && !setSuccess; i++) {
//                 await redisPublisher.set(streamKey, "active", { PX: 15000 });
//                 setSuccess = (await redisPublisher.get(streamKey)) === "active";
//                 if (!setSuccess) await new Promise(resolve => setTimeout(resolve, 100));
//             }
//             if (!setSuccess) console.error(`[${new Date().toISOString()}] Failed to set ${streamKey}`);
//         };

//         const leave = async () => {
//             const removed = await redisPublisher.sRem(participantKey, userId);
//             if (removed > 0) {
//                 const count = await redisPublisher.sCard(participantKey);
//                 await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//                 console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
//             }
//             await redisPublisher.del(streamKey);
//         };

//         const unsubscribe = subscribeToMessages(roomId, (message) => {
//             if (message.event === "participants") {
//                 send({ event: "participants", data: JSON.stringify({ count: message.data }) });
//             } else {
//                 send({ event: "new-message", data: JSON.stringify(message) });
//             }
//         });

//         let lastActivity = Date.now();
//         let initialCheck = true;
//         const heartbeatInterval = setInterval(async () => {
//             if (initialCheck && Date.now() - lastActivity < 5000) {
//                 initialCheck = false;
//                 return; // Skip first check if < 5s
//             }
//             initialCheck = false;
//             const streamActive = await redisPublisher.get(streamKey);
//             if (!streamActive) {
//                 console.log(`[${new Date().toISOString()}] Stream expired for ${userId}`);
//                 unsubscribe();
//                 await leave();
//                 clearInterval(heartbeatInterval);
//             } else if (Date.now() - lastActivity > 2000) {
//                 send({ event: "heartbeat", data: String(Date.now()) });
//                 await redisPublisher.set(streamKey, "active", { PX: 15000 });
//             }
//         }, 2000);

//         const originalSend = send;
//         send = (event) => {
//             lastActivity = Date.now();
//             originalSend(event);
//         };

//         if (request.signal.aborted) {
//             console.log(`[${new Date().toISOString()}] Immediate abort for ${userId}`);
//             unsubscribe();
//             leave();
//             clearInterval(heartbeatInterval);
//         } else {
//             join();
//             request.signal.addEventListener("abort", () => {
//                 console.log(`[${new Date().toISOString()}] Abort for ${userId}`);
//                 unsubscribe();
//                 leave();
//                 clearInterval(heartbeatInterval);
//             }, { once: true });
//         }

//         return () => {
//             console.log(`[${new Date().toISOString()}] Cleanup for ${userId}`);
//             unsubscribe();
//             leave().catch((err) => console.error(`Cleanup failed for ${userId}:`, err));
//             clearInterval(heartbeatInterval);
//         };
//     });
// }

// export async function loaderOld({ request }: Route.LoaderArgs) {
//     const url = new URL(request.url);
//     const roomId = url.searchParams.get("roomId");
//     if (!roomId) {
//         throw new Response("roomId is required", { status: 400 });
//     }
//     const userId = await requireUserId(request)
    
//     const participantKey = `room:${roomId}:participants`;
//     const channel = `chat:${roomId}`;

//     return eventStream(request.signal, (send) => {
//         console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

//         const join = async () => {
//             await redisPublisher.sAdd(participantKey, userId);
//             const count = await redisPublisher.sCard(participantKey);
//             await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//             console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
//         };

//         const leave = async () => {
//             const removed = await redisPublisher.sRem(participantKey, userId);
//             if (removed > 0) { // Only publish if user was actually removed
//                 const count = await redisPublisher.sCard(participantKey);
//                 await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//                 console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
//             }
//         };

//         const unsubscribe = subscribeToMessages(roomId, (message) => {
//             // Differentiate event types
//             if (message.event === "participants") {
//                 send({ event: "participants", data: JSON.stringify({ count: message.data }) });
//             } else {
//                 send({ event: "new-message", data: JSON.stringify(message) });
//             }
//         });

//         let lastActivity = Date.now();
//         const heartbeatInterval = setInterval(async () => {
//             const timeSinceLastActivity = Date.now() - lastActivity;
//             if (timeSinceLastActivity > 10000) { // 10s timeout instead of 30s
//                 console.log(`[${new Date().toISOString()}] Timeout for ${userId}`);
//                 unsubscribe();
//                 await leave();
//                 clearInterval(heartbeatInterval);
//             } else if (timeSinceLastActivity > 2000) {
//                 send({ event: "heartbeat", data: String(Date.now()) });
//             }
//         }, 2000);

//         const originalSend = send;
//         send = (event) => {
//             lastActivity = Date.now();
//             originalSend(event);
//         };


//         if (request.signal.aborted) {
//             console.log(`[${new Date().toISOString()}] Immediate abort for ${userId}`);
//             unsubscribe();
//             leave();
//         } else {
//             join();
//             request.signal.addEventListener("abort", () => {
//                 console.log(`[${new Date().toISOString()}] Abort for ${userId}`);
//                 unsubscribe();
//                 leave();
//                 clearInterval(heartbeatInterval);
//             }, { once: true });
//         }

//         return () => {

//             console.log(`[${new Date().toISOString()}] Cleanup for ${userId}`);
//             unsubscribe();
//             leave().catch((err) => console.error(`Cleanup failed for ${userId}:`, err));
//             clearInterval(heartbeatInterval);
//         };
//     });
// }