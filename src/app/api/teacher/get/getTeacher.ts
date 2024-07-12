"use server";
import { prisma } from "../../prisma_client";

export const getAllTeachers = async () => {
  return prisma.teacher.findMany();
};
