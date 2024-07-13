"use server"

import {prisma} from "@/app/api/prisma_client";

export const checkAssignedUser = async (username: string, testId: number) => {
  const classes = await prisma.class.findMany({
    where: {
      users: {
        some: {
          name: username
        }
      }
    },
    include:{
      tests: true
    }
  });
  console.log(classes)
  return classes.some((cls)=>{
    return testId === cls.id
  })
}
