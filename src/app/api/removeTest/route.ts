"use server"
import {PrismaClient} from '@prisma/client'
import {NextRequest} from "next/server";

interface RcvId {
    id: number
}

export async function POST(req: NextRequest) {
    const rcvId: RcvId = await req.json()

    const prisma = new PrismaClient()
    const deleteTest = await prisma.test.delete({
        where: {id: rcvId.id}
    })
    void deleteTest;
}
