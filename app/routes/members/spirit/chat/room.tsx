// app/routes/chat.$roomId.tsx
import { useCallback, useEffect, useState } from "react";
import { data, useFetcher, useRouteLoaderData } from "react-router";
import { getMessages, addMessage, getRoom, type ChatMessage, getRoomStatus } from "~/utils/chat.server";
import { Form } from "react-router";
import type { Route } from "./+types/room";
import { IoMdSend } from "react-icons/io";
import { prisma } from "~/db.server";
import { useChatSubscription } from "./useChatStream";
import { getUserId } from "~/middleware/sessionMiddleware";

export function headers(_: Route.HeadersArgs) {
    return {
        "Cache-Control": "no-store",
        "Content-Type": "text/html",
    };
}

export async function loader({ params }: Route.LoaderArgs) {
    const { roomId } = params;
    if (!roomId) throw data({ message: "Room ID missing" }, { status: 400 });

    const [messages, room, { message: statusMsg, status }] = await Promise.all([
        getMessages(roomId), getRoom(roomId), getRoomStatus(roomId)]);
    return { messages, room, status, statusMsg };
};


export async function action({ request, params, context }: Route.ActionArgs) {

    const formData = await request.formData();
    // todo: Tempoprarily clear chat 
    if (request.method === "DELETE") {
        console.log('delete')
        await prisma.message.deleteMany({ where: { roomId: params.roomId as string } });
        // return redirect(href("/members/spirit/live/chat/:roomId", { roomId: params.roomId }));
        return { success: true };
    }
    const text = formData.get("text") as string;
    const roomId = params.roomId as string;
    const userId = getUserId(context);
    if (!text || !roomId) {
        return { error: "Text and roomId are required" };
    }

    const message = await addMessage(roomId, text, userId);
    return { success: true, message };
};


export default function ChatRoom({ loaderData, params }: Route.ComponentProps) {
    const { messages: initialMessages, room, status, statusMsg } = loaderData;
    const user = useRouteLoaderData("root")?.user;
    const currentUserId = user?.id;
    const [isActiveRoom, setIsActiveRoom] = useState(Boolean(status === "active"))
    const { liveMessages, participantCount, isFetching } = useChatSubscription(params.roomId, initialMessages, setIsActiveRoom);
    const fetcher = useFetcher()

    // Combine initial and live messages
    const allMessages = [...initialMessages, ...liveMessages].filter((mdg, index, self) =>
        index === self.findIndex(m => m.id === mdg.id)).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    const formRef = useCallback((node: HTMLFormElement | null) => {
        if (node && fetcher.data?.success) {
            node.reset();
        }
    }, [fetcher.data]);


    const handleLeave = async () => {
        try {
            const response = await fetch("/api/chat/leave", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ roomId: params.roomId, userId: user.id }),
            });
            if (!response.ok) throw new Error("Failed to leave chat");
            const data = await response.json();
            console.log(`Left chat successfully. New count: ${data.count}`);
            return data.count;
        } catch (error) {
            console.error("Error leaving chat:", error);
            throw error
        }
    };

    useEffect(() => {
        if (!isActiveRoom) return;
        const leaveChat = async () => {
            await handleLeave();
        };
        return () => {
            leaveChat();
        };
    }, [isActiveRoom]);

    if (!room) return <div>Room not found</div>




    return (

        <main className="p-4 text-center">
            {isFetching && (
                <div className="fixed top-4 left-0 right-0 p-2 px-6 z-[1000] mx-auto">
                    <div role="alert" className="badge badge-primary opacity-90 shadow p-4 md:w-fit mx-auto">
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-accent animate-ping"></div>
                            <div className="status status-accent"></div>
                        </div>
                        <span>Buscando mensajes</span>
                    </div>
                </div>
            )}
            <h1 className="text-3xl text-center mb-3">Chat en directo: {room?.name}</h1>
            <div className="mb-4">
                <p className={`text-lg ${isActiveRoom ? 'text-success' : "text-warning"}`}>
                    {isActiveRoom ? "Sesión Activa" : "Sesión Inactiva"}
                </p>
                <p>
                    {statusMsg}
                </p>
            </div>
            <Form method="DELETE" className="mb-4">
                <button className="btn btn-error btn-outline" type="submit">Clear chat</button>
            </Form>
            {isActiveRoom && <div className="mb-4">Participantes <span className="badge badge-primary">{participantCount}</span></div>}
            {allMessages.length > 0 ?
                <div className="flex-1 w-full md:w-3/4 mx-auto overflow-y-auto border rounded-lg mb-16">
                    {allMessages.map((message) => (
                        <Message
                            key={message.id}
                            message={message as ChatMessage}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
                :
                <p>No hay mensajes todavía.</p>
            }

            {isActiveRoom && (
                <fetcher.Form method="post" ref={formRef} className="fixed bottom-0 left-0 right-0 px-4 pb-4 mx-auto z-50 flex justify-center items-center gap-2 mb-4 max-w-xl">
                    <label className="floating-label w-full">
                        <span>Mensaje</span>
                        <input type="text" name="text" className="input input-lg w-full input-primary" placeholder="Mensaje" required />
                    </label>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={fetcher.state === "submitting"}>
                        <IoMdSend size={24} />
                    </button>
                    {fetcher.data?.error &&
                        <span>{fetcher.data.error}</span>}
                </fetcher.Form>
            )}
        </main>

    );
}


function Message({ message, currentUserId }: { message: ChatMessage, currentUserId: string }) {
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    // Check if this message is from the current user
    const isCurrentUser = message?.user?.id === currentUserId;

    return (
        <div
            className={`w-full p-3 chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}
            ref={ref}
        >
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img
                        alt="Tailwind CSS chat bubble component"
                        src={message.user?.profile?.avatar || "/avatars/girl.jpg"}
                    />
                </div>
            </div>
            <div className="chat-header">
                {message?.user?.username}
                <time className="text-xs opacity-50">
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </time>
            </div>
            <div className="chat-bubble chat-bubble-primary">{message.text}</div>
        </div>
    );
}