"use server"
import {prisma} from "@/app/api/prisma_client";

export const getSubmission = async (props: { username: string, testId: number }) => {
  const a = await prisma.submission.findFirst({
    where: {user: {name: props.username}},
    include: {answers: true, test: {include: {sections: {include: {questions: true}}}}}
  })
  return a
}