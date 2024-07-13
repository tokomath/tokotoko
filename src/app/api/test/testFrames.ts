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

export interface TestFrame {
  test: Test;
  sections: SectionFrame[];
  classes: Class[];
}

export interface SectionFrame {
  section: Section;
  subSections: SubSectionFrame[];
}

export interface SubSectionFrame {
  subSection: SubSection;
  questions: Question[];
}