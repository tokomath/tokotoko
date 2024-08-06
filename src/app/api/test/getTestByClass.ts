"use server"
import { prisma } from "../prisma_client";

// no info about sections ...
export const getTestByClass = async (classId: number) => {
  return prisma.test.findMany({
    where: {
      classes: {
        some: {
          id: classId,
        },
      },
    },
  });
};
