import { Form } from "react-router";
import { prisma } from "~/db.server";
import type { Route } from "./+types/index";
import { useCallback } from "react";


export const handle = {
    links: [{ to: "/spirit#videos", name: "Videos" }, { to: "/spirit#podcasts", name: "Podcasts" }, { to: "/spirit/question", name: "Pregunta" }, { to: "/spirit/live", name: "Sesión en directo" }, { to: "/spirit/live/chat", name: "Live Chat" }]
}

export async function loader({ params }: Route.LoaderArgs) {
    if (params.roomId) {
        //   check for room in prisma
        // if 
    }
    const messages = await prisma.message.findMany({
        orderBy: {
            createdAt: "asc",
        },
    });

    return { messages };
}




export default function Index({ actionData, params }: Route.ComponentProps) {


    return (
        <div className="h-screen flex flex-col px-2">
            <div className="text-center p-8 text-primary text-4xl  font-semibold">
                Live Chat
            </div>
            <Form>
                <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 w-full max-w-4xl mx-auto z-50">
                    <label className="input input-bordered shadow-sm flex items-center gap-2">
                        <input
                            className="grow text-xl"
                            type="text"
                            name="text"
                            placeholder="Send a message"
                        />
                        <button type="submit" name="roomId" value={params.roomId}>
                            <svg
                                className="stroke-primary/60 w-6 h-6 fill-primary/60"
                                viewBox="0 0 32 32"
                            >
                                <path d="M4.667 26.307v-7.983l17.143-2.304-17.143-2.304v-7.983l24 10.285z" />
                            </svg>
                        </button>
                    </label>
                </div>
            </Form>
        </div>
    );
}

function Message({ text }: { text: string }) {
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            node.scrollIntoView({ behavior: "smooth" });
        }
    }, []);


    return (
        <div className="w-full p-3 chat even:chat-start odd:chat-end" ref={ref}>
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    <img
                        alt="Tailwind CSS chat bubble component"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
            </div>
            <div className="chat-header">
                Anonymous user
                <time className="text-xs opacity-50"> 12:45</time>
            </div>
            <div className="chat-bubble chat-bubble-primary">{text}</div>
        </div>
    );
}