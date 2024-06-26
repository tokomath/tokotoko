import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Test {
  class: string,
  summary: string,
  id: number,
}

export async function POST(request: NextRequest) {
  const info = await request.json();
  console.log(info);
  try {
    let res: Test[] = [];
    const cls = await prisma.class.findMany({ where: { students: {some : {name: info.data.name}} } })
    //console.log(cls);
    await Promise.all(cls.map(async (c) => {
        const tests = await prisma.test.findMany({ where: { classes: { some: c } } })
        tests.map(test => {
          res.push({ class: c.name, summary: test.summary , id: test.id})
        })
    }))
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
