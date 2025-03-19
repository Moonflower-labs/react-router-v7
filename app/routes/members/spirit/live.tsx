import { href, Link } from "react-router";
import type { Route } from "./+types/live";
import { getSessions } from "~/utils/chat.server";
import { BsTelegram } from "react-icons/bs";
import { formatDayTimeEs } from "~/utils/format";
import { FaRegComment } from "react-icons/fa6";
import { formatDate } from "date-fns";

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
        <div key={session.id} className="card shadow-sm max-w-3xl mx-auto mb-4 border border-base-300">
          <div className="card-body">
            <span className="absolute top-4 right-4 badge shadow">{formatDate(session.startDate, "d/m/yy h:mm a")}</span>
            <h2 className="card-title pt-6">{session.name}</h2>
            <p className="p-4">{session.description}</p>
            <div className="mb-2">
              <p>Horario del chat en directo</p>
              <p>{formatDate(session.startDate, "h:mm a")}-{formatDate(session.endDate, "h:mm a")}</p>
            </div>
            <div className="card-actions justify-end">
              <a href={session.link} target="_blank" rel="noreferrer" className="btn btn-primary">Enlace a la sesión <BsTelegram size={24} /></a>
              <Link key={session.id} to={href("/members/spirit/live/chat/:roomId", { roomId: session.room?.id as string })} className="btn btn-info">
                Chat en directo <FaRegComment size={24} />
              </Link>
            </div>
          </div>
        </div>
      )) : <p>No hay sesiones en directo todavía.</p>}
    </div>
  );
}
