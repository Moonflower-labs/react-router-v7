import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { logout } from "~/middleware/sessionMiddleware";

export function loader({ }: Route.LoaderArgs) {
  return redirect("/");
}

export async function action({ context }: Route.ActionArgs) {

  return logout(context);
}
