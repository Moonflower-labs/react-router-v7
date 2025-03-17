import {
  href,
  redirect,
  unstable_createContext,
  unstable_RouterContextProvider,
  type Session,
  type SessionData
} from "react-router";
import type { Route } from "../+types/root";
import { sessionStorage } from "~/utils/session.server";
import { randomUUID } from "crypto";
import type { User } from "~/models/user.server";

const sessionContext = unstable_createContext<Session>();

const USER_SESSION_KEY = "userId";

const EXCLUDED_URLS = [
  // href("/logout"), // Exclude to avoid commiting the destroyed session
  /^\/api(\/|$)/,
  href("/chat/stream")
];

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async ({ request, context }, next) => {
  let start = performance.now();
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  const url = new URL(request.url);
  // Handle logout before reaching the action
  if (url.pathname === href("/logout")) {
    console.log("LOGOUT VIA MIDDLEWARE");
    let duration = performance.now() - start;
    console.log(`Navigated to ${request.url} (${duration.toFixed(2)}ms)`);
    throw redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session)
      }
    });
  }

  let initialData = structuredClone(session.data);

  context.set(sessionContext, session);

  let response = await next();

  if (shouldCommitSession(initialData, structuredClone(session.data), url.pathname)) {
    const remember = context.get(sessionContext).get("remember");

    response.headers.append(
      "Set-Cookie",
      await sessionStorage.commitSession(session, {
        maxAge: Boolean(remember === "on")
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined
      })
    );
  }
  let duration = performance.now() - start;
  console.log(`Navigated to ${request.url} (${duration.toFixed(2)}ms)`);

  return response;
};

// Only commit the session if data changed and the path is not in the excluded list
function shouldCommitSession(prev: Partial<SessionData>, next: Partial<SessionData>, path: string) {
  if (!isExcludedPath(path, EXCLUDED_URLS)) {
    // compare the initial data with next data
    return JSON.stringify(prev) !== JSON.stringify(next) ? true : false;
  }

  return false;
}

function isExcludedPath(path: string, excludedUrls: (string | RegExp)[]): boolean {
  return excludedUrls.some(url => (url instanceof RegExp ? url.test(path) : url === path));
}

// Util to get the session from the context
export function getSessionContext(context: unstable_RouterContextProvider) {
  return context.get(sessionContext);
}

// Util to only get the id from the context
export function getUserId(context: unstable_RouterContextProvider) {
  return context.get(sessionContext).get(USER_SESSION_KEY);
}
export function setGuestId(session: Session) {
  const guestId = `guest-${randomUUID()}`;
  session.set(USER_SESSION_KEY, guestId);
  return session;
}

export function getUserIdWithRole(context: unstable_RouterContextProvider): {
  userId: User["id"] | undefined;
  isAdmin: Boolean;
} {
  const session = getSessionContext(context);
  const userId = session.get(USER_SESSION_KEY);
  const isAdmin = session.get("isAdmin") ?? false;
  return { userId, isAdmin };
}

export async function logout(context: unstable_RouterContextProvider) {
  const session = getSessionContext(context);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
