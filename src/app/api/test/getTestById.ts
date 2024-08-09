"use server"
import { NextResponse, NextRequest } from "next/server";
import { Question, Test, Section, Prisma } from "@prisma/client";
import { prisma } from "@/app/api/prisma_client"
import { SectionFrame, TestFrame } from "./testFrames";

export async function getTestById(testId: number, username: string) {
  // todo need to check user has access
  const res = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      sections: {
        include: {
          questions: true
        }
      },
      classes: { include: { users: true } }
    }
  });

  if (!res) return null

  const ok = res.classes.some((c) => {
    return c.users.some((u) => {
      return u.name === username
    })
  });
  if (ok) return res
  else return null
}
