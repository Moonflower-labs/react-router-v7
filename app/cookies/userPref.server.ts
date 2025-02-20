import { createCookie, data } from "react-router";

export const prefCookie = createCookie("userPref", {
  maxAge: 60 * 60 * 24 * 365 // 1 year,
});

export async function getUserPrefs(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookie = (await prefCookie.parse(cookieHeader)) || {};
  return cookie;
}

export async function setUserPrefs(
  request: Request,
  userPrefs: Record<string, unknown>
) {
  const existingPrefs = await getUserPrefs(request);
  const updatedPrefs = { ...existingPrefs, ...userPrefs };
  return data(
    { success: true },
    {
      headers: {
        "Set-Cookie": await prefCookie.serialize(updatedPrefs)
      }
    }
  );
}
