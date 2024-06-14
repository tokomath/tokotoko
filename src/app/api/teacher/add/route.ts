import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const user = await prisma.teacher.create({ data: { name: info.name, pass: info.pass } });
    return NextResponse.json({ name: info.name, pass: info.pass });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
