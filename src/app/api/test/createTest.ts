"use server";

import {
  Class,
  Prisma,
  Question,
  Section,
  Test,
} from "@prisma/client";
import { prisma } from "@/app/api/prisma_client";

import { TestFrame } from "@/app/api/test/testFrames";

export const createTest = async (props: TestFrame) => {
  let test: Prisma.TestCreateInput = {
    title: props.test.title,
    summary: props.test.summary,
    startDate: props.test.startDate,
    endDate: props.test.endDate,
    sections: {
      create: props.sections.map((section) => {
        return {
          summary: section.section.summary,
          number: section.section.number,
          questions: {
            create: section.questions.map((question) => {
              return {
                question: question.question,
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
  console.log(JSON.stringify(test.sections));
  await prisma.test.create({ data: test });
};
