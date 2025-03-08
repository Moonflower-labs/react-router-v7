import { unstable_createContext } from "react-router";
import { getUserById, type User } from "~/models/user.server";
import type { Route } from "../+types/root";
import { getSession, getUserId, type Session } from "./session.server";

export const userContext = unstable_createContext<User | null>();
export const sessionContext = unstable_createContext<Session>();

export const sessionMiddleware: Route.unstable_MiddlewareFunction = async ({
  request,
  context
}) => {
  const session = await getSession(request);
  // Pass the session through the context
  context.set(sessionContext, session);
  console.info("Session set");
};

export const userMiddleware: Route.unstable_MiddlewareFunction = async ({
  request,
  context
}) => {
  const userId = await getUserId(request);
  const user = await getUserById(userId);
  //   If user is logged in pass it through the context
  context.set(userContext, user);
  console.info("User set");
};
