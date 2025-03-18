import { prisma } from "~/db.server";
import { redisPublisher, redisSubscriber } from "~/integrations/redis/service.server";
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

/**
 *
 *  Saves the chat message to the db and publish it to the `chat:${roomId}` channel.
 *
 * @param roomId  The roomId route param
 * @param text  The string with the message
 * @param userId The user id
 * @returns the new created message
 */
export async function addMessage(roomId: string, text: string, userId: string = DEMO_USER_ID) {
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

export function subscribeToMessages(roomId: string, callback: (message: any) => void) {
  const channel = `chat:${roomId}`;

  const handleMessage = (message: string, ch: string) => {
    if (ch === channel) {
      try {
        callback(JSON.parse(message));
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to parse message on ${channel}:`, error);
      }
    }
  };

  // Subscribe
  redisSubscriber.subscribe(channel, handleMessage);

  // Return cleanup function
  return () => {
    redisSubscriber.unsubscribe(channel, handleMessage);
    console.log(`[${new Date().toISOString()}] Unsubscribed from ${channel}`);
  };
}

interface CreateSessionProps {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  link: string;
}

export async function createLiveSession(data: CreateSessionProps) {
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
  const session = await prisma.session.update({
    where: { id: data.id },
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      link: data.link
    },
    include: { room: true }
  });
  //  Update also room name
  if (session?.room?.id) {
    await prisma.room.update({
      where: { id: session.room.id },
      data: {
        name: data.name
      }
    });
  }

  return session;
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
  if (!room?.session) return { status: "closed", message: "No hay sesión asociada" };

  const now = new Date();
  const startDate = new Date(room.session.startDate);
  const endDate = new Date(room.session.endDate);

  if (now < startDate) {
    return {
      status: "pending",
      message: `Sesión comienza el ${startDate.toLocaleString()}`,
      endDate
    };
  } else if (now > endDate) {
    return {
      status: "closed",
      message: `Sesión finalizó el ${endDate.toLocaleString()}`,
      endDate
    };
  } else {
    return {
      status: "active",
      message: `Sesión finaliza ${endDate.toLocaleString()}`,
      endDate
    };
  }
}
