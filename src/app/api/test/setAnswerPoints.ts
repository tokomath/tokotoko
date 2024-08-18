"use server"

import { prisma } from "@/app/api/prisma_client"

interface Point {
    answerId: number;
    point: number;
}

export const setAnswerPoints = async(points: Point[]) => {
    try {
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