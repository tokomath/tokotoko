import { NextResponse, NextRequest } from "next/server";
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

export interface Sec{
  summary: String,
  number: number,
  subSections: SubSection[],
}

export interface SubSec{
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
      connect : info.classes.map((c : string) => ({name : c})) || [],
      //connect: {name: "A"}
    },
    title: info.title,
    summary: info.summary,
    sections: {
      create: info.sections.map((section:any) => {
        return {
          summary: section.section.summary,
          number: section.section.number,
          subSections: {
            create: section.section.subSections.map((subSection:any) => {
              return {
                summary: subSection.subSection.summary,
                number: subSection.subSection.number,
                questions: {
                  create: subSection.subSection.questions.map((question:any) => {
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
  try{
    console.log(JSON.stringify(test.sections));
    await prisma.test.create({data: test})
    return NextResponse.json({message: "ok"});
  }catch(e){
    return NextResponse.json({message: e},{status: 500});
  }
}
