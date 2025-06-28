"use server";

import { prisma } from "@/app/api/prisma_client";


/* role 0 = teacher / 1 = student */
export const teacherAuth = async (userid: string) => {
  const user = await prisma.user.findUnique(
    {
      where: {
        id: userid,
        role: 0,
      },
    }
  );
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
