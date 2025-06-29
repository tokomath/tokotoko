"use client";

import React, { useEffect, useState } from "react";
import { Tab, Tabs, Box, Grid } from "@mui/material";
import EditNoteIcon from '@mui/icons-material/EditNote';
import ClassIcon from "@mui/icons-material/Class";

import "katex/dist/katex.min.css";
import { Test, Class } from "@prisma/client";

import { getTestByClass } from "@/app/api/test/getTestByClass";
import { getClassByUserId } from "@/app/api/class/getClass";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { isAlreadySubmit } from "@/app/api/test/submit";
import { StudentTestCard } from "@/compornents/StudentTestCard"

const TAB_WIDTH = 100;
const HEADER_HEIGHT = 64;

interface TestInterface {
  test: Test;
  class: Class;
}

interface TestWithClass extends TestInterface {
  submitted: boolean;
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

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function Mypage() {
  const router = useRouter();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();

  if (!isUserLoaded) {
    return <>Loading</>;
  }

  if (isSignedIn && user) {
    const userName = `${user.firstName} ${user.lastName}`;
    if (userName) {
      return <Page/>;
    }
  } else {
    router.push("/sign-in");
  }
}

const Page = () => {
  const [value, setValue] = useState(0);
  const handleChange = (_: React.SyntheticEvent, newValue: number) => setValue(newValue);

  const [tests, setTests] = useState<TestWithClass[]>([]);
  const { isLoaded: isUserLoaded, user } = useUser();

  useEffect(() => {
    if (!isUserLoaded || !user) return;

    const loadTests = async () => {
      const classes = await getClassByUserId(user.id);
      const testList = (
        await Promise.all(
          classes.map(async (c: Class) => {
            const classTests = await getTestByClass(c.id);
            return classTests.map<TestInterface>((t) => ({ test: t, class: c }));
          })
        )
      ).flat();

      const submittedPairs = await Promise.all(
        testList.map(async ({ test }) => {
          const ok = await isAlreadySubmit({ testId: test.id, userId: user.id });
          return [test.id, ok] as const;
        })
      );
      const submittedMap = Object.fromEntries(submittedPairs);

      setTests(
        testList.map((tc) => ({
          ...tc,
          submitted: submittedMap[tc.test.id] ?? false,
        }))
      );
    };

    loadTests();
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
          value={value}
          onChange={handleChange}
          aria-label="menu"
          sx={{ width: "100%", mt: 1 }}
        >
          <Tab icon={<ClassIcon />} label="Class" {...a11yProps(0)} sx={{ textTransform: "none" }} />
          <Tab icon={<EditNoteIcon />} label="Test" {...a11yProps(1)} sx={{ textTransform: "none" }} />
        </Tabs>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <TabPanel value={value} index={0}></TabPanel>
        <TabPanel value={value} index={1}>
          <Grid container spacing={2}>
            {tests.map((t,id) => (
              <StudentTestCard test={t} key={id} />
            ))}
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};
