import { href, redirect } from "react-router";
import type { Route } from "../+types/root";
import { getUserId } from "./sessionMiddleware";

const PROTECTED_URLS = [
  // href("/logout"),
  /^\/(api(?!\/webhooks)|admin|members)(\/|$)/, // Exclude webhooks as must be public !
  href("/chat/stream")
];

export const protectedRouteMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  const currentPath = new URL(request.url).pathname;

  if (isProtectedPath(currentPath, PROTECTED_URLS)) {
    console.info("PROTECTED ROUTE");
    const userId = getUserId(context);
    if (!userId || userId.startsWith("guest-")) {
      const searchParams = new URLSearchParams([["redirectTo", currentPath]]);
      throw redirect(`${href("/login")}?${searchParams}`, 302);
    }
  }
};

function isProtectedPath(path: string, protectedUrls: (string | RegExp)[]): boolean {
  return protectedUrls.some(url => (url instanceof RegExp ? url.test(path) : url === path));
}
