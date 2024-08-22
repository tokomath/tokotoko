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
import { SectionFrame, TestFrame } from "@/app/api/test/testFrames";
import { getTestById } from "@/app/api/test/getTestById";
import { isAlreadySubmit, submitProps, submitTest } from "@/app/api/test/submit";
import { useSession } from "next-auth/react";
import { Answer } from "@prisma/client";
import TopBar from "@/compornents/TopBar";

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
  const [loading, setLoading] = useState(true);
  const [alreadySubmit, setAlreadySubmit] = useState(true);
  const { data: session, status } = useSession()

  useEffect(() => {
    const a = async () => {
      if (session && session.user.name) {
        setAlreadySubmit(await isAlreadySubmit({ username: session.user.name, testId: Number(params.id) }))
        setLoading(false);
      }
    }
    a()
  }, [session])

  if (!loading && session && session.user.name) {
    if (alreadySubmit) {
      return (
        <>
          <TopBar page_name="" user_name={session.user.name} />
          <Completed id={params.id} />
        </>
      )
    } else {
      return (
        <>
          <TopBar page_name="" user_name={session.user.name} />
          <Solve
            id={params.id}
            username={session.user.name}
            setAlreadySubmit={() => setAlreadySubmit(true)}
          />
        </>
      )
    }
  } else if (status == "loading") {
    return <>Loading session...</>
  } else {
    return <>Cant open page</>
  }
}

function Completed({ id }: { id: string }) {
  let url = "/result/" + id
  return (
    <Stack sx={{ margin: 2 }} textAlign={"center"} >
      <Typography variant="h4" marginY={5}>Submission Completed</Typography>
      <Link href={url} fontSize={20} marginY={5}>Check Your Results ＞</Link>
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
  // undefined before init , null when unable to access form TODO
  const [testData, setTestData] = useState<TestFrame | null | undefined>(undefined);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);

  const [sendingStatus, setSendingStatus] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      const res = await getTestById(Number(id), username);
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
    setSendingStatus(true);

    if (!testData) {
      alert("Error")
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
      userName: username,
      testId: Number(id),
      answerList: answerList as Answer[],
    };

    console.log(answerList)

    const res = await submitTest(submitdata)
      .then((res) => {
        alert("Sent!");
        setAlreadySubmit();
      })
      .catch((err) => {
        alert("Failed to send!\n");
        alert(err)
      });

    setSendingStatus(false);
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
            FormID:{id}
          </Typography>
        </Box>
        <Box maxWidth={800} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>
              {testData.test.title}
            </Typography>
            <Typography>{testData.test.summary}</Typography>
            <Typography>
              {"Start: " + testData.test.startDate.getFullYear() + "/" + (testData.test.startDate.getMonth() + 1) + "/" + testData.test.startDate.getDate() + " " +
                testData.test.startDate.getHours() + ":" + testData.test.startDate.getMinutes() +
                " (UTC+" + testData.test.startDate.getTimezoneOffset() / -60 + "h)"
              }
            </Typography>
            <Typography>
              {"End : " + testData.test.endDate.getFullYear() + "/" + (testData.test.endDate.getMonth() + 1) + "/" + testData.test.endDate.getDate() + " " +
                testData.test.endDate.getHours() + ":" + testData.test.endDate.getMinutes() +
                " (UTC+" + testData.test.endDate.getTimezoneOffset() / -60 + "h)"
              }
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* 問題部分 */}
      <Box maxWidth={800} margin="auto">

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
  return <Button onClick={() => setIndex(index - 1)}>Previous Part</Button>;
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
        Send
      </Button>
    );
  } else if (sendingStatus) {
    return (
      <Button disabled>
        Sending...
      </Button>
    )
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