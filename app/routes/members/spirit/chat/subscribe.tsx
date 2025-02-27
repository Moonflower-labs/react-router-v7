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
        // const clientId = crypto.randomUUID();
        console.log(`[${new Date().toISOString()}] Stream started for ${userId}`);

        const join = async () => {
            await redisPublisher.sAdd(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);
            await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
            console.log(`[${new Date().toISOString()}] Joined ${userId}. Count: ${count}`);
        };

        const leave = async () => {
            await redisPublisher.sRem(participantKey, userId);
            const count = await redisPublisher.sCard(participantKey);
            await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
            console.log(`[${new Date().toISOString()}] Left ${userId}. Count: ${count}`);
        };

        const unsubscribe = subscribeToMessages(roomId, (message) => {
            send({ event: message.event, data: String(message.data) });
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
            console.error(`[${new Date().toISOString()}] Immediate abort for ${userId}`);
            unsubscribe();
            leave();
        } else {
            join();
            request.signal.addEventListener("abort", () => {
                console.warn(`[${new Date().toISOString()}] Abort for ${userId}`);
                unsubscribe();
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

// unsubscribe();
// clearInterval(cleanupInterval);
// clearInterval(heartbeatInterval);
// const heartbeatInterval = setInterval(() => {
//     const payload = JSON.stringify({ time: Date.now(), message: "ping" });
//     send({ event: "heartbeat", data: payload });
// }, 5000);
// Heartbeat cleanup
// const cleanupInterval = setInterval(async () => {
//     const count = await redisPublisher.sCard(participantKey);
//     await redisPublisher.publish(
//         channel,
//         JSON.stringify({ event: "participants", data: count })
//     );
//     console.log(`[${new Date().toISOString()}] Active count: ${count}`);
// }, 5000); // Update every 5s
// export async function loaderOld({ request }: Route.LoaderArgs) {
//     const url = new URL(request.url);
//     const roomId = url.searchParams.get("roomId");
//     if (!roomId) {
//         throw new Response("roomId is required", { status: 400 });
//     }
//     return createEventStream(request, roomId);
// }

// async function createEventStream(request: Request, roomId: string) {
//     const participantKey = `room:${roomId}:participants`;
//     const channel = `chat:${roomId}`;
//     const clientId = crypto.randomUUID();

//     return eventStream(request.signal, (send) => {
//         console.log(`[${new Date().toISOString()}] Stream started for ${clientId}`);

//         const join = async () => {
//             await redisPublisher.sAdd(participantKey, clientId);
//             const count = await redisPublisher.sCard(participantKey);
//             await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//             console.log(`[${new Date().toISOString()}] Joined ${clientId}. Count: ${count}`);
//         };

//         const leave = async () => {
//             await redisPublisher.sRem(participantKey, clientId);
//             const count = await redisPublisher.sCard(participantKey);
//             await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
//             console.log(`[${new Date().toISOString()}] Left ${clientId}. Count: ${count}`);
//         };

//         const unsubscribe = subscribeToMessages(roomId, (message) => {
//             send({ event: message.event, data: String(message.data) });
//         });

//         let lastActivity = Date.now();
//         const heartbeatInterval = setInterval(async () => {
//             const timeSinceLastActivity = Date.now() - lastActivity;
//             if (timeSinceLastActivity > 30000) {
//                 console.log(`[${new Date().toISOString()}] Timeout for ${clientId}`);
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
//             console.log(`[${new Date().toISOString()}] Immediate abort for ${clientId}`);
//             unsubscribe();
//             leave();
//         } else {
//             join();
//             request.signal.addEventListener("abort", () => {
//                 console.log(`[${new Date().toISOString()}] Abort for ${clientId}`);
//                 unsubscribe();
//                 leave();
//                 clearInterval(heartbeatInterval);
//             }, { once: true });
//         }

//         return () => {
//             console.log(`[${new Date().toISOString()}] Cleanup for ${clientId}`);
//             unsubscribe();
//             leave().catch((err) => console.error(`Cleanup failed for ${clientId}:`, err));
//             clearInterval(heartbeatInterval);
//         };
//     });
// }

// export async function loader1({ request }: Route.LoaderArgs) {
//     const url = new URL(request.url);
//     const roomId = url.searchParams.get("roomId");

//     if (!roomId) {
//         throw new Response("roomId is required", { status: 400 });
//     }

//     return eventStream(request.signal, (send) => {
//         const unsubscribe = subscribeToMessages(roomId, (message) => {
//             // Differentiate event types
//             if (message.event === "participants") {
//                 send({ event: "participants", data: JSON.stringify({ count: message.data }) });
//             } else {
//                 send({ event: "new-message", data: JSON.stringify(message) });
//             }
//         });

//         const heartbeatInterval = setInterval(() => {
//             const payload = JSON.stringify({ time: Date.now(), message: "ping" });
//             send({ event: "heartbeat", data: payload });
//         }, 5000);

//         // attempting to catch a page reload
//         if (request.signal.aborted) {
//             console.log("Signal aborted");
//             unsubscribe();
//         }

//         const handleAbort = () => {
//             if (request.signal.aborted) {
//                 console.log("Client disconnected via abort signal");
//                 unsubscribe()
//             }
//         }
//         request.signal.addEventListener("abort", handleAbort, { once: true })

//         return () => {
//             unsubscribe();
//             clearInterval(heartbeatInterval);
//         };
//     });
// };


// import { eventStream } from "remix-utils/sse/server";
// import { subscribeToMessages } from "~/utils/chat.server";
// import type { Route } from "./+types/subscribe";

// export async function loader({ request }: Route.LoaderArgs) {
//     const url = new URL(request.url);
//     const roomId = url.searchParams.get("roomId");
//     if (!roomId) {
//         throw new Response("roomId is required", { status: 400 });
//     }

//     return eventStream(request.signal, (send) => {
//         const unsubscribe = subscribeToMessages(roomId, (message) => {
//             // Differentiate event types
//             if (message.event === "participants") {
//                 send({ event: "participants", data: JSON.stringify({ count: message.data }) });
//             } else {
//                 send({ event: "new-message", data: JSON.stringify(message) });
//             }
//         });

//         const heartbeatInterval = setInterval(() => {
//             const payload = JSON.stringify({ time: Date.now(), message: "ping" });
//             send({ event: "heartbeat", data: payload });
//         }, 5000);

//         // attempting to catch a page reload
//         if (request.signal.aborted) {
//             console.log("Signal aborted");
//             unsubscribe();
//         }

//         const handleAbort = () => {
//             if (request.signal.aborted) {
//                 console.log("Client disconnected via abort signal");
//                 unsubscribe()
//             }
//         }
//         request.signal.addEventListener("abort", handleAbort, { once: true })

//         return () => {
//             unsubscribe();
//             clearInterval(heartbeatInterval);
//         };
//     });
// };