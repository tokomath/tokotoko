"use server";

import { Class, Student, Teacher } from "@prisma/client";
import { prisma } from "../../prisma_client";

export interface ClassFrame {
  class: Class;
  teacher: Teacher[];
  student: Student[];
}

export const createClass = async (classFrame: ClassFrame) => {
  const { class: classData, teacher, student } = classFrame;
  const newClass = await prisma.class.create({
    data: {
      name: classData.name,
      teachers: {
        connect: teacher.map((t) => ({ id: t.id })),
      },
      students: {
        connect: student.map((s) => ({ id: s.id })),
      },
    },
  });
};
