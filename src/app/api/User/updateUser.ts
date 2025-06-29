"use server";
import { prisma } from "../prisma_client";

export async function updateUser(id:string,name:string,email:string) {
    try{
        await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    name: name,
                    email: email
                },
        });
        console.log("Update Username:",id,":",name);
        return 0;
    } catch (error) {
        console.log("Error setting points:", error);
        return -1;
    }
}

/* role 0 : Teacher / role 1 : Student */
export async function changeRole(userid:string,role:number) {
    try{
        console.log("Try change role")
        await prisma.user.update({
                where: {
                    id: userid
                },
                data: {
                    role: role
                },
        });
        console.log("Update Role:",userid,":",role);
        return 0;
    } catch (error) {
        console.log("Error setting role:", error);
        return -1;
    }
}