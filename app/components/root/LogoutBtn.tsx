import { useFetcher } from "react-router";

export function LogoutBtn() {
  const fetcher = useFetcher();
  const isLoggingOut = fetcher.formData != null;

  return (
    <fetcher.Form method="post" action="/logout" className="flex justify-center w-full">
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
}
