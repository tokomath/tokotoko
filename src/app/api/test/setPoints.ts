"use server"

import {prisma} from "@/app/api/prisma_client"

interface Point {
    answerId: number;
    point: number;
}

export const setPoints = async(points:Point[]) => {
    points.map((point) => {
        prisma.answer.update({
            where: {
                id: point.answerId,
            },
            data: {
                point:point.point
            }
        })
    });
}