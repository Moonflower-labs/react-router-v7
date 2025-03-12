import { unstable_createContext, unstable_RouterContextProvider } from "react-router";
import { getUserById, type User } from "~/models/user.server";
import type { Route } from "../+types/root";
import { getUserId } from "~/middleware/sessionMiddleware";

const userContext = unstable_createContext<User | null>();

// This middleware gets the user and pass it through the context
export const userMiddleware: Route.unstable_MiddlewareFunction = async ({ context }) => {
  const userId = getUserId(context); // we use the session context that runs before
  const user = await getUserById(userId);
  //   If user is logged in pass it through the context
  context.set(userContext, user);
};

export function getUserContext(context: unstable_RouterContextProvider) {
  return context.get(userContext);
}
