"use server";

import { Class, User } from "@prisma/client";
import { prisma } from "../prisma_client";
import { ClassFrame } from "./createClass";

export const updateClass = async (classFrame: ClassFrame) => {
  const { class: classData } = classFrame;

  const updatedClass = await prisma.class.update({
    where: {
      id: classData.id,
    },
    data: {
      name: classData.name,
      icon: classData.icon,
    },
  });

  return updatedClass;
};