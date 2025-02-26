import { eventStream } from "remix-utils/sse/server";
import { subscribeToMessages } from "~/utils/chat.server";
import type { Route } from "./+types/subscribe";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    if (!roomId) {
        throw new Response("roomId is required", { status: 400 });
    }

    return eventStream(request.signal, (send) => {
        const unsubscribe = subscribeToMessages(roomId, (message) => {
            // Differentiate event types
            if (message.event === "participants") {
                send({ event: "participants", data: JSON.stringify({ count: message.data }) });
            } else {
                send({ event: "new-message", data: JSON.stringify(message) });
            }
        });

        const heartbeatInterval = setInterval(() => {
            const payload = JSON.stringify({ time: Date.now(), message: "ping" });
            send({ event: "heartbeat", data: payload });
        }, 5000);

        const handleAbort = () => {
            if (request.signal.aborted) {
                console.log("Client disconnected via abort signal");
                unsubscribe()
            }
        }
        request.signal.addEventListener("abort", handleAbort, { once: true })

        return () => {
            unsubscribe();
            clearInterval(heartbeatInterval);
        };
    });
};