"use server"

import { prisma } from "@/app/api/prisma_client"

export async function getTestsByUserId(userid: string) {
  const user = await prisma.user.findUnique({
    where: { id: userid },
    select: { role: true }, 
  });

  if (!user) {
    return []; 
  }


  const isStudent = user.role === 1;

  const res = await prisma.test.findMany({
    where: {
      classes: { some: { users: { some: { id: userid } } } },
      ...(isStudent ? { isPublished: true } : {}),
    },
  });

  return res;
}