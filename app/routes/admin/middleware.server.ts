import { getUserIdWithRole } from "~/utils/session.server";
import type { Route } from "../../+types/root";
import { redirect, href } from "react-router";

export const adminAuth: Route.unstable_MiddlewareFunction = async ({ request }) => {
  const { isAdmin } = await getUserIdWithRole(request);
  if (isAdmin) {
    return;
  }
  throw redirect(href("/"), 302);
};
