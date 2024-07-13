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

  /*
  const sub = prisma.submittion.create({
    data: {
      test: {connect: {id: info.test_id}},
      student: {connect: {name: info.student_name}},
      answers: {
        createMany: {
          data:
            info.answers.map((ans: any) => {
              return {
                text: ans.text,
                point: -1,
                question: {connect: {id: ans.id}}
              }
            })
        }
      }
    }
  }).then((s) => {
    return NextResponse.json({message: s});
  }).catch((e) => {
    return NextResponse.json({message: e}, {status: 500});
  })
  */
  return NextResponse.json({message: "ok"});
}

export async function GET() {
  console.log("GET")
  const ans = await prisma.answer.findMany()
  console.log(ans)
}
