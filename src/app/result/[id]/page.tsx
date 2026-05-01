"use client";
import React, { useEffect, useState, use } from "react";
import {
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  Typography,
  Divider,
} from "@mui/material";
import "katex/dist/katex.min.css";
import Stack from "@mui/material/Stack";
import Latex from "react-latex-next";
import { useUser } from '@clerk/nextjs';
import { getSubmission } from "@/app/api/test/result";
import InsertFrame from "@/compornents/InsertFrame";
import { msg } from "@/msg-ja";
import { useRouter } from "next/navigation";

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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const testId = use(params).id;

  if (!isLoaded) {
    return <>{msg.LOADING}</>;
  }

  if (isSignedIn && user?.id) {
    return <Result id={testId} userid={user.id} />;
  }

  return <>{msg.CANT_OPEN_PAGE}</>;
}

function Result({ id, userid }: { id: string, userid: string }) {
  const [data, setData] = useState<any | null | undefined>(undefined);
  const [partIndex, setPartIndex] = useState(0);
  const [point, setPoint] = useState(0);
  const [totalMaxPoint, setTotalMaxPoint] = useState(0);
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  useEffect(() => {
    const fetch = async () => {
      const res = await getSubmission({ testId: Number(id), userid: userid });
      if (res) {
        setData(res);
        let i = 0;
        let p = 0;
        let mp = 0;
        let misaiten = false;
        res.test.sections.forEach((sec: any) => {
          sec.questions.forEach((q: any) => {
            q["ans"] = res.answers[i];
            mp += q.allocationPoint ?? 1;
            if (res.answers[i].point >= 0) {
              p += res.answers[i].point;
            } else {
              misaiten = true;
            }
            i += 1;
          });
        });

        setTotalMaxPoint(mp);

        if (misaiten) {
          setPoint(-1);
        } else {
          setPoint(p);
        }
      } else {
        setData(null);
      }
    };
    fetch();
  }, [id, userid]);

  if (data === undefined) {
    return <>{msg.LOADING}</>;
  }

  if (data === null) {
    return <>{msg.NO_TEST_FOUND}</>;
  }

  const submitDate = data.submissionDate ? new Date(data.submissionDate) : null;
  const endDate = data.test ? new Date(data.test.endDate) : null;

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
      <Box mt={1}>
        <Typography variant="body2" color="text.secondary">
          {msg.SUBMISSION_TIME}: {submitDate.toLocaleString()}
        </Typography>
        <Typography variant="body2" color={color} fontWeight="bold">
          {msg.DEADLINE} {timeText} {textPrefix}
        </Typography>
      </Box>
    );
  }

  const maxResubmissions = data.test?.maxResubmissions || 0;
  const currentSubmissionCount = data.submissionCount || 1;
  const remainingResubmissions = maxResubmissions - (currentSubmissionCount - 1);
  const isDeadlinePassed = endDate ? new Date() > endDate : false;

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
            {/* 左側: テスト情報 */}
            <Stack spacing={1.5} sx={{ width: "100%", flex: 1 }}>
              <Typography variant="h1" fontSize={30} fontWeight="bold">
                {data.test.title}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {data.test.summary}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {msg.START_DATE}: {new Date(data.test.startDate).toLocaleString()} → {msg.END_DATE}: {new Date(data.test.endDate).toLocaleString()}
              </Typography>
            </Stack>

            {/* 右側 (モバイル時は下側): メタデータ・アクション・スコア */}
            <Stack
              spacing={2}
              sx={{
                alignItems: { xs: "flex-start", sm: "flex-end" },
                textAlign: { xs: "left", sm: "right" },
                minWidth: { sm: "280px" },
                width: { xs: "100%", sm: "auto" }
              }}
            >
              {/* フォームID & 再提出コントロール */}
              <Stack spacing={1} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
                <Typography fontFamily="monospace" variant="body2" color="text.secondary">
                  {msg.FORM_ID}{id}
                </Typography>
                {maxResubmissions > 0 && (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      {msg.REMAINING_RESUBMISSIONS}: {remainingResubmissions}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={remainingResubmissions <= 0}
                      onClick={() => router.push(`/solve/${id}?resubmit=true`)}
                    >
                      {msg.RESUBMIT}
                    </Button>
                  </Stack>
                )}
              </Stack>

              {/* 点数 & 提出時間 */}
              <Box>
                {point === -1 ? (
                  <Typography variant="h5" color="text.secondary" fontWeight="bold">
                    {msg.NOT_GRADED}
                  </Typography>
                ) : (
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {msg.SCORE}: {point} / {totalMaxPoint} {msg.POINTS}
                  </Typography>
                )}
                {statusDisplay}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Box maxWidth={800} margin="auto">
        <Tabs
          value={partIndex}
          onChange={handleChange}
          aria-label="Tabs of each PART"
        >
          {data.test.sections.map((section: any, index: number) => (
            <Tab
              key={section.number}
              label={`${msg.SECTION_NUMBER} ${section.number}`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
        {data.test.sections.map((section: any, i1: number) => (
          <CustomTabPanel
            key={section.number}
            value={partIndex}
            index={i1}
          >
            <Box margin={2}>
              <Typography variant="h6">
                {msg.SECTION_NUMBER} {section.number}
              </Typography>
              <Latex>{section.summary}</Latex>
            </Box>
            {section.questions.map((question: any) => {
              return (
                <Paper key={question.id} sx={{ marginTop: 2, padding: 2 }}>
                  <React.Fragment key={question.id}>
                    <Question
                      id={question.id.toString()}
                      number={question.number.toString()}
                      question={question.question}
                      myAns={question.ans.text}
                      insertType={question.insertType}
                      insertContent={question.insertContent}
                      trueAns={question.answer}
                      point={question.ans.point}
                      allocationPoint={question.allocationPoint}
                    />
                  </React.Fragment>
                </Paper>
              );
            })}
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
            maxIndex={data.test.sections.length}
          />
        </Box>
      </Box>
    </main>
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
}: {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  maxIndex: number;
}) {
  if (index === maxIndex - 1) {
    return <></>;
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

function Question({ id, number, question, insertType, insertContent, myAns, trueAns, point,allocationPoint }: any) {
  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center">
        <Typography variant="h2" fontSize={17}>({number})</Typography>
        <Box width="10px"></Box>
        <Latex>{question}</Latex>
        <Box sx={{ml:3}}>[ {allocationPoint} {msg.POINTS} ]</Box>
      </Box>
      {insertType !== "None" ? (
        <>
          <Divider />
          <InsertFrame insertType={insertType} insertContent={insertContent} />
        </>
      ) : <></>}

      <Divider />
      <Box
        display="flex"
        minHeight={40}
        alignItems="center"
        paddingX={2}
      >
        <Latex>{myAns}</Latex>
      </Box>
      <Divider />
      {/*
      <Box
        display="flex"
        minHeight={40}
        alignItems="center"
        paddingX={2}
      >
        <Typography>{msg.TRUE_ANS}</Typography>
        <Box minWidth={20} />
        <Latex>{trueAns}</Latex>
      </Box>*/}
      {point === -1 ? (
        <div>{msg.NOT_GRADED}</div>
      ) : (
        <div>{msg.SCORE}: {point} {msg.POINTS}</div>
      )}
    </Stack>
  );
}