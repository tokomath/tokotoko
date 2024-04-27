"use server"
import {PrismaClient, Test} from '@prisma/client'
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    const rcvTest: Test = await req.json()

    const prisma = new PrismaClient()
    const createTest = await prisma.test.create({data: {summary: rcvTest.summary}})
    console.log(rcvTest)

    return NextResponse.json({summary: rcvTest.summary});
}