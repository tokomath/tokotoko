"use server"
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "../prisma_client";

import { Answer } from "@prisma/client";

export interface submitProps {
  userName: string;
  testId: number;
  answerList: Answer[];
}

export const submitTest = async (props: submitProps) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { name: props.userName },
  });

  const sub = await prisma.submittion.create({
    data: {
      testId: props.testId,
      studentId: user.id,
      answers: {},
    },
  });

  const ans = await prisma.answer
    .createMany({
      data: props.answerList.map((ans: Answer, index: number) => ({
        text: ans.text,
        point: 0,
        questionId: ans.id,
        submittionId: sub.id,
      })),
    })
    .catch((e: any) => {
      console.log(e);
    });
};
