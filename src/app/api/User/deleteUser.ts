import { prisma } from "../prisma_client";


export async function deleteUser(id:string) {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    
    if (!existingUser) {
        return "Error";
    }
    /* 当分はユーザー削除はつけないかも */
    /* ユーザーが削除されて提出データがなくなるのも困るはず */
    

    /*
    if (newUser) {
        return "Success";
    } else {
        return "Error";
    }
    */
}