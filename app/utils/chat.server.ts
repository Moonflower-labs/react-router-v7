import { prisma } from "~/db.server";
import {
  redisPublisher,
  redisSubscriber
} from "~/integrations/redis/service.server";
import type { User } from "~/models/user.server";

const DEMO_USER_ID = "demo-user-id";

export type ChatMessage = {
  id: string;
  text: string;
  createdAt: Date;
  roomId: string;
  user: User;
};

export async function getRooms() {
  return await prisma.room.findMany({ include: { session: true } });
}
export async function getRoom(id: string) {
  return await prisma.room.findUnique({
    where: { id },
    include: { session: true }
  });
}

export async function createRoom(name: string, sessionId: string) {
  return prisma.room.create({ data: { name, sessionId } });
}

export async function getMessages(roomId: string) {
  return prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: { user: { include: { profile: true } } }
  });
}

export async function getMissedMessages(roomId: string, since: string) {
  const sinceDate = new Date(since);
  if (isNaN(sinceDate.getTime())) {
    throw new Error("Invalid 'since' timestamp");
  }
  return prisma.message.findMany({
    where: { roomId, createdAt: { gt: sinceDate } },
    orderBy: { createdAt: "asc" },
    include: { user: { include: { profile: true } } }
  });
}

export async function addMessage(
  roomId: string,
  text: string,
  userId: string = DEMO_USER_ID
) {
  const message = await prisma.message.create({
    data: {
      text,
      roomId,
      userId
    },
    include: { user: { include: { profile: true } } }
  });

  const channel = `chat:${roomId}`;
  await redisPublisher.publish(channel, JSON.stringify(message));
  return message;
}

export function subscribeToMessages1(
  roomId: string,
  callback: (message: any) => void
) {
  const channel = `chat:${roomId}`;

  const handleMessage = (message: string, ch: string) => {
    if (ch === channel) {
      callback(JSON.parse(message));
    }
  };

  redisSubscriber.subscribe(channel, handleMessage);
  return () => redisSubscriber.unsubscribe(channel, handleMessage);
}

export function subscribeToMessages(
  roomId: string,
  callback: (message: any) => void
) {
  const channel = `chat:${roomId}`;
  const participantKey = `room:${roomId}:participants`;
  const clientId = crypto.randomUUID();

  const handleMessage = (message: string, ch: string) => {
    if (ch === channel) {
      callback(JSON.parse(message));
    }
  };

  redisPublisher.sAdd(participantKey, clientId).then(async () => {
    const count = await redisPublisher.sCard(participantKey);
    redisPublisher.publish(
      channel,
      JSON.stringify({ event: "participants", data: count })
    );
  });

  redisSubscriber.subscribe(channel, handleMessage);

  return () => {
    redisSubscriber.unsubscribe(channel, handleMessage);
    redisPublisher.sRem(participantKey, clientId).then(async () => {
      const count = await redisPublisher.sCard(participantKey);
      redisPublisher.publish(
        channel,
        JSON.stringify({ event: "participants", data: count })
      );
    });
  };
}
export function subscribeToMessagesgood(
  roomId: string,
  callback: (message: any) => void
) {
  const channel = `chat:${roomId}`;
  const participantKey = `room:${roomId}:participants`;
  const clientId = crypto.randomUUID(); // Unique identifier for this client

  const handleMessage = (message: string, ch: string) => {
    if (ch === channel) {
      callback(JSON.parse(message));
    }
  };

  // Add client to participants set with a 30-second expiration
  const updateParticipants = async () => {
    await redisPublisher.sAdd(participantKey, clientId);
    await redisPublisher.expire(participantKey, 30); // Set expiration to clean up stale entries
    const count = await redisPublisher.sCard(participantKey);
    await redisPublisher.publish(
      channel,
      JSON.stringify({ event: "participants", data: count })
    );
  };

  // Initial subscription and participant update
  redisSubscriber.subscribe(channel, handleMessage);
  updateParticipants();

  // Heartbeat to keep participant active
  const heartbeatInterval = setInterval(updateParticipants, 20000); // Refresh every 20s
  return () => {
    clearInterval(heartbeatInterval);
    redisSubscriber.unsubscribe(channel, handleMessage);
    redisPublisher.sRem(participantKey, clientId).then(async () => {
      const count = await redisPublisher.sCard(participantKey);
      redisPublisher.publish(
        channel,
        JSON.stringify({ event: "participants", data: count })
      );
    });
  };
}

export async function ensureDemoUser() {
  const user = await prisma.user.findUnique({ where: { username: "demo" } });
  if (!user) {
    await prisma.user.create({
      data: { username: "demo", email: "demo@demo.es" }
    });
  }
  return prisma.user.findUnique({ where: { username: "demo" } });
}

interface CreateSessionProps {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  link: string;
}

export async function createSession(data: CreateSessionProps) {
  if (data.endDate <= data.startDate) {
    throw new Error("End date must be after start date");
  }
  const session = await prisma.session.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      link: data.link
    }
  });

  const room = await createRoom(session.name, session.id);
  return { session, room };
}

export async function editSession(data: CreateSessionProps) {
  return await prisma.session.update({
    where: { id: data.id },
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      link: data.link
    }
  });
}

export async function deleteSession(id: string) {
  return await prisma.session.delete({ where: { id } });
}

export async function getSession(id: string) {
  return await prisma.session.findUnique({
    where: {
      id
    }
  });
}

export async function getSessions() {
  return await prisma.session.findMany({
    include: { room: true },
    orderBy: { startDate: "desc" }
  });
}

export async function getActiveSessions() {
  const now = new Date();
  return prisma.session.findMany({
    where: { startDate: { lte: now }, endDate: { gte: now } }
  });
}

export async function canAccessRoom(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { session: true }
  });
  if (!room?.session) return true; // Non-session rooms are always accessible

  const now = new Date();
  const startDate = new Date(room.session.startDate);
  const endDate = new Date(room.session.endDate);

  return now >= startDate && now <= endDate;
}

export async function getRoomStatus(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { session: true }
  });
  if (!room?.session) return { status: "open", message: "Room is always open" };

  const now = new Date();
  const startDate = new Date(room.session.startDate);
  const endDate = new Date(room.session.endDate);

  if (now < startDate) {
    return {
      status: "pending",
      message: `Room opens at ${startDate.toLocaleString()}`
    };
  } else if (now > endDate) {
    return {
      status: "closed",
      message: `Room closed at ${endDate.toLocaleString()}`
    };
  } else {
    return { status: "active", message: "Room is open" };
  }
}
