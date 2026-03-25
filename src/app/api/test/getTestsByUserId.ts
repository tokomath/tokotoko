"use server"

import { prisma } from "@/app/api/prisma_client"

export async function getTestsByUserId(userid: string) {
  const res = await prisma.test.findMany({
    where: { 
      isPublished: true, 
      classes: { some: { users: { some: { id: userid } } } }
    },
  });

  return res;
}