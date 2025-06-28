"use server"
import {prisma} from "@/app/api/prisma_client";

export const getSubmission = async (props: { userid: string, testId: number }) => {
  const a = await prisma.submission.findFirst({
    where: {AND: {user: {id: props.userid}, testId: props.testId}},
    include: {answers: true, test: {include: {sections: {include: {questions: true}}}}}
  })
  return a
}