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
import { getSubmission } from "@/app/api/test/result";
import { Answer } from "@prisma/client";
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const isResubmitMode = searchParams.get("resubmit") === "true";

  const [loading, setLoading] = useState(true);
  const [alreadySubmit, setAlreadySubmit] = useState(true);
  const [submitDate, setSubmitDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
      if (isSignedIn && user?.firstName) {
        try {
          const subResult: any = await isAlreadySubmit({ userId: user.id || "", testId: Number(testId) });
          const testRes: any = await getTestById(Number(testId), user.id || "");

          let isSub = !!subResult;

          if (isSub && isResubmitMode) {
            const subData = await getSubmission({ testId: Number(testId), userid: user.id || "" });

            if (subData) {
              const maxResubmissions = subData.test?.maxResubmissions || 0;
              const submissionCount = subData.submissionCount || 1;
              const remaining = maxResubmissions - (submissionCount - 1);
              const deadlinePassed = subData.test?.endDate ? new Date() > new Date(subData.test.endDate) : false;

              if (remaining > 0) {
                isSub = false;
              }
            }
          }

          setAlreadySubmit(isSub);

          if (testRes) {
            setEndDate(new Date(testRes.endDate));
          }

          if (isSub) {
            let subDate: Date | null = null;
            if (subResult && subResult.submissionDate) {
              subDate = new Date(subResult.submissionDate);
            } else if (testRes && testRes.submissions && testRes.submissions.length > 0) {
              subDate = new Date(testRes.submissions[0].submissionDate);
            } else {
              const saved = localStorage.getItem(`submit_info_${testId}`);
              if (saved) {
                const parsed = JSON.parse(saved);
                subDate = new Date(parsed.submitDate);
                if (!testRes && parsed.endDate) {
                  setEndDate(new Date(parsed.endDate));
                }
              }
            }
            setSubmitDate(subDate);
          }
        } catch (e) {
        } finally {
          setLoading(false);
        }
      }
    }
    a()
  }, [isSignedIn, user?.id, user?.firstName, user?.lastName, testId, isResubmitMode])

  if (!loading && session.status && session.user.name) {
    if (alreadySubmit) {
      return (
        <>
          <Completed id={testId.toString()} submitDate={submitDate} endDate={endDate} />
        </>
      )
    } else {
      return (
        <>
          <Solve
            id={testId.toString()}
            username={session.user.name}
            isResubmitMode={isResubmitMode}
            setAlreadySubmit={() => setAlreadySubmit(true)}
            setCompletedInfo={(subDate: Date, endD: Date) => {
              setSubmitDate(subDate);
              setEndDate(endD);
            }}
          />
        </>
      )
    }
  } else {
    return <>{msg.CANT_OPEN_PAGE}</>
  }
}

