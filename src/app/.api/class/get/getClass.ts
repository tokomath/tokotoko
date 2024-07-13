"use server"

import {prisma} from "@/app/api/prisma_client"

export const getClassByUser = async (userId: number) => {
  return prisma.class.findMany({
    where: {
      users: {
        some: {
          id: userId
        }
      }
    }
  });
}

export const getAllClass = async () => {
  return prisma.class.findMany();
}