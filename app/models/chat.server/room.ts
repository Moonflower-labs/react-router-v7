import { prisma } from "~/db.server";

export interface CreateRoomProps {
  name: string;
  sessionId: string;
}

export const createRoom = async (data: CreateRoomProps) => {
  return await prisma.room.create({
    data: {
      name: data.name
    }
  });
};
