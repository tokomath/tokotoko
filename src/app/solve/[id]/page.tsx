"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Link,
  Paper,
  Tab,
  Tabs,
  Typography,
  Divider,
} from "@mui/material";
import "katex/dist/katex.min.css";
import Stack from "@mui/material/Stack";
import Question from "@/compornents/Question";
import SendIcon from "@mui/icons-material/Send";
import Latex from "react-latex-next";
import { TestFrame } from "@/app/api/test/testFrames";
import { getTestById } from "@/app/api/test/getTestById";
import { submitProps, submitTest } from "@/app/api/test/submit";
import { useSession } from "next-auth/react";

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
    "aria-controls": `The tab of part-${index + 1}`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  if (session && session.user.name) {
    return <Solve params={{ id: params.id, username: session.user.name }} />
  } else if (status == "loading") {
    return <>Loading session...</>
  } else {
    return <>Cant open page</>
  }
}

function Solve({ params }: { params: { id: string, username: string } }) {
  // undefined before init , null when unable to access form TODO
  const [testData, setTestData] = useState<TestFrame | null | undefined>(undefined);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);

  useEffect(() => {
    const fetchForm = async () => {
      const res = await getTestById(Number(params.id), params.username);
      if (res) {
        const test: TestFrame = {
          test: {
            id: res.id,
            title: res.title,
            summary: res.summary,
            startDate: res.startDate,
            endDate: res.endDate
          },
          sections: res.sections.map(
            (s) => {
              return {
                section: { id: s.id, testId: s.testId, number: s.number, summary: s.summary },
                questions: s.questions.map((q) => {
                  return {
                    id: q.id,
                    sectionId: q.sectionId,
                    number: q.number,
                    question: q.question,
                    answer: q.answer,
                  }
                })
              }
            }
          ),
          classes: res.classes,
        }
        setTestData(test)
      } else {
        setTestData(null) // データが取得できなかったとき
      }
    };

    fetchForm();
  }, []);

  const changeAnswer = (questionId: number, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    const answerList: any = [];
    const ans = { ...answers };
    Object.keys(ans).forEach((key) => {
      // @ts-ignore
      answerList.push({ id: Number(key), text: ans[key] });
    });

    let submitdata: submitProps = {
      userName: params.username,
      testId: Number(params.id),
      answerList: answerList,
    };

    const res = await submitTest(submitdata)
      .then((res) => {
        alert("Sent!");
      })
      .catch((err) => {
        alert("Failed to send!\n");
        alert(err)
      });
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  useEffect(() => {
    if (testData) {
      const initialAnswers: { [key: string]: string } = {};
      testData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = "";
        });
      });
      setAnswers(initialAnswers);
    }
  }, [testData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [partIndex]);

  if (testData === null) {
    return <div>No Test </div>
  }
  if (testData === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {/* ヘッダー部分 */}
      <Paper sx={{ borderRadius: 0, width: "100%" }}>
        <Box
          paddingTop={1}
          paddingRight={1}
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Link
            href="https://katex.org/docs/supported.html"
            target="_blank"
            rel="noopener"
            marginX={1}
          >
            KaTeXヘルプ
          </Link>
          <Typography fontFamily="monospace" marginX={1}>
            FormID:{params.id}
          </Typography>
        </Box>
        <Box maxWidth={640} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>
              {testData.test.title}
            </Typography>
            <Typography>{testData.test.summary}</Typography>
            <Typography>
              Start:{testData.test.startDate.toString()} → Deadline:
              {testData.test.endDate.toString()}
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* 問題部分 */}
      <Box maxWidth={640} margin="auto">

        {/* タブ部分 Part */}
        <Tabs
          value={partIndex}
          onChange={handleChange}
          aria-label="Tabs of each PART"
        >
          {testData.sections.map((s, index) => (
            <Tab
              key={s.section.number}
              label={`Part ${s.section.number}`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>

        {/* Question部分 */}
        {testData.sections.map((s, index) => (
          <CustomTabPanel
            key={s.section.number}
            value={partIndex}
            index={index}
          >
            <Paper
              key={s.section.number}
              sx={{ marginTop: 2, padding: 2 }}
            >
              <Typography variant="h6">
                PART {s.section.number}
              </Typography>
              <Latex>{s.section.summary}</Latex>
              {s.questions.map((question) => (
                <React.Fragment key={question.id}>
                  <Divider sx={{ my: 1 }} />
                  <Question
                    id={question.id.toString()}
                    number={question.number.toString()}
                    question={question.question}
                    answer={answers[question.id]}
                    changeAnswer={(answer) =>
                      changeAnswer(question.id, answer)
                    }
                  />
                </React.Fragment>
              ))}
            </Paper>
          </CustomTabPanel>
        ))}

        <Box
          display="flex"
          justifyContent="space-between"
          marginTop={2}
          paddingRight={2}
        >
          <Privious index={partIndex} setIndex={setPartIndex} />
          <Next
            index={partIndex}
            setIndex={setPartIndex}
            maxIndex={testData.sections.length}
            handleSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </main>
  );
}

function Privious({
  index,
  setIndex,
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (index === 0) {
    return <div></div>;
  }
  return <Button onClick={() => setIndex(index - 1)}>Previous Part</Button>;
}

function Next({
  index,
  setIndex,
  maxIndex,
  handleSubmit,
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  maxIndex: number;
  handleSubmit: () => void;
}) {
  if (index === maxIndex - 1) {
    return (
      <Button variant="contained" endIcon={<SendIcon />} onClick={handleSubmit}>
        Send
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        setIndex(index + 1);
      }}
    >
      Next Part
    </Button>
  );
}