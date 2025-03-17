import { getMissedMessages } from "~/utils/chat.server";
import type { Route } from "./+types/missed";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    const since = url.searchParams.get("since");

    if (!roomId || !since) {
        throw new Response("Missing roomId or since", { status: 400 });
    }
    // fetch missed messages from db and return them
    const missedMessages = await getMissedMessages(roomId, since);
    console.log(missedMessages)
    return Response.json(missedMessages);
}

