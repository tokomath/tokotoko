"use server"
import {PrismaClient} from '@prisma/client'
import {NextRequest, NextResponse} from "next/server";
import {Test} from "../test/types";

export async function POST(req: NextRequest) {
    const rcvTest: Test = await req.json()

    const prisma = new PrismaClient()
    const createTest = await prisma.test.create({data: {summary: rcvTest.summary}})
    console.log(createTest)

    return NextResponse.json({summary: rcvTest.summary});
}