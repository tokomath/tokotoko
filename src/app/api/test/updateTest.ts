"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/app/api/prisma_client";
import { TestFrame } from "@/app/api/test/testFrames";

export const updateTest = async (props: TestFrame) => {
  const testId = props.test.id;

  await prisma.test.update({
    where: { id: testId },
    data: {
      title: props.test.title,
      summary: props.test.summary,
      startDate: props.test.startDate,
      endDate: props.test.endDate,
      classes: {
        set: [],
        connect: props.classes.map((i) => ({ id: i.id })),
      },
    },
  });

  await prisma.section.deleteMany({
    where: { testId: testId },
  });

  for (const section of props.sections) {
    await prisma.section.create({
      data: {
        testId: testId,
        summary: section.section.summary,
        number: section.section.number,
        questions: {
          create: section.questions.map((question) => ({
            question: question.question,
            insertType: question.insertType,
            insertContent: question.insertContent,
            number: question.number,
            answer: question.answer,
          })),
        },
      },
    });
  }
};