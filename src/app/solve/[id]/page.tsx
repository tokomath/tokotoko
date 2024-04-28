"use client";
import { useState } from "react";
import { Box, Link, Paper, Typography } from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";

export default function Solve({ params }: { params: { id: string } }) {

  // Do not use setAnswers!
  // Please use changeAnswer!
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  const changeAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  }

  return (
    <main>
      <Stack
        spacing={2} maxWidth={640} paddingTop={2} paddingBottom={2} margin="auto"
      >
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box padding={2}>
            <Typography fontFamily="monospace">問題ID:{params.id}</Typography>
            <Typography variant="h1" fontSize={30}>課題1</Typography>
            <Typography>積分の問題です</Typography>
            <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener">
              KaTeXチートシート
            </Link>
          </Box>
        </Paper>
        <Question answer={answers[0]} changeAnswer={(answer) => changeAnswer(0, answer)} question="\int x^3 dx" id="1" number="Q1" />
        <Question answer={answers[1]} changeAnswer={(answer) => changeAnswer(1, answer)} question="\int e^x dx" id="2" number="Q2" />
        <Question answer={answers[2]} changeAnswer={(answer) => changeAnswer(2, answer)} question="\int_0^\infty e^{-st} f(x) dx" id="3" number="Q3" />
      </Stack>
    </main >
  )
}