"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/app/api/prisma_client";
import { TestFrame } from "@/app/api/test/testFrames";

export const createTest = async (props: TestFrame) => {
  let test: Prisma.TestCreateInput = {
    title: props.test.title,
    summary: props.test.summary,
    startDate: props.test.startDate,
    endDate: props.test.endDate,
    isPublished: props.test.isPublished,
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