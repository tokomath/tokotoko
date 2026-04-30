"use client";
import React, { useEffect, useState, use } from "react";
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
import { SectionFrame, TestFrame } from "@/app/api/test/testFrames";
import { getTestById } from "@/app/api/test/getTestById";
import { isAlreadySubmit, submitProps, submitTest } from "@/app/api/test/submit";
import { Answer } from "@prisma/client";
import { useUser } from '@clerk/nextjs'

import { msg } from "@/msg-ja";

const EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

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

export default function Page({ params }: { params: Promise<{ id: number }> }) {
  const [loading, setLoading] = useState(true);
  const [alreadySubmit, setAlreadySubmit] = useState(true);
  const testId = use(params).id;
  const { user, isSignedIn } = useUser();

  let session = {
    user: {
      name: user?.firstName + " " + user?.lastName || "",
      id: user?.id
    },
    status: isSignedIn
  }

  useEffect(() => {
    const a = async () => {
      if (session.status && session.user.name) {
        setAlreadySubmit(await isAlreadySubmit({ userId: session.user.id || "", testId: Number(testId) }))
        setLoading(false);
      }
    }
    a()
  }, [session])

  if (!loading && session.status && session.user.name) {
    if (alreadySubmit) {
      return (
        <>
          <Completed id={testId.toString()} />
        </>
      )
    } else {
      return (
        <>
          <Solve
            id={testId.toString()}
            username={session.user.name}
            setAlreadySubmit={() => setAlreadySubmit(true)}
          />
        </>
      )
    }
  } else {
    return <>{msg.CANT_OPEN_PAGE}</>
  }
}

function Completed({ id }: { id: string }) {
  let url = "/result/" + id
  return (
    <Stack sx={{ margin: 2 }} textAlign={"center"} >
      <Typography variant="h4" marginY={5}>{msg.SUBMISSION_COMPLETED}</Typography>
      <Link href={url} fontSize={20} marginY={5}>{msg.CHECK_RESULTS}</Link>
    </Stack >
  )
}

