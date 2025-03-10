import { href, unstable_createContext, unstable_RouterContextProvider, type Session } from "react-router";
import { getUserById, type User } from "~/models/user.server";
import { sessionStorage } from "./session.server";
import type { Route } from "../+types/root";
import { getUserId } from "./session.server";

const sessionContext = unstable_createContext<Session>();
const userContext = unstable_createContext<User | null>();

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  context.set(sessionContext, session);

  let response = await next();
  const excludedUrls = [href("/register"), href("/login"), href("/logout"), /^\/api(\/|$)/, href("/chat/stream")];
  const url = new URL(request.url);
  if (!excludedUrls.includes(url.pathname)) {
    response.headers.append("Set-Cookie", await sessionStorage.commitSession(session));
  }

  return response;
};

export function getSessionContext(context: unstable_RouterContextProvider) {
  return context.get(sessionContext);
}

export const userMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }) => {
  const userId = await getUserId(request);
  const user = await getUserById(userId);
  //   If user is logged in pass it through the context
  context.set(userContext, user);
};

export function getUserContext(context: unstable_RouterContextProvider) {
  return context.get(userContext);
}
