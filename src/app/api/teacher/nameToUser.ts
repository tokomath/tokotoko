"use server";
import { User } from "@prisma/client";
import { prisma } from "../prisma_client";

export const nameToUser = async (teacherName: string): Promise<User | null> => {
  const teacher = await prisma.user.findUnique({
    where: {
      name: teacherName,
    },
  });
  return teacher;
}
