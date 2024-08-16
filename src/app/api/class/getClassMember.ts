"use server"

import {prisma} from "@/app/api/prisma_client"

export const getClassMemberById = async(classID : Number) => {
    const response = await prisma.class.findUnique({
        where: {id: classID},
        include: {
            users: {
                include : {
                    id : true,
                    name : true
                }
            }
        }
    });

    if(response)
        return response;
    else
        return null;
}