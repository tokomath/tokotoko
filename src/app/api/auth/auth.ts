"use server";

import { prisma } from "@/app/api/prisma_client";

export const teacherAuth = async (name: string) => {
  const user = await prisma.user.findUnique(
    {
      where: {
        name: name,
        role: 0,
      },
    }
  );
  console.log(name)
  console.log(user)
  return user !== null
};

export const studentAuth = async (name: string) => {
  const user = prisma.user.findUnique(
    {
      where: {
        name: name,
        role: 1,
      },
    }
  );
  return user !== null
};
