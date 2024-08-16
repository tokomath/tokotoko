"use server"

import {prisma} from "@/app/api/prisma_client"

export const getClassMemberById = async(classID : Number) => {
    const response = await prisma.user.findMany({
        where: {
            classes: {
                some: {
                    id: classID
                }
            }
        }
    });

    if(response)
        return response;
    else
        return null;
}