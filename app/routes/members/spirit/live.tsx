import { href, Link } from "react-router";
import type { Route } from "./+types/live";
import { getSessions } from "~/utils/chat.server";
import { BsTelegram } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import { formatDayTimeEs } from "~/utils/format";

export async function loader({ }: Route.LoaderArgs) {
  return { sessions: await getSessions() };

}

export default function LiveSessions({ loaderData }: Route.ComponentProps) {
  const { sessions } = loaderData;


  return (
    <div className="text-center pt-4 px-1">
      <h1 className="text-4xl mb-4">Sesiones en directo</h1>
      <p className="mb-3 max-w-4xl mx-auto px-2">Aquí encontrarás los enlaces a las sesiones en directo via Telegram, y también accederás a un chat en el que podrás comentar durante la sesión en directo.</p>

      {sessions.length > 0 ? sessions.map((session) => (
        <div key={session.id} className="p-2 rounded-lg shadow-sm max-w-3xl mx-auto mb-4 border border-base-300">
          <h2 className="text-xl font-bold flex justify-between px-4"><span>{session.name}</span> <span>{formatDayTimeEs(session.startDate)}</span></h2>
          <p className="p-4">{session.description}</p>
          <p className="mb-2">Comienza: {formatDayTimeEs(session.startDate)}</p>
          <p className="mb-2">Finaliza: {formatDayTimeEs(session.endDate)}</p>
          <a href={session.link} target="_blank" rel="noreferrer" className="link link-primary mb-2 flex justify-center items-center gap-2"><span>Enlace a la sesión</span> <BsTelegram size={24} /></a>
          <p className="flex gap-2 justify-center items-center mb-2">Chat en directo: <IoChatboxEllipses size={24} /></p>
          <Link key={session.id} to={href("/members/spirit/live/chat/:roomId", { roomId: session.room?.id as string })} className="link link-primary">
            {session?.name}
          </Link>
        </div>
      )) : <p>No hay sesiones en directo todavía.</p>}
    </div>
  );
}