function Completed({ id, submitDate, endDate }: { id: string, submitDate: Date | null, endDate: Date | null }) {
  let url = "/result/" + id;
  let statusDisplay = null;

  if (submitDate && endDate) {
    const diffMs = submitDate.getTime() - endDate.getTime();
    const isLate = diffMs > 0;
    const absDiff = Math.abs(diffMs);

    const d = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const h = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((absDiff / 1000 / 60) % 60);

    let timeText = "";
    if (d > 0) timeText += `${d}${msg.DAY}`;
    if (h > 0) timeText += `${h}${msg.HOUR}`;
    if (m > 0) timeText += `${m}${msg.MINUTE}`;
    if (timeText === "") timeText = `1${msg.MINUTE}`;

    const color = isLate ? "error.main" : "success.main";
    const textPrefix = isLate ? msg.LATE_SUBMISSION : msg.EARLY_SUBMISSION;

    statusDisplay = (
      <Box mt={2}>
        <Typography variant="h6">
          {msg.SUBMISSION_TIME}: {submitDate.toLocaleString()}
        </Typography>
        <Typography variant="h6" color={color} fontWeight="bold">
          {msg.DEADLINE} {timeText} {textPrefix}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack sx={{ margin: 2 }} textAlign={"center"} >
      <Typography variant="h4" marginY={5}>{msg.SUBMISSION_COMPLETED}</Typography>
      {statusDisplay}
      <Link href={url} fontSize={20} marginY={5}>{msg.CHECK_RESULTS}</Link>
    </Stack >
  )
}

function Solve(
  { id,
    username,
    isResubmitMode,
    setAlreadySubmit,
    setCompletedInfo
  }: {
    id: string,
    username: string,
    isResubmitMode: boolean,
    setAlreadySubmit: () => void,
    setCompletedInfo: (submitDate: Date, endDate: Date) => void
  }) {
  const { user, isSignedIn } = useUser();
  const [testData, setTestData] = useState<TestFrame | null | undefined>(undefined);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [partIndex, setPartIndex] = useState(0);
  const [sendingStatus, setSendingStatus] = useState(false);
  const [isBeforeStart, setIsBeforeStart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
      const res = await getTestById(Number(id), (user != null && user != undefined) ? user.id : "");
      if (res) {
        const now = new Date();
        if (now < new Date(res.startDate)) {
          setIsBeforeStart(true);
          setTestData(null);
          return;
        }

        const test: TestFrame = {
          test: {
            id: res.id,
            title: res.title,
            summary: res.summary,
            startDate: res.startDate,
            endDate: res.endDate,
            isPublished: res.isPublished,
            maxResubmissions: 0
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

        if (isResubmitMode) {
          const subData = await getSubmission({ testId: Number(id), userid: user?.id || "" });
          if (subData && subData.answers) {
            const previousAnswers: { [key: string]: string } = {};

            subData.answers.forEach((ans: any) => {
              previousAnswers[ans.questionId] = ans.text || "";
            });
            setAnswers(previousAnswers);
            return;
          }
        }

      } else {
        setTestData(null)
      }
    };

    fetchForm();
  }, [id, isResubmitMode, user?.id]);

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

    const submitTime = new Date();

    await submitTest(submitdata)
      .then((res) => {
        alert(msg.SENT);
        localStorage.removeItem(`test_answers_${id}`);
        localStorage.setItem(`submit_info_${id}`, JSON.stringify({
          submitDate: submitTime.getTime(),
          endDate: new Date(testData.test.endDate).getTime()
        }));
        setCompletedInfo(submitTime, new Date(testData.test.endDate));
        setAlreadySubmit();

        if (isResubmitMode) {
          router.replace(`/result/${id}`);
        }
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
    if (testData && !isResubmitMode) {
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
    } else if (testData && isResubmitMode && Object.keys(answers).length === 0) {
      const initialAnswers: { [key: string]: string } = {};
      testData.sections.forEach((section) => {
        section.questions.forEach((question) => {
          initialAnswers[question.id] = "";
        });
      });
      setAnswers(initialAnswers);
    }
  }, [testData, id, isResubmitMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [partIndex]);

  if (isBeforeStart) {
    return (
      <Stack sx={{ margin: 2 }} textAlign={"center"} >
        <Typography variant="h4" marginY={5}>{msg.BEFORE_SUBMISSION_PERIOD}</Typography>
      </Stack >
    )
  }

  if (testData === null) {
    return <div>{msg.NO_TEST_FOUND}</div>
  }
  if (testData === undefined) {
    return <div>{msg.LOADING}</div>;
  }

  return (
    <main>
      <Paper sx={{ borderRadius: 0, width: "100%", borderBottom: 1, borderColor: "divider" }} elevation={0}>
        <Box maxWidth={800} margin="auto" padding={3}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="flex-start"
            gap={3}
          >
            <Stack spacing={1.5} sx={{ width: "100%", flex: 1 }}>
              <Typography variant="h1" fontSize={30} fontWeight="bold">
                {testData.test.title} {isResubmitMode && <Typography component="span" color="error" fontWeight="bold">({msg.RESUBMIT_W})</Typography>}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {testData.test.summary}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {msg.START_DATE} : {testData.test.startDate.getFullYear()}/{String(testData.test.startDate.getMonth() + 1).padStart(2, '0')}/{String(testData.test.startDate.getDate()).padStart(2, '0')} {String(testData.test.startDate.getHours()).padStart(2, '0')}:{String(testData.test.startDate.getMinutes()).padStart(2, '0')} → {msg.END_DATE} : {testData.test.endDate.getFullYear()}/{String(testData.test.endDate.getMonth() + 1).padStart(2, '0')}/{String(testData.test.endDate.getDate()).padStart(2, '0')} {String(testData.test.endDate.getHours()).padStart(2, '0')}:{String(testData.test.endDate.getMinutes()).padStart(2, '0')}              </Typography>
            </Stack>

            <Stack
              spacing={2}
              sx={{
                alignItems: { xs: "flex-start", sm: "flex-end" },
                textAlign: { xs: "left", sm: "right" },
                minWidth: { sm: "280px" },
                width: { xs: "100%", sm: "auto" }
              }}
            >
              <Typography fontFamily="monospace" variant="body2" color="text.secondary">
                {msg.FORM_ID}{id}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Box maxWidth={800} margin="auto" padding={2}>
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