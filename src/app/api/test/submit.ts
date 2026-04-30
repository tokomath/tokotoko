"use server"

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma_client";
import { Answer, Class, User, Test, Submission } from "@prisma/client";
import judge from "@/lib/judge";

export interface submitProps {
  userId: string;
  testId: number;
  answerList: Answer[];
}


export const submitTest = async (props: submitProps) => {
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      studentId: props.userId,
      testId: props.testId
    },
    orderBy: {
      submissionDate: 'desc'
    }
  });

  const nextCount = existingSubmission ? existingSubmission.submissionCount + 1 : 1;


  if (existingSubmission) {
      await prisma.submission.delete({
          where: { id: existingSubmission.id }
      })
  }

  const sub = await prisma.submission.create({
    data: {
      testId: props.testId,
      studentId: props.userId,
      submissionCount: nextCount,
      answers: {},
    },
  });

  await prisma.answer
    .createMany({
      data: await Promise.all(props.answerList.map(async (ans: Answer) => ({
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
  const a = await prisma.submission.findFirst({ 
    where: { 
      studentId: props.userId, 
      testId: props.testId 
    } 
  });
  return !!a;
}

export const getSubmissionCount = async (props: { testId: number, userId: string }) => {
    const a = await prisma.submission.findFirst({
        where: {
            studentId: props.userId,
            testId: props.testId
        }
    });
    return a ? a.submissionCount : 0;
}


export const grading = async (id: number, your_answer: string): Promise<number> => {
  if (your_answer === "") return 0;

  try {
    const ans = await prisma.question.findUnique({ where: { id } });
    let correct_answer = ans?.answer || "";
    switch (judge(correct_answer, your_answer)) {
      case 2: return 1;
      case 1: return 1;
      default: return -1;
    }
  } catch (e) {
    return -1;
  }
}


export const getClassByClassId = async (classId: string) => {
  return prisma.class.findUnique({
    where: { id: classId },
    include: { users: true },
  });
}

export const getTestByClass = async (classId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      users: {
        where: { id: userId }
      }
    }
  });

  const userInClass = classData?.users[0];
  const isTeacher = userInClass?.role === 0;

  if (isTeacher) {
    return prisma.test.findMany({
      where: {
        classes: { some: { id: classId } },
      },
    });
  } else {
    return prisma.test.findMany({
      where: {
        isPublished: true,
        classes: { some: { id: classId } },
      },
    });
  }
};

export const getSubmissionsByTestId = async (testId: number) => {
  return prisma.submission.findMany({
    where: { testId },
  });
};