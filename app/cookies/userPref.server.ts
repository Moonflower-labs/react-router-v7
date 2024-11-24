import { createCookie, data } from "react-router";

const prefCookie = createCookie("userPref", {
  maxAge: 60 * 60 * 24 * 365 // 1 year
});

export async function getUserPrefs(request: Request) {
  const cookieHeader = await request.headers.get("cookie");
  return (await prefCookie.parse(cookieHeader)) || {};
}

export async function setUserPrefs(request: Request, userPrefs: Record<string, unknown>) {
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
