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
      isPublished: props.test.isPublished,
      maxResubmissions: props.test.maxResubmissions,
      classes: {
        set: [],
        connect: props.classes.map((i) => ({ id: i.id })),
      },
    },
  });

  await prisma.submission.updateMany({
    where: { testId: testId },
    data: { submissionCount: 0 },
  });

  const existingSubmissions = await prisma.submission.findMany({
    where: { testId: testId },
    select: { id: true },
  });

  const existingSections = await prisma.section.findMany({
    where: { testId: testId },
    include: { questions: true },
  });
  const existingSectionIds = existingSections.map((s) => s.id);

  const incomingSectionIds = props.sections.map((s) => s.section.id);

  const sectionsToDelete = existingSectionIds.filter((id) => !incomingSectionIds.includes(id));
  if (sectionsToDelete.length > 0) {
    await prisma.section.deleteMany({
      where: { id: { in: sectionsToDelete } },
    });
  }

  for (const sectionFrame of props.sections) {
    const isExistingSection = existingSectionIds.includes(sectionFrame.section.id);

    if (isExistingSection) {
      await prisma.section.update({
        where: { id: sectionFrame.section.id },
        data: {
          summary: sectionFrame.section.summary,
          number: sectionFrame.section.number,
        },
      });

      const existingQuestions =
        existingSections.find((s) => s.id === sectionFrame.section.id)?.questions || [];
      const existingQuestionIds = existingQuestions.map((q) => q.id);
      const incomingQuestionIds = sectionFrame.questions.map((q) => q.id);

      const questionsToDelete = existingQuestionIds.filter((id) => !incomingQuestionIds.includes(id));
      if (questionsToDelete.length > 0) {
        await prisma.question.deleteMany({
          where: { id: { in: questionsToDelete } },
        });
      }

      for (const question of sectionFrame.questions) {
        if (existingQuestionIds.includes(question.id)) {
          await prisma.question.update({
            where: { id: question.id },
            data: {
              question: question.question,
              insertType: question.insertType,
              insertContent: question.insertContent,
              number: question.number,
              answer: question.answer,
            },
          });
        } else {
          const newQuestion = await prisma.question.create({
            data: {
              sectionId: sectionFrame.section.id,
              question: question.question,
              insertType: question.insertType,
              insertContent: question.insertContent,
              number: question.number,
              answer: question.answer,
            },
          });

          if (existingSubmissions.length > 0) {
            await prisma.answer.createMany({
              data: existingSubmissions.map((sub) => ({
                submissionId: sub.id,
                questionId: newQuestion.id,
                point: 0,
                text: "",
              })),
            });
          }
        }
      }
    } else {
      const newSection = await prisma.section.create({
        data: {
          testId: testId,
          summary: sectionFrame.section.summary,
          number: sectionFrame.section.number,
        },
      });

      for (const question of sectionFrame.questions) {
        const newQuestion = await prisma.question.create({
          data: {
            sectionId: newSection.id,
            question: question.question,
            insertType: question.insertType,
            insertContent: question.insertContent,
            number: question.number,
            answer: question.answer,
          },
        });

        if (existingSubmissions.length > 0) {
          await prisma.answer.createMany({
            data: existingSubmissions.map((sub) => ({
              submissionId: sub.id,
              questionId: newQuestion.id,
              point: 0,
              text: "",
            })),
          });
        }
      }
    }
  }
};

export const updateTestPublishStatus = async (testId: number, isPublished: boolean) => {
  await prisma.test.update({
    where: { id: testId },
    data: { isPublished },
  });
};

export const updateTestMetadata = async (props: TestFrame) => {
  const testId = props.test.id;
  return await prisma.test.update({
    where: { id: testId },
    data: {
      title: props.test.title,
      summary: props.test.summary,
      startDate: props.test.startDate,
      endDate: props.test.endDate,
      isPublished: props.test.isPublished,
      maxResubmissions: props.test.maxResubmissions,
      classes: {
        set: [],
        connect: props.classes.map((i) => ({ id: i.id })),
      },
    },
  });
};