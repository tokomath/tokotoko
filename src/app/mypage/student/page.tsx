"use client";

import React, { useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Box,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Popover,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ClassIcon from "@mui/icons-material/Class";

import "katex/dist/katex.min.css";
import type { Test, Class as PrismaClass } from "@prisma/client";

import { getTestByClass } from "@/app/api/test/getTestByClass";
import { getClassByUserId } from "@/app/api/class/getClass";
import { isAlreadySubmit } from "@/app/api/test/submit";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { StudentTestCard } from "@/compornents/StudentTestCard";

const TAB_WIDTH = 100;
const HEADER_HEIGHT = 64;

interface TestInterface {
  test: Test;
  class: PrismaClass;
}
interface TestWithSubmitStatus extends TestInterface {
  submitted: boolean;
}
interface ClassWithTests extends PrismaClass {
  tests: TestWithSubmitStatus[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        display: value === index ? "block" : "none",
        width: "100%",
        height: "100%",
      }}
      {...other}
    >
      <Box sx={{ p: 3 }}>{children}</Box>
    </div>
  );
}
const a11yProps = (i: number) => ({
  id: `vertical-tab-${i}`,
  "aria-controls": `vertical-tabpanel-${i}`,
});

export default function Mypage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <>Loading</>;
  if (isSignedIn && user) return <Page />;
  router.push("/sign-in");
}

interface ClassCardProp {
  classData: ClassWithTests;
}
function ClassCard({ classData }: ClassCardProp) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  let allSubmitted = true;
  classData.tests.forEach(test => {
    if (test.submitted == false) {
      allSubmitted = false;
    }
  });

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardActionArea onClick={(e) => setAnchorEl(e.currentTarget)}>
          <CardContent>
            <Typography variant="h5">{classData.name}</Typography>
            <>{function () {
              let comp: JSX.Element[] = [];
              for (let i = 0; i < 3; i++) {
                if (i < classData.tests.length) {
                  comp.push(
                    <Box display="flex" width="stretch" key={i}>
                      <Typography width="50%">{classData.tests.at(i)?.test?.title}</Typography>
                      {
                        classData.tests.at(i)?.submitted ?
                          <Typography width="50%" textAlign="right" color="rgba(0,200,64,0.7)">提出済み</Typography> :
                          <Typography width="50%" textAlign="right" color="rgba(255,0,0,0.9)" fontWeight="bold">未提出</Typography>
                      }
                    </Box>
                  );
                }
                else
                  comp.push(
                    <Box width="stretch" alignContent="center" key={i}>
                      <Typography>　</Typography>
                    </Box>);
              }
              return comp;
            }()}</>
          </CardContent>
        </CardActionArea>
      </Card>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableAutoFocus
        disableEnforceFocus
      >
        <Box sx={{ p: 2, width: "70vw" }}>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Tests
          </Typography>

          {classData.tests.length === 0 ? (
            <Typography color="text.secondary">テストはありません</Typography>
          ) : (
            <Grid container spacing={2}>
              {classData.tests.map((t, id) => (
                <StudentTestCard test={t} key={t.test.id} />
              ))}
            </Grid>)}

        </Box>
      </Popover>
    </Grid>
  );
}

const Page = () => {
  const [tab, setTab] = useState(0);

  const [tests, setTests] = useState<TestWithSubmitStatus[]>([]);
  const [classList, setClassList] = useState<ClassWithTests[]>([]);
  const { isLoaded: isUserLoaded, user } = useUser();

  useEffect(() => {
    if (!isUserLoaded || !user) return;

    const load = async () => {
      const classes = await getClassByUserId(user.id);

      const map: Record<string, ClassWithTests> = {};
      classes.forEach((c) => {
        map[c.id] = { ...c, tests: [] };
      });

      const rawTests: TestInterface[] = (
        await Promise.all(
          classes.map(async (c) => {
            const ts = await getTestByClass(c.id);
            return ts.map<TestInterface>((t) => ({ test: t, class: c }));
          })
        )
      ).flat();

      const submittedPairs = await Promise.all(
        rawTests.map(async ({ test }) => {
          const ok = await isAlreadySubmit({ testId: test.id, userId: user.id });
          return [test.id, ok] as const;
        })
      );
      const submittedMap = Object.fromEntries(submittedPairs);
      const testsWithSubmit: TestWithSubmitStatus[] = rawTests.map((t) => ({
        ...t,
        submitted: submittedMap[t.test.id] ?? false,
      }));
      setTests(testsWithSubmit);

      testsWithSubmit.forEach((tw) => {
        map[tw.class.id]?.tests.push(tw);
      });

      setClassList(Object.values(map));
    };

    load();
  }, [isUserLoaded, user]);

  return (
    <Box sx={{ display: "flex", height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
      <Box
        sx={{
          width: TAB_WIDTH,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          display: "flex",
        }}
      >
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, v) => setTab(v)}
          aria-label="menu"
          sx={{ width: "100%", mt: 1 }}
        >
          <Tab icon={<ClassIcon />} label="Class" {...a11yProps(0)} />
          <Tab icon={<EditNoteIcon />} label="Test" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <TabPanel value={tab} index={0}>
          <Grid container spacing={2}>
            {classList.map((c, id) => (
              <ClassCard classData={c} key={id} />
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Grid container spacing={2}>
            {tests.map((t, id) => (
              <StudentTestCard test={t} key={id} />
            ))}
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};
