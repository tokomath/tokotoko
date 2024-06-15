import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const teacher = await prisma.teacher.findUniqueOrThrow({ where: { name: info.teacher_name } });
    if (teacher.pass === info.teacher_pass) { //teacher auth
      const user = await prisma.student.findUniqueOrThrow({ where: { name: info.student_name } });
      const user_id = user.id;
      const class_update = await prisma.class.update({
        where: { name: info.class_name },
        data: { students: { disconnect: { id: user_id } } }
      });
      return NextResponse.json({ message: "ok" });
    }else{
      return NextResponse.json({ message: "teacher pass is not correct" }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ message: "get data error" }, { status: 500 });
  }
};
