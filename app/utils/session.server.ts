import { createCookieSessionStorage } from "react-router";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

/**
 *  The cookie session storage for the app
 */
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__lfb_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production"
  }
});
