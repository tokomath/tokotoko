import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();
  try {
    const student = await prisma.student.findUniqueOrThrow({ where: { name: info.student_name } });
    if (student.pass === info.student_pass) { //student auth
      const cnt = await prisma.class.count({
        where: {
          AND: { students: { some: { id: student.id } }, tests: { some: { id: info.test_id } } }
        }
      });
      if (cnt) {
        const d = {
          test: {connect: {id: info.test_id}},
          answers: { create: info.answers.map((s: any) => { return { text: s, point: -1 } }) },
          student: { connect: { name: info.student_name } },
        }
        console.log("%o",d);
        const a = await prisma.submittion.create({ data: d })
        //await prisma.test.update({ where: { id: info.test_id }, data: { submittions: { connect: { id: a.id } } } })
        return NextResponse.json({ message: "ok" });
      }
    }
  } catch (e) {
    console.log(e)
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
  return NextResponse.json({ message: "student auth error" }, { status: 500 });
};
