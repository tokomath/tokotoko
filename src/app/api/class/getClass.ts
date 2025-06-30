"use server"
import {prisma} from "@/app/api/prisma_client"

export const getClassByUserId = async (id: string) => {
  return prisma.class.findMany({
    where: {
      users: {
        some: {
          id: id
        }
      }
    },
    include: {
      users: true,
    },
  });
}

export const getAllClass = async () => {
  return prisma.class.findMany();
}

export const getClassByClassId = async (classId: string) => {
  return prisma.class.findUnique({
    where: {
      id: classId,
    },
  });
}