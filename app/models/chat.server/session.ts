import { prisma } from "~/db.server";

interface CreateSessionProps {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
}
export const createSession = async (data: CreateSessionProps) => {
  return await prisma.session.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description
    }
  });
};

export const editSession = async (data: CreateSessionProps) => {
  return await prisma.session.update({
    where: { id: data.id },
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description
    }
  });
};

export const deleteSession = async (id: string) => {
  return await prisma.session.delete({ where: { id } });
};

export const getSession = async (id: string) => {
  return await prisma.session.findUnique({
    where: {
      id
    }
  });
};

export const getSessions = async () => {
  return await prisma.session.findMany();
};
