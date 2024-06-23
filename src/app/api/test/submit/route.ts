import {NextResponse, NextRequest} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const info = await request.json();

  const student = await prisma.student.findUniqueOrThrow({where:{name: info.student_name}})

  const sub = await prisma.submittion.create({
    data:{
      testId: info.test_id,
      studentId: student.id,
      answers: {}
    }
  })
  const ans = await prisma.answer.createMany({
    data: info.answers.map((ans: {text: string, id: number}, index: number) => ({
      text: ans.text,
      point: 0,
      questionId: ans.id,
      submittionId: sub.id,
    }))
  }).catch((e: any) => {
    console.log(e)
  })
  return NextResponse.json({message: "ok"});
}

export async function GET() {
  console.log("GET")
  const ans = await prisma.answer.findMany()
  console.log(ans)
}
