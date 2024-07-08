"use server"

import {prisma} from "@/app/api/prisma_client"

export const getClassByStudent = async (studentId: number) => {
  const classes = await prisma.class.findMany({
    where: {
      students: {
        some: {
          id: studentId
        }
      }
    }
  });

  return classes;
}