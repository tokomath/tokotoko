"use server";
import {prisma} from "../prisma_client"

export const getAllTeachers = async () => {
  return prisma.user.findMany(
    {
      where: {
        role: 0, 
      },
    }
  );
};
