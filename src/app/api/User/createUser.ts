import { prisma } from "../prisma_client";

export async function createUser(id:string,name:string,email:string) {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    
    if (existingUser) {
        return "Error";
    }
    
    const newUser = await prisma.user.create({
        data: {
        id,
        name,
        email,
        role: 1,
        },
    });
    
    if (newUser) {
        return "Success";
    } else {
        return "Error";
    }

}