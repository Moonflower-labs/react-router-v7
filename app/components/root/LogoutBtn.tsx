import React from "react";
import { href, useFetcher } from "react-router";

export const LogoutBtn = React.memo(() => {
  const fetcher = useFetcher();
  const isLoggingOut = fetcher.formData != null;

  return (
    <fetcher.Form method="post" action={href("/logout")} className="flex justify-center w-full">
      <button className="btn btn-sm btn-outline btn-secondary w-full" type="submit" disabled={isLoggingOut}>
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

