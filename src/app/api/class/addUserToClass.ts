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
    // Verify the user exists before allowing them to join
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.error(`User ${userId} does not exist`);
      return false;
    }
    
    // Verify the class exists before allowing join
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!classExists) {
      console.error(`Class ${classId} does not exist`);
      return false;
    }
    
    // Check if user is already in the class
    const existingMembership = await prisma.class.findFirst({
      where: {
        id: classId,
        users: {
          some: {
            id: userId
          }
        }
      }
    });
    
    if (existingMembership) {
      console.log(`User ${userId} is already in class ${classId}`);
      return true; // Already a member, consider it success
    }
    
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