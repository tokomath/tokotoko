"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/app/api/prisma_client";
import { TestFrame } from "@/app/api/test/testFrames";

export const createTest = async (props: TestFrame) => {
  let uniqueId = 0;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = Math.floor(10000000 + Math.random() * 90000000);
    const existingTest = await prisma.test.findUnique({
      where: { id: uniqueId }
    });
    if (!existingTest) isUnique = true;
  }

  let test: Prisma.TestCreateInput = {
    id: uniqueId,
    title: props.test.title,
    summary: props.test.summary,
    startDate: props.test.startDate,
    endDate: props.test.endDate,
    isPublished: props.test.isPublished,
    maxResubmissions: props.test.maxResubmissions,
    sections: {
      create: props.sections.map((section) => {
        return {
          summary: section.section.summary,
          number: section.section.number,
          questions: {
            create: section.questions.map((question) => {
              return {
                question: question.question,
                insertType: question.insertType,
                insertContent: question.insertContent,
                number: question.number,
                answer: question.answer,
                allocationPoint: question.allocationPoint,
              };
            }),
          },
        };
      }),
    },
    classes: {
      connect: props.classes.map((i) => {
        return {
          id: i.id,
        };
      }),
    },
  };
  
  const createdTest = await prisma.test.create({ data: test });
  return createdTest.id;
};