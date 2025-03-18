import { createClient } from "redis";

// Create and configure the Redis client
export const redisPublisher = createClient({ url: process.env.REDIS_URL });
export const redisSubscriber = createClient({ url: process.env.REDIS_URL });

redisPublisher.on("error", err => console.error("Redis Publisher Error:", err));
redisSubscriber.on("error", err => console.error("Redis Subscriber Error:", err));

redisPublisher.on("connect", () => console.log("redis publisher connected"));
redisPublisher.on("disconnect", () => console.log("publisher disconnected"));
redisSubscriber.on("connect", () => console.log("redis Subscriber connected"));
redisSubscriber.on("disconnect", () => console.log("Subscriber disconnected"));

export async function connectRedis() {
  if (!redisPublisher.isOpen) await redisPublisher.connect();
  if (!redisSubscriber.isOpen) await redisSubscriber.connect();
}
// Connect the clients on server start
// (async () => {
//   await redisPublisher.connect();
//   await redisSubscriber.connect();
// })();
