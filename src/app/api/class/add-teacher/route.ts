import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const teacher = await prisma.teacher.findUniqueOrThrow({ where: { name: info.teacher_name } });
    const te_id = teacher.id;
    const class_update = await prisma.class.update({
      where: { name: info.class_name },
      data: { teachers: { connect: { id: te_id } } }
    });
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
