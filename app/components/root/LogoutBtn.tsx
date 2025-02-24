import React from "react";
import { href, useFetcher } from "react-router";

export const LogoutBtn = React.memo(() => {
  const fetcher = useFetcher();
  const isLoggingOut = fetcher.formData != null;

  return (
    <fetcher.Form method="post" action={href("/logout")} className="flex justify-center px-0">
      <button className="btn btn-xs btn-primary w-full" type="submit" disabled={isLoggingOut}>
        {isLoggingOut ? (
          <>
            Logging out
            <span className="loading loading-infinity loading-md"></span>
          </>
        ) : (
          "Log Out"
        )}
      </button>
    </fetcher.Form>
  );
})

