"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CardActionArea, } from "@mui/material";
import 'katex/dist/katex.min.css';
import { Test, Class } from "@prisma/client";

import Stack from '@mui/material/Stack';
import { getTestByClass } from "@/app/api/test/getTestByClass";
import { getClassByUser } from "@/app/api/class/getClass";
import { useSession } from 'next-auth/react';
import TopBar from "@/compornents/TopBar";

interface TestInterface {
  test: Test,
  class: Class,
};

export default function Mypage() {
  const { data: session, status } = useSession();
  // when not logining

  if (session) {
    const userName = session.user.name;
    if (userName) {
      return <MypageContent userName={userName} />
    }
  }


}
const MypageContent = (props: { userName: string }) => {
  const [testId, setTestId] = useState<number[]>([])
  const [tests, setTests] = useState<TestInterface[]>([]);

  useEffect(() => {
    getTests()
  }, [])
  const getTests = async () => {
    const test = await getClassByUser(props.userName)
      .then(async (classes: Class[]) => {
        const tmp = classes.map(async (c: Class) => {
          const tmpClass = await getTestByClass(c.id)
          return tmpClass.map((t: Test) => {
            return { test: t, class: c }
          })
        });
        return tmp

      })

    setTests((await Promise.all(test)).flat(1))
  }

  const TestCard = () => {
    return (
      <Stack spacing={2}>
        {
          tests.map((item, id) => (
            <Card key={id}>
              <CardActionArea onClick={
                () => {
                  location.href = "/solve/" + item.test.id
                }}
              >
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {item.class.name}
                  </Typography>
                  <Typography gutterBottom variant="h5" component="div">
                    {item.test.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"Start: " +
                      item.test.startDate.getFullYear() + "/" + (item.test.startDate.getMonth() + 1) + "/" + item.test.startDate.getDate() + " " +
                      item.test.startDate.getHours() + ":" + item.test.startDate.getMinutes() +
                      " (UTC+" + item.test.startDate.getTimezoneOffset() / -60 + "h)"
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {"End : " +
                      item.test.endDate.getFullYear() + "/" + (item.test.endDate.getMonth() + 1) + "/" + item.test.endDate.getDate() + " " +
                      item.test.endDate.getHours() + ":" + item.test.endDate.getMinutes() +
                      " (UTC+" + item.test.endDate.getTimezoneOffset() / -60 + "h)"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        }
      </Stack>
    )
  }

  return (
    <>
      <TopBar page_name={"My Page"} user_name={props.userName} />
      <Stack maxWidth={800} marginX={"auto"} padding={2}>
        <TestCard />
      </Stack>
    </>
  )
}