"use server"
import {PrismaClient, Test} from '@prisma/client'
import {NextRequest} from "next/server";
import {DeleteTestProps} from "@/app/_api/testAPIs";

export async function POST(req: NextRequest) {
    const rcvId: DeleteTestProps = await req.json()

    const prisma = new PrismaClient()
    console.log(rcvId)
    const deleteTest = await prisma.test.deleteMany({
        where: {id: rcvId.id}
    })
}