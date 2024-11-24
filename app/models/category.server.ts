import { prisma } from "~/db.server";

export async function fetchCategories() {
  return prisma.category.findMany();
}

export async function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function editCategory(id: string, name: string) {
  return prisma.category.update({ where: { id }, data: { name } });
}
