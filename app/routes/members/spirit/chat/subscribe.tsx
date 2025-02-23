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
            send({ event: "new-message", data: JSON.stringify(message) });
        });

        return unsubscribe;
    });
};