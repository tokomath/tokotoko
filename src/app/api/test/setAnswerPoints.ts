"use server"

import { prisma } from "@/app/api/prisma_client"
import { teacherAuth } from "@/app/api/auth/auth"

interface Point {
    answerId: number;
    point: number;
}

export const setAnswerPoints = async(points: Point[], userId: string) => {
    try {
        // Authorization: Only teachers can set answer points
        const isTeacher = await teacherAuth(userId);
        if (!isTeacher) {
            console.error("Unauthorized: Only teachers can set answer points");
            return -1;
        }
        
        await Promise.all(points.map(async (pt) => {
            await prisma.answer.update({
                where: {
                    id: pt.answerId,
                },
                data: {
                    point: pt.point,
                },
            });
        }));
        return 0;
    } catch (error) {
        console.log("Error setting points:", error);
        return -1;
    }
};