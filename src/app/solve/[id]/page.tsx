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
      <Stack
        spacing={2} maxWidth={640} paddingTop={2} paddingBottom={2} margin="auto"
      >
        <Paper sx={{ borderRadius: 2, padding: 2 }}>
          <Typography fontFamily="monospace">問題ID:{params.id}</Typography>
          <Typography variant="h1" fontSize={30}>課題1</Typography>
          <Typography>積分の問題です</Typography>
          <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener">
            KaTeXチートシート
          </Link>
        </Paper>
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