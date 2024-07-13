"use server";

import { prisma } from "@/app/api/prisma_client";

export const getAllStudent = async () => {
  return prisma.user.findMany(
    {
      where: {
        role: 1,
      },
    }
  );
};
