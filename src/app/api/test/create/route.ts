import {NextResponse, NextRequest} from "next/server";
import {Question, Test, Section, SubSection, Prisma} from "@prisma/client";
import {prisma} from "@/app/api/prisma_client"

export interface TestFrame {
  test: Test,
  sections: SectionFrame[],
}

export interface SectionFrame {
  section: Section,
  subSections: SubSectionFrame[],
}

export interface SubSectionFrame {
  subSection: SubSection,
  questions: Question[],
}

export interface Sec {
  summary: String,
  number: number,
  subSections: SubSection[],
}

export interface SubSec {
  summary: String,
  number: number,
  questions: any,
}

export interface DeleteTestProps {
  id: number,
}

export async function POST(request: NextRequest) {
  const info = await request.json();

  let test: Prisma.TestCreateInput = {
    classes: {
      connect: info.classes.map((c: string) => ({name: c})) || [],
      //connect: {name: "A"}
    },
    title: info.title,
    summary: info.summary,
    endDate: info.endDate,
    sections: {
      create: info.sections.map((section: any) => {
        console.log(section)
        return {
          summary: section.summary,
          number: section.number,
          subSections:
            {
              create: section.subSections.map((subSection: any) => {
                console.log(subSection)
                return {
                  summary: subSection.summary,
                  number: subSection.number,
                  questions: {
                    create: subSection.questions.map((question: any) => {
                      return question
                    })
                  },
                }
              })
            }
        }
      })
    }
  }

    try {
      console.log(JSON.stringify(test.sections));
      await prisma.test.create({data: test})
      return NextResponse.json({message: "ok"});
    } catch (e) {
      return NextResponse.json({message: e}, {status: 500});
    }
}
