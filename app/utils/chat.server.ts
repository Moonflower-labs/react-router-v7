import { prisma } from "~/db.server";
import {
  redisPublisher,
  redisSubscriber
} from "~/integrations/redis/service.server";

const DEMO_USER_ID = "demo-user-id";

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

export function subscribeToMessages(
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
  return await prisma.session.findMany({ include: { room: true } });
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
