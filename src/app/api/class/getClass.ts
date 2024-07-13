"use server"
import {prisma} from "@/app/api/prisma_client"

export const getClassByUser = async (username: string) => {
  return prisma.class.findMany({
    where: {
      users: {
        some: {
          name: username
        }
      }
    }
  });
}

export const getAllClass = async () => {
  return prisma.class.findMany();
}