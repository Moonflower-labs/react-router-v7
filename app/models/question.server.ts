import { data } from "react-router";
import { prisma } from "~/db.server";
import type { Question, PremiumQuestion as PrismaPremiumQuestion } from "@prisma/client";
import type { User } from "./user.server";

export interface BasicQuestion extends Question {
  user?: User;
}

export interface PremiumQuestion extends PrismaPremiumQuestion {
  user?: User;
}

export async function getQuestions({
  section,
  page = 1,
  pageSize = 10
}: {
  section?: string | null;
  page: number;
  pageSize: number;
}) {
  // Add pagination
  const take = pageSize; // The number of items to return
  const skip = (Number(page) - 1) * pageSize; // Number of items to skip for pagination

  let questions;
  let totalCount = 0;
  if (!section || section === "basic") {
    questions = await prisma.question.findMany({
      take,
      skip,
      include: { user: { select: { username: true } } }
    });
    totalCount = await prisma.question.count();
  } else {
    questions = await prisma.premiumQuestion.findMany({
      where: { section },
      include: { user: { select: { username: true } } },
      take,
      skip
    });
    totalCount = await prisma.premiumQuestion.count({
      where: { section: section as string }
    });
  }

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

export async function createPremiumQuestion({
  userId,
  data,
  section
}: {
  userId: string;
  data: Record<string, any>;
  section: "live" | "tarot";
}) {
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

export async function incrementQuestionCount({
  userId,
  questionType,
  count
}: {
  userId: string;
  questionType: string;
  count: number;
}) {
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

export async function getUserQuestions(userId: string) {
  const [basic, tarot, live] = await Promise.all([
    prisma.question.findMany({ where: { userId } }),
    prisma.premiumQuestion.findMany({ where: { userId, section: "tarot" } }),
    prisma.premiumQuestion.findMany({ where: { userId, section: "live" } })
  ]);
  return { basic, tarot, live };
}
