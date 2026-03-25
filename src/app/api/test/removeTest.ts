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
  await prisma.test.delete({
    where: { id: props.id },
  });
};