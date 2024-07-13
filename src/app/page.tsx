"use client"
import {signOut} from "next-auth/react";
import {Box, Button} from "@mui/material";
import { Stack } from "@mui/system";
import { useCallback, useState } from "react";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";
import {
  removeTest,
  createTest,
  DeleteTestProps,
  getTest,
} from "@/app/api/testAPIs";
import { Question, Test } from "@prisma/client";
import { TestFrame, SectionFrame, SubSectionFrame } from "@/app/api/testAPIs";
import dayjs from "dayjs";

export default function Home() {
  return (
    <Box><Button onClick={(e) => signOut()}>SignOut</Button></Box>
  )
}
