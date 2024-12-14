import { createEventStream } from "~/utils/create-event-stream.server";
import type { Route } from "./+types/stream";

export async function loader({ request }: Route.LoaderArgs) {
    return createEventStream(request, "chat");
}