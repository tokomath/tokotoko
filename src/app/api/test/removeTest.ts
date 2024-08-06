"use server";

import {
  Class,
  Prisma,
  Question,
  Section,
  Test,
} from "@prisma/client";
import { prisma } from "@/app/api/prisma_client";


export interface DeleteTestProps {
  id: number;
}

export const removeTest = async (props: DeleteTestProps) => {
  await prisma.section
    .findMany({
      where: {
        testId: props.id,
      },
      select: {
        id: true,
      },
    })
    .then(async (section) => {
      section.map(async () => {
        return await prisma.question
          .deleteMany({
            where: {
              sectionId: {
                in: section.map((j) => {
                  return j.id;
                }),
              },
            },
          }).then(async () => {
            prisma.section.deleteMany({
              where: {
                testId: props.id,
              },
            }).then(async () => {
              prisma.test.deleteMany({
                where: { id: props.id },
              });
            });
          })
      })
    })
}
