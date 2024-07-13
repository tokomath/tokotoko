"use server";

import {
  Class,
  Prisma,
  Question,
  Section,
  SubSection,
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
    .then((section) => {
      section
        .map((s) => {
          return prisma.subSection.findMany({
            where: {
              sectionId: s.id,
            },
            select: {
              id: true,
            },
          });
        })
        .map(async (subsection) => {
          subsection.then((i) => {
            return i.map(async (_) => {
              subsection.then((i) => {
                prisma.question
                  .deleteMany({
                    where: {
                      subSectionId: {
                        in: i.map((j) => {
                          return j.id;
                        }),
                      },
                    },
                  })
                  .then(async (_) => {
                    await prisma.subSection
                      .deleteMany({
                        where: {
                          sectionId: {
                            in: section.map((i) => {
                              return i.id;
                            }),
                          },
                        },
                      })
                      .then(async (_) => {
                        await prisma.section
                          .deleteMany({
                            where: {
                              testId: props.id,
                            },
                          })
                          .then(async (_) => {
                            await prisma.test.deleteMany({
                              where: { id: props.id },
                            });
                          });
                      });
                  });
              });
            });
          });
        });
    });
};