"use server"
import judge from "@/lib/judge";
import { prisma } from "../prisma_client";
import { Answer } from "@prisma/client";

export interface submitProps {
  userId: string;
  testId: number;
  answerList: Answer[];
}

export const submitTest = async (props: submitProps) => {
  const sub = await prisma.submission.create({
    data: {
      testId: props.testId,
      studentId: props.userId,
      answers: {},
    },
  });

  const _ = await prisma.answer
    .createMany({
      data: await Promise.all(props.answerList.map(async (ans: Answer, _: number) => ({
        text: ans.text,
        point: await grading(ans.id, ans.text),
        questionId: ans.id,
        submissionId: sub.id,
      }))),
    })
    .catch((e: any) => {
      console.log(e);
    });
};

export const isAlreadySubmit = async (props: { testId: number, userId: string }) => {
  const a = await prisma.submission.findFirst({ where: { user: { id: props.userId }, testId: props.testId } })
  if (a) return true;
  else return false;
}

export const grading = async (id: number, your_answer: string): Promise<number> => {
  // 2 Correct, 1 MabyCorrect, 0 Unknown
  // ID をもとに、正答と回答を取得して比較する

  // 空欄の場合は 0 点
  if (your_answer === "") {
    return 0;
  }

  try {
    const ans = await prisma.question.findUnique({
      where: { id: id }
    });
    let correct_answer = ans?.answer || "";
    switch (judge(correct_answer, your_answer)) {
      case 2:
        return 1;
      case 1:
        return 1;
      default:
        return -1;
    }
  } catch (e) {
    return -1;
  }
}