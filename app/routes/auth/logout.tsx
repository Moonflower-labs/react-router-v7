import { redirect } from "react-router";
import { logout } from "~/utils/session.server";
import type { Route } from "./+types/logout";

export function loader() {
  return redirect("/");
}

export async function action({ request }: Route.LoaderArgs) {
  return logout(request);
}
