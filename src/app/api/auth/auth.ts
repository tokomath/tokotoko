"use server";

import { prisma } from "@/app/api/prisma_client";

export const teacherAuth = async (userid: string) => {
  const user = await prisma.user.findUnique(
    {
      where: {
        id: userid,
        role: 0,
      },
    }
  );
  console.log(name)
  console.log(user)
  return user !== null
};

export const studentAuth = async (userid: string) => {
  const user = prisma.user.findUnique(
    {
      where: {
        id: userid,
        role: 1,
      },
    }
  );
  return user !== null
};
