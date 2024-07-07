"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Link, Paper, Tab, Tabs, Typography, Divider } from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";

// インターフェース定義
export interface Part {
  id: string,
  title: string;
  sections: Section[];
}

export interface Section {
  id: string,
  title: string;
  questions: Question[];
}

export interface Question {
  id: string,
  number: string,
  question: string,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// サンプルデータ
const parts: Part[] = [
  {
    id: "0",
    title: "Part1",
    sections: [
      {
        id: "0",
        title: "問題1",
        questions: [
          {
            id: "0",
            number: "(1)",
            question: "$ \\int x^3 dx $ を解け 1-1-1",
          },
          {
            id: "1",
            number: "(2)",
            question: "$ \\int x^3 dx $ を解け 1-1-2",
          },
          {
            id: "2",
            number: "(3)",
            question: "$ \\int x^3 dx $ を解け 1-1-3",
          },
        ],
      },
      {
        id: "1",
        title: "問題2",
        questions: [
          {
            id: "3",
            number: "(1)",
            question: "$ \\int x^3 dx $ を解け 1-2-1",
          },
          {
            id: "4",
            number: "(2)",
            question: "$ \\int x^3 dx $ を解け 1-2-2",
          },
          {
            id: "5",
            number: "(3)",
            question: "$ \\int x^3 dx $ を解け 1-2-3",
          },
        ],
      },
    ],
  },
  {
    id: "1",
    title: "Part2",
    sections: [
      {
        id: "0",
        title: "問題1",
        questions: [
          {
            id: "6",
            number: "(1)",
            question: "$ \\int x^3 dx $ を解け 2-1-1",
          },
          {
            id: "7",
            number: "(2)",
            question: "$ \\int x^3 dx $ を解け 2-1-2",
          },
          {
            id: "8",
            number: "(3)",
            question: "$ \\int x^3 dx $ を解け 2-1-3",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Part3",
    sections: [
      {
        id: "0",
        title: "問題1",
        questions: [
          {
            id: "9",
            number: "(1)",
            question: "$ \\int x^3 dx $ を解け 3-1-1",
          },
          {
            id: "10",
            number: "(2)",
            question: "$ \\int x^3 dx $ を解け 3-1-2",
          },
          {
            id: "11",
            number: "(3)",
            question: "$ \\int x^3 dx $ を解け 3-1-3",
          },
        ],
      },
    ],
  },
];

function CustomTabPanel(props: TabPanelProps) {


  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Solve({ params }: { params: { id: number } }) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);

  const [testId, setTestId] = useState<number>(0);

  const handleLoad = async () => {
    const response = await axios.post("/api/test/get", { id: 1 }).then((res) => {
      alert(res.data);
      console.log(res.data);
    }).catch((e) => {
      alert(e);
    })
  }

  useEffect(() => {
    setTestId(params.id);
    handleLoad();

    // const initialAnswers: { [key: string]: string } = {};
    // parts.forEach(part => {
    //   part.sections.forEach(section => {
    //     section.questions.forEach(question => {
    //       initialAnswers[question.id] = "";
    //     });
    //   });
    // });
    // setAnswers(initialAnswers);
  }, []);

  const changeAnswer = (questionId: string, answer: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    const answeredQuestionIds = Object.keys(answers);

    if (answeredQuestionIds.length > 0) {
      const confirmationMessage = answeredQuestionIds.map(id => {
        const { title: partTitle, sections } = parts.find(part => part.sections.some(section => section.questions.some(question => question.id === id))) || { title: "", sections: [] };
        const { title: sectionTitle, questions } = sections.find(section => section.questions.some(question => question.id === id)) || { title: "", questions: [] };
        const { number, question } = questions.find(question => question.id === id) || { number: "", question: "" };
        return `${partTitle} ${sectionTitle} ${number} ${question}: ${answers[id]}`;
      }).join("\n");

      if (window.confirm(`送信しますか？\n${confirmationMessage}`)) {
        // 送信処理を追加
      }
    } else {
      alert("質問に答えを入力してください。");
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  return (
    <main>
      <Paper sx={{ borderRadius: 0, width: "100%" }}>
        <Box paddingTop={1} paddingRight={1} display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end">
          <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener" marginX={1}>
            KaTeXヘルプ
          </Link>
          <Typography fontFamily="monospace" marginX={1}>
            FormID:{params.id}
          </Typography>
        </Box>
        <Box maxWidth={640} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>課題1 積分の問題</Typography>
            <Typography>KaTeXの書式で答えてください。書式がわからない場合は、上にある KaTeX Help をみてください。</Typography>
          </Stack>
        </Box>
      </Paper>
      <Box sx={{ width: '100%', marginTop: 2 }}>
        <Tabs value={partIndex} onChange={handleChange} aria-label="基本的なタブの例">
          {parts.map((part, index) => (
            <Tab key={part.id} label={part.title} {...a11yProps(index)} />
          ))}
        </Tabs>
        {parts.map((part, index) => (
          <CustomTabPanel key={part.id} value={partIndex} index={index}>
            {part.sections.map((section) => (
              <Paper key={section.id} sx={{ marginTop: 2, padding: 2 }}>
                <Typography variant="h6">{section.title}</Typography>
                {section.questions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    <Divider sx={{ my: 1 }} />
                    <Question
                      id={question.id}
                      number={question.number}
                      question={question.question}
                      answer={answers[question.id]}
                      changeAnswer={(answer) => changeAnswer(question.id, answer)}
                    />
                  </React.Fragment>
                ))}
              </Paper>
            ))}
          </CustomTabPanel>
        ))}
      </Box>
      <Box display="flex" justifyContent="flex-end" marginTop={2} paddingRight={2}>
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
        >
          送信
        </Button>
      </Box>
    </main>
  );
}
