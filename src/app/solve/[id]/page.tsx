"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Link, Paper, Tab, Tabs, Typography, Divider } from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";

export interface TestType {
  title: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  sections: SectionType[];
}

export interface SectionType {
  summary: string;
  number: number;
  subSections: SubSectionType[];
}

export interface SubSectionType {
  summary: string;
  number: number;
  questions: QuestionType[];
}

export interface QuestionType {
  question: string;
  number: number;
  answer: string;
  id: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
    id: `tab-${index + 1}`,
    'aria-controls': `The tab of part-${index + 1}`,
  };
}

export default function Solve({ params }: { params: { id: string } }) {
  const [testData, setTestData] = useState<TestType | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);

  const loadForm = async (id: string) => {
    console.log(answers);
    const response = await axios.post("/api/test/get", { id: Number(id) }).then((res) => {
      setTestData(res.data as TestType);
      console.log(res.data.sections);
    }).catch((e) => {
      alert(e);
    });
  }

  const changeAnswer = (questionId: number, answer: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    let id = "";
    let pass = "";

    const idPrompt = prompt("Student Name");
    if (!idPrompt) {
      return; // 入力キャンセル
    } else {
      id = idPrompt;
    }

    const passPrompt = prompt("Password");
    if (!passPrompt) {
      return; // 入力キャンセル
    } else {
      pass = passPrompt;
    }

    const answerList: any = []
    const ans = { ...answers }
    Object.keys(ans).forEach((key) => {
      // @ts-ignore
      answerList.push({ id: Number(key), text: ans[key] })
    })
    const response = await axios.post("/api/test/submit", {
      student_name: String(id),
      student_pass: String(pass),
      test_id: Number(params.id),
      answers: answerList
    }).then((res) => {
      alert("Submited")
    }).catch((e) => {
      alert(e)
    })
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  useEffect(() => {
    loadForm(params.id);
  }, []);

  useEffect(() => {
    if (testData) {
      const initialAnswers: { [key: string]: string } = {};
      testData.sections.forEach(section => {
        section.subSections.forEach(subSection => {
          subSection.questions.forEach(question => {
            initialAnswers[question.id] = "";
          });
        });
      });
      setAnswers(initialAnswers);
    }
  }, [testData]);

  if (!testData) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {/* ヘッダー部分 */}
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
            <Typography variant="h1" fontSize={30}>{testData.title}</Typography>
            <Typography>{testData.summary}</Typography>
            <Typography>Start:{testData.startDate.toString()}　→　Deadline:{testData.endDate.toString()}</Typography>
          </Stack>
        </Box>
      </Paper>

      {/* 問題部分 */}
      <Box maxWidth={640} margin="auto" >
        <Tabs value={partIndex} onChange={handleChange} aria-label="Tabs of each PART">
          {testData.sections.map((section, index) => (
            <Tab key={section.number} label={`Part ${section.number}`} {...a11yProps(index)} />
          ))}
        </Tabs>
        {testData.sections.map((section, index) => (
          <CustomTabPanel key={section.number} value={partIndex} index={index}>
            {section.subSections.map((subSection) => (
              <Paper key={subSection.number} sx={{ marginTop: 2, padding: 2 }}>
                <Typography variant="h6">Section{subSection.number} {subSection.summary}</Typography>
                {subSection.questions.map((question) => (
                  <React.Fragment key={question.id}>
                    <Divider sx={{ my: 1 }} />
                    <Question
                      id={question.id.toString()}
                      number={question.number.toString()}
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

        <Box display="flex" justifyContent="space-between" marginTop={2} paddingRight={2}>
          <Privious index={partIndex} setIndex={setPartIndex} />
          <Next index={partIndex} setIndex={setPartIndex} />
        </Box>

        <Box display="flex" justifyContent="flex-end" marginTop={2} paddingRight={2}>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </Box>
      </Box>

    </main >
  );
}

function Privious({ index, setIndex }: { index: number, setIndex: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <Button
      onClick={
        () => setIndex(index - 1)
      }
    >
      Previous Part
    </Button>
  )

}

function Next({ index, setIndex }: { index: number, setIndex: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <Button
      onClick={
        () => setIndex(index + 1)
      }
    >
      Next Part
    </Button>
  )

}