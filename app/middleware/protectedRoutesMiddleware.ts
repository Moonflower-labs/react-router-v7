import { href, redirect } from "react-router";
import type { Route } from "../+types/root";
import { getSessionContext } from "./sessionMiddleware";

const PROTECTED_URLS = [href("/logout"), /^\/(api|admin|members)(\/|$)/, href("/chat/stream")];

export const protectedRouteMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  const currentPath = new URL(request.url).pathname;

  if (isProtectedPath(currentPath, PROTECTED_URLS)) {
    console.info("PROTECTED ROUTE");
    let userId = getSessionContext(context).get("userId");
    if (!userId || userId.startsWith("guest-")) {
      const searchParams = new URLSearchParams([["redirectTo", currentPath]]);
      throw redirect(`${href("/login")}?${searchParams}`);
    }
  }
};

function isProtectedPath(path: string, protectedUrls: (string | RegExp)[]): boolean {
  return protectedUrls.some(url => (url instanceof RegExp ? url.test(path) : url === path));
}
