// app/routes/chat.$roomId.tsx
import { useEventSource } from "remix-utils/sse/react";
import { useCallback, useEffect, useState } from "react";
import { data, href, redirect, useFetcher, useRevalidator, useRouteLoaderData } from "react-router";
import { getMessages, addMessage, getRoom } from "~/utils/chat.server";
import { Form } from "react-router";
import type { Route } from "./+types/room";
import { IoMdSend } from "react-icons/io";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/db.server";
import type { User } from "~/models/user.server";

export function headers(_: Route.HeadersArgs) {
    return {
        "Cache-Control": "no-store",
        "Content-Type": "text/html",
    };
}

export async function loader({ params }: Route.LoaderArgs) {
    const { roomId } = params;
    if (!roomId) throw data({ message: "Room ID missing" }, { status: 400 });

    // const canAccess = await canAccessRoom(roomId);
    // if (!canAccess) {
    //     const { message } = await getRoomStatus(roomId);
    //     throw new Response(message, { status: 403 });
    // }
    const [messages, room] = await Promise.all([getMessages(roomId), getRoom(roomId)]);
    return { messages, room };

};

type Message = {
    id: string;
    text: string;
    createdAt: Date;
    roomId: string;
    user: User;
};

export async function action({ request, params }: Route.ActionArgs) {

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
    const userId = await getUserId(request);
    if (!text || !roomId) {
        return { error: "Text and roomId are required" };
    }

    const message = await addMessage(roomId, text, userId);
    return { success: true, message };
};

export default function ChatRoom({ loaderData, params }: Route.ComponentProps) {
    const { messages: initialMessages, room } = loaderData;
    const { user } = useRouteLoaderData("root");
    const currentUserId = user?.id;
    const [liveMessages, setLiveMessages] = useState<Message[]>([]); // Only for SSE updates
    const [isReconnecting, setIsReconnecting] = useState(false);
    const fetcher = useFetcher()
    const revalidator = useRevalidator();
    const lastMessage = useEventSource(`/chat/subscribe?roomId=${params.roomId}`, {
        event: "new-message",
    });
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
    const now = new Date().getTime();
    if (!room) return <div>Room not found</div>
    const startTime = new Date(room.session.startDate).getTime();
    const endTime = new Date(room.session.endDate).getTime();

    const isSessionActive = Boolean(now >= startTime && now <= endTime);

    useEffect(() => {
        if (lastMessage) {
            const newMessage = JSON.parse(lastMessage) as Message;
            setLiveMessages((prev) => {
                if (!prev.some((m) => m.id === newMessage.id) && !initialMessages.some((m) => m.id === newMessage.id)) {
                    return [...prev, newMessage];
                }
                return prev;
            });
        };
        // Handle visibility change (phone lock)
        // const handleVisibilityChange = () => {
        //     if (document.visibilityState === "visible" && revalidator.state === "idle") {
        //         revalidator.revalidate(); // Sync messages after unlock
        //         setLiveMessages([]); // Reset live messages to avoid duplicates after revalidation
        //     }
        // };

        // document.addEventListener("visibilitychange", handleVisibilityChange);

        // return () => {
        //     document.removeEventListener("visibilitychange", handleVisibilityChange);
        // };
    }, [lastMessage, revalidator, initialMessages]); // Include initialMessages to react to loader updates



    // Handle visibility change (phone lock)
    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;

        const handleReconnect = () => {
            if (document.visibilityState === "visible" && revalidator.state === "idle") {
                setIsReconnecting(true);
                console.log('attempting to reconnect...');

                if (reconnectTimeout) clearTimeout(reconnectTimeout);

                reconnectTimeout = setTimeout(() => {
                    revalidator.revalidate();
                    setLiveMessages([]); // Reset live messages to avoid duplicates
                    console.log('route revalidated');
                    setIsReconnecting(false);
                }, 1500);
            }
        };

        window.addEventListener('online', handleReconnect);
        document.addEventListener('visibilitychange', handleReconnect);

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            window.removeEventListener('online', handleReconnect);
            document.removeEventListener('visibilitychange', handleReconnect);
        };
    }, [revalidator]);

    return (

        <main className="p-4 text-center">
            {isReconnecting && (
                <div className="fixed top-4 left-0 right-0 p-2 px-6 z-[1000] mx-auto">
                    <div role="alert" className="alert alert-warning md:w-fit mx-auto">
                        <div className="inline-grid *:[grid-area:1/1]">
                            <div className="status status-accent animate-ping"></div>
                            <div className="status status-accent"></div>
                        </div>
                        <span>Reconectando...</span>
                    </div>

                </div>
            )}
            <h1 className="text-3xl text-center mb-3">Chat en directo: {room?.name}</h1>
            <div className="mb-4">
                <p className={`text-lg ${isSessionActive ? 'text-success' : 'text-error'}`}>
                    {isSessionActive ? 'Sesión Activa' : 'Sesión Inactiva'}
                </p>
                <p>
                    Comienza:
                    {new Date(room.session.startDate).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </p>
                <p>
                    Finaliza:
                    {new Date(room.session.endDate).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </p>
            </div>
            <Form method="DELETE" className="mb-4">
                <button className="btn btn-error btn-outline" type="submit">Clear chat</button>
            </Form>
            {allMessages.length > 0 ?
                <div className="flex-1 w-full md:w-3/4 mx-auto overflow-y-auto border rounded-lg mb-16">
                    {allMessages.map((message) => (
                        <Message
                            key={message.id}
                            message={message as Message}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
                :
                <p>No hay mensajes todavía.</p>
            }

            {isSessionActive && (
                <fetcher.Form method="post" ref={formRef} className="fixed bottom-0 left-0 right-0 px-4 pb-4 mx-auto z-50 flex justify-center items-center gap-2 mb-4">
                    <label className="floating-label w-full">
                        <span>Mensaje</span>
                        <input type="text" name="text" className="input input-lg w-full input-primary" placeholder="Mensaje" required />
                    </label>
                    <button type="submit" className="btn btn-primary btn-lg">
                        <IoMdSend size={24} />
                    </button>
                    {fetcher.data?.error &&
                        <span>{fetcher.data.error}</span>}
                </fetcher.Form>
            )}
        </main>

    );
}


function Message({ message, currentUserId }: { message: Message, currentUserId: string }) {
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    // Check if this message is from the current user
    const isCurrentUser = message.user.id === currentUserId;

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
                {message.user.username}
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