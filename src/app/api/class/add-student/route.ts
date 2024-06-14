import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const user = await prisma.student.findUniqueOrThrow({ where: { name: info.student_name } });
    const user_id = user.id;
    const class_update = await prisma.class.update({
      where: { name: info.class_name },
      data: { students: { connect: { id: user_id } } }
    });
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
