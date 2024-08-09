"use server";

import {
  Class,
  Prisma,
  Question,
  Section,
  Test,
} from "@prisma/client";

import { prisma } from "@/app/api/prisma_client";

export interface TestFrame {
  test: Test;
  sections: SectionFrame[];
  classes: Class[];
}

export interface SectionFrame {
  section: Section;
  questions: Question[];
}
