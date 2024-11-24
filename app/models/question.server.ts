import { data } from "react-router";
import { prisma } from "~/db.server";

export async function getQuestions({ section, page = 1, pageSize = 10 }: { section?: string | null; page: number; pageSize: number }) {
  // Add pagination
  const take = pageSize; // The number of items to return
  const skip = (Number(page) - 1) * pageSize; // Number of items to skip for pagination

  let questions;
  if (!section) {
    questions = await prisma.question.findMany({ take, skip });
  } else {
    questions = await prisma.premiumQuestion.findMany({
      where: { section },
      take,
      skip
    });
  }
  const totalCount = await prisma.question.count({
    where: {}
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { questions, pagination: { totalCount, totalPages, page, pageSize } };
}

export async function getQuestionCount({ userId, section }: { userId: string; section: string }) {
  switch (section) {
    case "basic": {
      return prisma.profile.findUnique({
        where: { userId },
        select: { basicQuestionCount: true }
      });
    }
    case "live": {
      return prisma.profile.findUnique({
        where: { userId },
        select: { liveQuestionCount: true }
      });
    }
    case "tarot": {
      return prisma.profile.findUnique({
        where: { userId },
        select: { tarotQuestionCount: true }
      });
    }
    default:
      throw data({ message: "Unknown section" }, { status: 400 });
  }
}

export async function createBasicQuestion({ userId, data }: { userId: string; data: Record<string, any> }) {
  return prisma.question.create({
    data: {
      userId,
      name: data.name,
      subject: data.subject,
      text: data.text,
      media: data.media,
      ageGroup: data.ageGroup,
      gender: data.gender,
      country: data.country,
      city: data.city
    }
  });
}

export async function createPremiumQuestion({ userId, data, section }: { userId: string; data: Record<string, any>; section: "live" | "tarot" }) {
  return prisma.premiumQuestion.create({
    data: {
      userId,
      name: data.name,
      text: data.text,
      info: data.info,
      section
    }
  });
}

export async function incrementQuestionCount({ userId, questionType, count }: { userId: string; questionType: string; count: number }) {
  switch (questionType) {
    case "basic": {
      return prisma.profile.update({
        where: { userId: userId },
        data: { basicQuestionCount: count }
      });
    }
    case "tarot": {
      return prisma.profile.update({
        where: { userId: userId },
        data: { tarotQuestionCount: count }
      });
    }
    case "live": {
      return prisma.profile.update({
        where: { userId: userId },
        data: { liveQuestionCount: count }
      });
    }
    default:
      throw data({ message: "Unknown section" }, { status: 400 });
  }
}

export async function deleteQuestion(id: string, premium?: boolean) {
  if (!premium) {
    return prisma.question.delete({ where: { id } });
  }
  return prisma.premiumQuestion.delete({ where: { id } });
}
