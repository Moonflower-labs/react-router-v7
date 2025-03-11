import { redisPublisher } from "~/integrations/redis/service.server";
import type { Route } from "./+types/leave";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function action({ request, context }: Route.ActionArgs) {
    const userId = getSessionContext(context).get("userId");
    // Parse URL-encoded body directly from request
    const text = await request.text();
    const body = new URLSearchParams(text);
    const roomId = body.get("roomId")?.toString();


    if (!roomId) {
        throw new Response("roomId is required", { status: 400 });
    }
    const participantKey = `room:${roomId}:participants`;
    const channel = `chat:${roomId}`;
    const streamKey = `room:${roomId}:stream:${userId}`;

    // Remove user from participant set
    const removed = await redisPublisher.sRem(participantKey, userId);
    const count = await redisPublisher.sCard(participantKey);


    if (removed > 0) {
        console.info(`[${new Date().toISOString()}] Left ${userId} via /chat/leave. Removed: ${removed}, New Count: ${count}`);
        // Publish updated count to all clients
        await redisPublisher.publish(channel, JSON.stringify({ event: "participants", data: count }));
    } else {
        console.error(`[${new Date().toISOString()}] Failed to remove ${userId} from ${participantKey}`);
    }

    // Clean up stream key
    await redisPublisher.del(streamKey);

    return Response.json({ success: true, count });
}