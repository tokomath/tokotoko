"use server";

import { prisma } from "@/app/api/prisma_client";

export async function getUsersFromQuery(query: string,role:number) {
  if (!query) return [];

  return await prisma.user.findMany({
    where: {
      role: role,
      OR: [
        {
          email: {
            contains: query,
          },
        },
        {
          name: {
            contains: query,
          },
        },
      ],
    },
    take: 10,
  });
}
