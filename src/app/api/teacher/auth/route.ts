import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    const users = await prisma.teacher.findFirstOrThrow({ where: { name: data.name } });
    if (users.pass === data.pass) {
      return NextResponse.json({ status: 200 });
    } else {
      return NextResponse.json({message: "wrong password"},{ status: 500 });
    }
  } catch (_) {
    return NextResponse.json({message: "user not exist"},{ status: 500 });
  }
}
