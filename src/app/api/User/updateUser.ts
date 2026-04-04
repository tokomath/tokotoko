"use server";
import { prisma } from "../prisma_client";
import { teacherAuth } from "../auth/auth";

export async function updateUser(id:string,name:string,email:string, currentUserId: string) {
    try{
        // Users can only update their own profile
        if (id !== currentUserId) {
            console.error("Unauthorized: Users can only update their own profile");
            return -1;
        }
        
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
export async function changeRole(userid:string,role:number, currentUserId: string) {
    try{
        // Only teachers can change roles
        const isTeacher = await teacherAuth(currentUserId);
        if (!isTeacher) {
            console.error("Unauthorized: Only teachers can change user roles");
            return -1;
        }
        
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