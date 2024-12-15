import { eventStream } from "remix-utils/sse/server";
import { emitter } from "./emitter.server";

export function createEventStream(request: Request, eventName: string) {
  return eventStream(request.signal, send => {
    const handle = (message: any) => {
      if (message.source !== "redis") {
        send({
          // event: "new-message",
          data: JSON.stringify(message.id)
        });
      }
    };

    emitter.on(eventName, handle);

    return () => {
      emitter.off(eventName, handle);
    };
  });
}
