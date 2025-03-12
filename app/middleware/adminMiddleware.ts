import type { Route } from "../+types/root";
import { redirect, href } from "react-router";
import { getUserIdWithRole } from "./sessionMiddleware";

// todo: implement this logic into the auth middleware

export const adminAuthMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }) => {
  const { isAdmin } = getUserIdWithRole(context);
  if (isAdmin) {
    return;
  }
  throw redirect(href("/"), 302);
};
