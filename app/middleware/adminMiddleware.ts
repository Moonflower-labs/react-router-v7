import { getUserIdWithRole } from "~/utils/session.server";
import type { Route } from "../+types/root";
import { redirect, href } from "react-router";

// todo: implement this logic into the auth middleware

export const adminAuthMiddleware: Route.unstable_MiddlewareFunction = async ({ request }) => {
  const { isAdmin } = await getUserIdWithRole(request);
  if (isAdmin) {
    return;
  }
  throw redirect(href("/"), 302);
};
