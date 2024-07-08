import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import {prisma} from "@/app/api/prisma_client"

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const teacher = await prisma.teacher.findUniqueOrThrow({ where: { name: info.teacher_name } });
    if(teacher.pass === info.teacher_pass){
      const user = await prisma.class.delete({ where: { name: info.name } });
      return NextResponse.json({ message: "ok"});
    }else{
      return NextResponse.json({ message: "error" }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
