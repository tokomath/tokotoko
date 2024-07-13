"use server"
import {NextResponse, NextRequest} from "next/server";
import {Question, Test, Section, SubSection, Prisma} from "@prisma/client";
import {prisma} from "@/app/api/prisma_client"
import {SectionFrame, TestFrame} from "./testFrames";

export async function getTestById(testId: number) {
  // todo need to check user has access
  const res = await prisma.test.findUnique({
    where: {id: testId},
    include: {
      sections: {
        include: {
          subSections: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  });
  return res
}