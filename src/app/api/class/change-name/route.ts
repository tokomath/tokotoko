import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const user = await prisma.class.update({
      where: { name: info.oldname },
      data: { name: info.newname }
    });
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
