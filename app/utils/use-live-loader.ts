import { useEffect } from "react";
import { useLoaderData, useResolvedPath, useRevalidator } from "react-router";
import { useEventSource } from "remix-utils/sse/react";

export function useLiveLoader<T>() {
  const path = useResolvedPath("./stream");
  const data = useEventSource(path.pathname);

  const { revalidate } = useRevalidator();

  useEffect(() => {
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "we know better" — Moishi
  }, [data]);

  return useLoaderData<T>();
}
