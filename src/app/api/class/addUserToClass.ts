"use server";

import { Class, User } from "@prisma/client";
import { prisma } from "../prisma_client";
import { ClassFrame } from "@/app/api/class/createClass";

export const addUserToClass = async (classFrame: ClassFrame) => {
  const { class: classData, user } = classFrame;
  const newClass = await prisma.class.update({
    where: { id: classData.id },
    data: {
      users: {
        connect: user.map((t) => ({ id: t.id })),
      },
    },
  });
};
