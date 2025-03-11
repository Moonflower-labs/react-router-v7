import {
  href,
  unstable_createContext,
  unstable_RouterContextProvider,
  type Session,
  type SessionData
} from "react-router";
import type { Route } from "../+types/root";
import { sessionStorage } from "~/utils/session.server";

const sessionContext = unstable_createContext<Session>();

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
