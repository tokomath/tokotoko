import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserInfo {
  name: string,
  pass: string,
}

export async function POST(request: Request) {
  const info: UserInfo = await request.json();
  const user = await prisma.user.create({ data: { name: info.name, pass: info.pass } });
  return NextResponse.json({ name: info.name, pass: info.pass });
  return NextResponse.json({ message: "Error" }, { status: 500 })
};

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}
