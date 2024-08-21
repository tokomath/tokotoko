"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import "katex/dist/katex.min.css";


import Question from "@/compornents/Question";
import judge from "@/lib/guards/judge";

export default function JudgeDemo() {

  // ２つのテキストフィールドを作る

  const [correct_answer, setCorrect_answer] = useState("");
  const [your_answer, setYour_answer] = useState("");
  const [result, setResult] = useState(0);

  return (
    <>
      <Typography variant="h1">Judge Demo</Typography>
      <Box maxWidth={1500} margin="auto" display="flex" justifyContent="space-between">
        <Question id={""} number={""} question={"Collect Answer"} answer={correct_answer} changeAnswer={setCorrect_answer} />
        <Stack>
          <Button
            variant="contained"
            onClick={() => {
              setResult(judge(correct_answer, your_answer))
            }}
          >Judge</Button>
          <Typography>
            Result: {result}
          </Typography>
          <Typography>
            0: Unknown, 1: MabyCorrect, 2: Correct
          </Typography>
        </Stack>
        <Question id={""} number={""} question={"Your Answer"} answer={your_answer} changeAnswer={setYour_answer} />
      </Box>
    </>
  )

}