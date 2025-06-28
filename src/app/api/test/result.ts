"use server" // This directive ensures the code runs on the server

import { prisma } from "@/app/api/prisma_client"; // Import your Prisma client instance

export const getSubmission = async (props: { userid: string, testId: number }) => {
  const submission = await prisma.submission.findFirst({
    where: {
      studentId: props.userid,
      testId: props.testId
    },
    include: {
      answers: true,
      test: {
        include: {
          sections: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  })
  return submission
}

export const getSubmissionsByTestAndClass = async (props: { testId: number, classId: string }) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        testId: props.testId, 
        user: { 
          classes: { 
            some: {
              id: props.classId,
            },
          },
        },
      },
      include: {
        answers: true, 
        test: {
          select: {
            id: true,
            title: true,
            summary: true,
            startDate: true,
            endDate: true,
            sections: {
              include: { 
                questions: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },

    });

    return submissions;
  } catch (error) {
    return [];
  }
}
