"use server"

import {prisma} from "@/app/api/prisma_client"

export const getClassByStudent = async (studentId: number) => {
  return prisma.class.findMany({
    where: {
      students: {
        some: {
          id: studentId
        }
      }
    }
  });
}
export const getClassByTeacher = async (teacherId: number) => {
  return prisma.class.findMany({
    where: {
      teachers: {
        some: {
          id: teacherId
        }
      }
    }
  });
}

export const getAllClass = async () => {
  return prisma.class.findMany();
}