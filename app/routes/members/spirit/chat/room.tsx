// app/routes/chat.$roomId.tsx
import { useEventSource } from "remix-utils/sse/react";
import { useCallback, useEffect, useState } from "react";
import { data, redirect, useFetcher } from "react-router";
import { getMessages, addMessage, getRoom } from "~/utils/chat.server";
import { Form } from "react-router";
import type { Route } from "./+types/room";
import { IoMdSend } from "react-icons/io";
import { getUserId } from "~/utils/session.server";
import { prisma } from "~/db.server";
import type { User } from "~/models/user.server";

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
        return redirect("/");
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
    const [messages, setMessages] = useState(initialMessages);
    const fetcher = useFetcher()

    const lastMessage = useEventSource(`/chat/subscribe?roomId=${params.roomId}`, {
        event: "new-message",
    });
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
            setMessages((prev: any) => [...prev, newMessage]);
        }
    }, [lastMessage]);

    return (

        <main className="p-4 text-center">
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
            {messages.length > 0 ?
                <div className="flex-1 w-full md:w-3/4 mx-auto overflow-y-auto border rounded-lg mb-16">
                    {messages.map((message) => (
                        <Message key={message.id} message={message as Message} />
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



function Message({ message }: { message: Message }) {
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            node.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, []);

    return (
        <div className="w-full p-3 chat even:chat-start odd:chat-end" ref={ref}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img
                        alt="Tailwind CSS chat bubble component"
                        src={message.user?.profile?.avatar || "/avatars/girl.jpg"} />
                </div>
            </div>
            <div className="chat-header">
                {message.user.username}
                <time className="text-xs opacity-50">{new Date(message.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</time>
            </div>
            <div className="chat-bubble chat-bubble-primary">{message.text}</div>
        </div>
    );
}