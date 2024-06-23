import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    for (let item of info.student_names){
      const user = await prisma.student.create({ data: { name: item, pass: "pass" } });
    }
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
