import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const teacher = await prisma.teacher.findUniqueOrThrow({ where: { name: info.teacher_name } });
    const user = await prisma.class.create({ data: { name: info.name, teachers: { connect: { id: teacher.id } } } });
    return NextResponse.json({ name: info.name });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
