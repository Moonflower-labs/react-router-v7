import { EventEmitter } from "events";
import { remember } from "@epic-web/remember";
import {
  redisPublisher,
  redisSubscriber
} from "~/integrations/redis/service.server";

export const emitter = remember("emitter", () => new EventEmitter());

// When receiving from Redis, emit to local EventEmitter
redisSubscriber.subscribe("chat", message => {
  const parsedMessage = JSON.parse(message);
  // Add source flag when emitting locally
  emitter.emit("chat", { ...parsedMessage, source: "redis" });
});

// When receiving from local EventEmitter, publish to Redis
emitter.on("chat", message => {
  // Only publish to Redis if the message didn't come from Redis
  if (message.source !== "redis") {
    console.log("emitter", message.id);
    // Remove the source flag before publishing
    const { source, ...messageWithoutSource } = message;
    redisPublisher.publish("chat", JSON.stringify(messageWithoutSource));
  }
});
