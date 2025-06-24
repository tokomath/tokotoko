"use server";

import { Class, User } from "@prisma/client";
import { prisma } from "../prisma_client";

export interface ClassFrame {
  class: Class;
  user: User[];
}

function generateId(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createClass = async (classFrame: ClassFrame) => {
  const { class: classData, user } = classFrame;
  let id: string;
  let isUnique = false;

  do {
    id = generateId(6);
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) isUnique = true;
  } while (!isUnique);

  const newClass = await prisma.class.create({
    data: {
      id:id,
      name: classData.name,
      users: {
        connect: user.map((t) => ({ id: t.id })),
      },
    },
  });
};

