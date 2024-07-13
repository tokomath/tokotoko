"use server";

import { Class, User } from "@prisma/client";
import { prisma } from "../prisma_client";

export interface ClassFrame {
  class: Class;
  user: User[];
}

export const createClass = async (classFrame: ClassFrame) => {
  const { class: classData, user } = classFrame;
  const newClass = await prisma.class.create({
    data: {
      name: classData.name,
      users: {
        connect: user.map((t) => ({ id: t.id })),
      },
    },
  });
};