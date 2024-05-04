"use client";
import { useEffect, useState } from "react";
import { Box, Button, Link, Paper, Typography } from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';

interface Question {
  id: string,
  number: string,
  question: string,
}


export default function Solve({ params }: { params: { id: string } }) {

  // Do not use setAnswers!
  // Please use changeAnswer!
  const [answers, setAnswers] = useState<string[]>([]);

  const changeAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  }

  const addAnswers = (number: number) => {
    const newAnswers = [...answers];
    for (let i = 0; i < number; i++) {
      newAnswers.push('');
    }
    setAnswers(newAnswers);
  }

  let questions = [
    {
      id: "0",
      number: "Q1",
      question: "$ \\int x^3 dx $ を解け",
    },
    {
      id: "1",
      number: "Q2",
      question: "$ \\int x^3 dx $ を解け",
    },
    {
      id: "2",
      number: "Q3",
      question: "$ \\int x^3 dx $ を解け",
    },
  ];

  useEffect(() => {
    addAnswers(3);
  }, []);

  return (
    <main>
      <Paper sx={{ borderRadius: 0, width: "100%" }}>
        <Box paddingTop={1} paddingRight={3} display="flex" alignItems="center" justifyContent="flex-end">
          <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener">
            KaTeX Cheat Sheet
          </Link>
          <Typography fontFamily="monospace" marginLeft={2}>
            FormID:{params.id}
          </Typography>
        </Box>
        <Box maxWidth={640} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>課題1 積分の問題</Typography>
            <Typography>KaTeXの書式で答えてください。書式がわからない場合は、上にある "KaTeX Cheat Sheet" をみてください。</Typography>
          </Stack>
        </Box>
      </Paper>
      <Stack
        spacing={2} maxWidth={640} paddingTop={4} margin="auto"
      >
        {questions.map((question, index) => {
          return (
            <Question
              key={question.id}
              id={question.id}
              number={question.number}
              question={question.question}
              answer={answers[index]}
              changeAnswer={(answer) => changeAnswer(index, answer)}
            />
          )
        })}
        <Box display="flex">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={() => confirm("Do you want to send answers?\n" + answers)}
          >
            Send
          </Button>
        </Box>
      </Stack>
    </main >
  )
}