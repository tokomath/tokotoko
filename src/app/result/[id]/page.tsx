"use client";
import React, { useEffect, useState } from "react";
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
import SendIcon from "@mui/icons-material/Send";
import Latex from "react-latex-next";
import { isAlreadySubmit } from "@/app/api/test/submit";
import { useSession } from "next-auth/react";
import { getSubmission } from "@/app/api/test/result";
import { BlockMath } from "react-katex";

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

  if (!loading && session && session.user.name && alreadySubmit) {
    return <Result params={{ id: params.id, username: session.user.name }} />
  } else if (status == "loading") {
    return <>Loading session...</>
  } else {
    return <>Cant open page</>
  }
}

function Result({ params }: { params: { id: string, username: string } }) {
  // undefined before init , null when unable to access form TODO
  const [data, setData] = useState<any | null | undefined>(undefined);
  const [partIndex, setPartIndex] = useState(0);
  const [point, setPoint] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPartIndex(newValue);
  };

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmission({ testId: Number(params.id), username: params.username })
      if (data) {
        setData(data)
        let i = 0;
        data.test.sections.forEach((sec) => {
          sec.questions.forEach((q) => {
            //@ts-ignore
            q["ans"] = data.answers[i];
            setPoint(point + data.answers[i].point)
            i += 1
          })
        })
        console.log(data)
      } else {
        setData(null)
      }
    };
    fetch();
  }, []);

  if (!data) {
    return <>loading</>
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
          <Typography fontFamily="monospace" marginX={1}>
            FormID:{params.id}
          </Typography>
        </Box>
        <Box maxWidth={640} margin="auto">
          <Stack spacing={1} paddingX={2} paddingBottom={2} paddingTop={1}>
            <Typography variant="h1" fontSize={30}>
              {data.test.title}
            </Typography>
            <Typography>{data.test.summary}</Typography>
            <Typography>
              Start:{data.test.startDate.toString()} → Deadline:
              {data.test.endDate.toString()}
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* 問題部分 */}
      <Box maxWidth={640} margin="auto">
        <Box alignContent="center" padding={2}>
        {
          point == -1 ? <div>{"未採点"}</div> : <div>{"点数: " + point + "point"}</div>
        }
        </Box>
        <Tabs
          value={partIndex}
          onChange={handleChange}
          aria-label="Tabs of each PART"
        >
          {data.test.sections.map((section: any, index: number) => (
            <Tab
              key={section.number}
              label={`Part ${section.number}`}
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
            {section.questions.map((question: any) => {
              return <Paper key={question.id} sx={{ marginTop: 2, padding: 2 }}><React.Fragment key={question.id}>
                <Question
                  id={question.id.toString()}
                  number={question.number.toString()}
                  question={question.question}
                  myAns={question.ans.text}
                  trueAns={question.answer}
                  point={question.ans.point}
                />
              </React.Fragment>
              </Paper>
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
  return <Button onClick={() => setIndex(index - 1)}>Previous Part</Button>;
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
    return (
      <></>
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

function Question({ id, number, question, myAns, trueAns, point }: any) {
  return (
    <Stack spacing={2}>
      {/* 横に並べる */}
      <Box display="flex" alignItems="center">
        <Typography variant="h2" fontSize={17}>({number}) </Typography>
        <Latex>{question}</Latex>
      </Box>
      <Box
        display="flex"
        minHeight={40}
        alignItems="center"
        paddingX={2}
      >
        <BlockMath>{myAns}</BlockMath>
      </Box>
      <Divider />
      <Box
        display="flex"
        minHeight={40}
        alignItems="center"
        paddingX={2}
      >
        <Typography>答え</Typography>
        <Box minWidth={20} />
        <BlockMath>{trueAns}</BlockMath>
      </Box>
      <div>{point} point</div>
    </Stack>

  )
}
