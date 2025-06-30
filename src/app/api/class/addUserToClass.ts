"use server";

import { NextResponse } from 'next/server';
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

export const joinUserToClass = async (classId: string, userId: string): Promise<boolean> => {
  try {
    await prisma.class.update({
      where: { id: classId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
    // 処理が成功した場合
    console.log(`Successfully connected user ${userId} to class ${classId}`);
    return true;
  } catch (error) {
    // 処理が失敗した場合
    console.error(`Failed to connect user ${userId} to class ${classId}:`, error);
    return false;
  }
}