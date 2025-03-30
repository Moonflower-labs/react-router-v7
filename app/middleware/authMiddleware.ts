import { href, redirect } from "react-router";
import type { Route } from "../+types/root";
import { getUserId, getUserIdWithRole } from "./sessionMiddleware";

const PROTECTED_URLS = [
  /^\/(api(?!\/webhook)|admin|members)(\/|$)/, // Exclude webhook as must be public!
  href("/chat/stream")
];

/**
 * Middleware that provides user protected routes.
 *
 * Configurable by adding routes to the PROTECTED_URLS array
 *
 * Checks for the userId in the context.
 */
export const authMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  const currentPath = new URL(request.url).pathname;

  // Admin routes
  if (currentPath.startsWith("/admin")) {
    const { isAdmin } = getUserIdWithRole(context);
    if (isAdmin) {
      console.log("Allowed by auth!");
      return undefined;
    }
    throw redirect(href("/"), 302);
  }
  // User protected routes
  if (isProtectedPath(currentPath, PROTECTED_URLS)) {
    console.info("PROTECTED ROUTE");
    const userId = getUserId(context);
    if (!userId || userId.startsWith("guest-")) {
      const searchParams = new URLSearchParams([["redirectTo", currentPath]]);
      throw redirect(`${href("/login")}?${searchParams}`, 302);
    }
  }
  return next();
};

function isProtectedPath(path: string, protectedUrls: (string | RegExp)[]): boolean {
  return protectedUrls.some(url => (url instanceof RegExp ? url.test(path) : url === path));
}
