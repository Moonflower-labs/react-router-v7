import {
  href,
  unstable_createContext,
  unstable_RouterContextProvider,
  type Session,
  type SessionData
} from "react-router";
import { getUserById, type User } from "~/models/user.server";
import { sessionStorage } from "./session.server";
import type { Route } from "../+types/root";
import { getUserId } from "./session.server";

const sessionContext = unstable_createContext<Session>();
const userContext = unstable_createContext<User | null>();

const EXCLUDED_URLS = [href("/register"), href("/login"), href("/logout"), /^\/api(\/|$)/, href("/chat/stream")];

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  let initialData = structuredClone(session.data);

  context.set(sessionContext, session);

  let response = await next();

  const url = new URL(request.url);

  if (shouldCommitSession(initialData, structuredClone(session.data), url.pathname)) {
    response.headers.append("Set-Cookie", await sessionStorage.commitSession(session));
  }
  return response;
};

// Only commit the session if data changed and the path is not in the excluded list
function shouldCommitSession(prev: Partial<SessionData>, next: Partial<SessionData>, path: string) {
  if (!EXCLUDED_URLS.includes(path)) {
    // compare the initial data with next data
    return JSON.stringify(prev) !== JSON.stringify(next) ? true : false;
  }

  return false;
}

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