function Solve(
  { id,
    username,
    setAlreadySubmit
  }: {
    id: string,
    username: string,
    setAlreadySubmit: () => void
  }) {
  const { user, isSignedIn } = useUser();
  const [testData, setTestData] = useState<TestFrame | null | undefined>(undefined);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);
  const [sendingStatus, setSendingStatus] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      const res = await getTestById(Number(id), (user != null && user != undefined) ? user.id : "");
      if (res) {
        const test: TestFrame = {
          test: {
            id: res.id,
            title: res.title,
            summary: res.summary,
            startDate: res.startDate,
            endDate: res.endDate,
            isPublished: res.isPublished
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
                    insertType: q.insertType,
                    insertContent: q.insertContent,
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
        setTestData(null)
      }
    };

    fetchForm();
  }, []);

  const changeAnswer = (questionId: number, answer: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = {
        ...prevAnswers,
        [questionId]: answer,
      };
      const storageKey = `test_answers_${id}`;
      localStorage.setItem(storageKey, JSON.stringify({
        answers: newAnswers,
        timestamp: new Date().getTime()
      }));
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    setSendingStatus(true);

    if (!testData) {
      alert(msg.ERROR)
      setSendingStatus(false);
      return
    }

    const ans = { ...answers };
    const answerList = testData.sections.map((section: SectionFrame) => {
      return section.questions.map((question: any) => {
        if (ans[question.id.toString()]) {
          return { id: Number(question.id), text: ans[question.id.toString()] }
        } else {
          return { id: Number(question.id), text: "" }
        }
      })
    }).flat()

    let submitdata: submitProps = {
      userId: user?.id || "",
      testId: Number(id),
      answerList: answerList as Answer[],
    };

    await submitTest(submitdata)
      .then((res) => {
        alert(msg.SENT);
        localStorage.removeItem(`test_answers_${id}`);
        setAlreadySubmit();
      })
      .catch((err) => {
        alert(msg.SEND_FAILED + "\n");
        alert(err)
      });

    setSendingStatus(false);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  useEffect(() => {
    if (testData) {
      const storageKey = `test_answers_${id}`;
      const savedDataStr = localStorage.getItem(storageKey);
      let loadedAnswers: { [key: string]: string } | null = null;

      if (savedDataStr) {
        try {
          const savedData = JSON.parse(savedDataStr);
          const now = new Date().getTime();
          if (now - savedData.timestamp < EXPIRATION_TIME) {
            loadedAnswers = savedData.answers;
          } else {
            localStorage.removeItem(storageKey);
          }
        } catch (e) {
          localStorage.removeItem(storageKey);
        }
      }

      const initialAnswers: { [key: string]: string } = {};
      testData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = loadedAnswers && loadedAnswers[question.id] !== undefined
            ? loadedAnswers[question.id]
            : "";
        });
      });
      setAnswers(initialAnswers);
    }
  }, [testData, id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [partIndex]);

  if (testData === null) {
    return <div>{msg.NO_TEST_FOUND}</div>
  }
  if (testData === undefined) {
    return <div>{msg.LOADING}</div>;
  }

  return (
    <main>
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
            {msg.FORM_ID}{id}
          </Typography>
        </Box>
        <Box maxWidth={800} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>
              {testData.test.title}
            </Typography>
            <Typography>{testData.test.summary}</Typography>
            <Typography>
              {msg.START_DATE + ": " + testData.test.startDate.getFullYear() + "/" + (testData.test.startDate.getMonth() + 1) + "/" + testData.test.startDate.getDate() + " " +
                testData.test.startDate.getHours() + ":" + testData.test.startDate.getMinutes() +
                " (UTC+" + testData.test.startDate.getTimezoneOffset() / -60 + "h)"
              }
            </Typography>
            <Typography>
              {msg.END_DATE + ": " + testData.test.endDate.getFullYear() + "/" + (testData.test.endDate.getMonth() + 1) + "/" + testData.test.endDate.getDate() + " " +
                testData.test.endDate.getHours() + ":" + testData.test.endDate.getMinutes() +
                " (UTC+" + testData.test.endDate.getTimezoneOffset() / -60 + "h)"
              }
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Box maxWidth={800} margin="auto">
        <Tabs
          value={partIndex}
          onChange={handleChange}
          aria-label="Tabs of each PART"
        >
          {testData.sections.map((s, index) => (
            <Tab
              key={s.section.number}
              label={`${msg.SECTION_NUMBER} ${s.section.number}`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>

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
                {msg.SECTION_NUMBER} {s.section.number}
              </Typography>
              <Latex>{s.section.summary}</Latex>
              {s.questions.map((question) => (
                <React.Fragment key={question.id}>
                  <Divider sx={{ my: 1 }} />
                  <Question
                    id={question.id.toString()}
                    number={question.number.toString()}
                    question={question.question}
                    insertType={question.insertType}
                    insertContent={question.insertContent}
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
          <Previous index={partIndex} setIndex={setPartIndex} />
          <Next
            index={partIndex}
            setIndex={setPartIndex}
            maxIndex={testData.sections.length}
            handleSubmit={handleSubmit}
            sendingStatus={sendingStatus}
          />
        </Box>
      </Box>
    </main >
  );
}

function Previous({
  index,
  setIndex,
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (index === 0) {
    return <div></div>;
  }
  return <Button onClick={() => setIndex(index - 1)}>{msg.PREV_PART}</Button>;
}

function Next({
  index,
  setIndex,
  maxIndex,
  handleSubmit,
  sendingStatus
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  maxIndex: number;
  handleSubmit: () => void;
  sendingStatus: boolean;
}) {
  if (index === maxIndex - 1 && !sendingStatus) {
    return (
      <Button variant="contained" endIcon={<SendIcon />} onClick={handleSubmit}>
        {msg.SEND}
      </Button>
    );
  } else if (sendingStatus) {
    return (
      <Button disabled>
        {msg.SENDING}
      </Button>
    )
  }

  return (
    <Button
      onClick={() => {
        setIndex(index + 1);
      }}
    >
      {msg.NEXT_PART}
    </Button>
  );
}