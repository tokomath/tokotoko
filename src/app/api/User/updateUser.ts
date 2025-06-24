import { prisma } from "../prisma_client";

export async function updateUser(id:string,name:string,) {
    try{
        await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    name: name
                },
        });
        console.log("Update Username:",id,":",name);
        return 0;
    } catch (error) {
        console.log("Error setting points:", error);
        return -1;
    }
}