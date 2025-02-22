import { href, Link } from "react-router";
import type { Route } from "./+types/live";

export async function loader({ }: Route.LoaderArgs) {
  // return all sessions avaliable
  return {};

}

export default function LiveSessions({ loaderData }: Route.ComponentProps) {

  return (
    <div className="text-center pt-5 px-1">
      <h1 className="text-4xl">Sesiones en directo</h1>
      <p className="mb-3">Aquí encontrarás los enlaces a las sesiones</p>
      <div className="p-2 rounded-lg shadow-sm w-96 mx-auto mb-4 border">
        <Link to={href("/members/spirit/live/chat/:roomId", { roomId: loaderData as string })} className="link link-primary">
          Sessión del 10/9/2014
        </Link>
      </div>
    </div>
  );
}
