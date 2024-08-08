"use client";

import React, {useEffect, useState} from "react";
import {List, ListItem, Card, CardContent, Typography, Button, Link, Box} from "@mui/material";
import 'katex/dist/katex.min.css';
import {Test, Class, User} from "@prisma/client";


import SchoolIcon from '@mui/icons-material/School';
import Stack from '@mui/material/Stack';
import {getTestByClass} from "@/app/api/test/getTestByClass";
import {getClassByUser} from "@/app/api/class/getClass";
import { useSession } from 'next-auth/react';

interface TestInterface {
  test: Test,
  class: Class,
};

export default function Mypage() {
  const {data: session, status } = useSession();
  // when not logining
  
  if(session){
    const userName = session.user.name;
    if(userName){
      return <MypageContent userName={userName} />
    }
  } 


}
const MypageContent = (props: {userName: string}) => {
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
            return {test: t, class: c}
          })
        });
        return tmp

      })

    setTests((await Promise.all(test)).flat(1))
  }

  const TestCard = () => {
    return (
      <Box width={"100%"} alignSelf={"center"}>
        {
          tests.map((item, idx) => (
            // eslint-disable-next-line react/jsx-key
            <Box margin={"15px"}>
              <Link href={"/solve/" + item.test.id}>
                <Card key={idx}>
                  <CardContent>
                    <Stack direction={"row"} justifyContent={"space-between"}>
                      <Typography alignSelf={"center"} variant="h4">
                        {item.test.title}
                      </Typography>
                      <Stack>
                        <Typography textAlign={"right"} variant="h6">
                          {"deadline/  " + item.test.endDate.toDateString()}
                        </Typography>
                        <Typography textAlign={"right"} variant="h6">
                          {"class/  " + item.class.name}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography variant="h6">
                      {"summary:  " + item.test.summary}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Box>
          ))
        }
      </Box>
    )
  }

  return (
    <Stack marginX={"10px"} alignContent={"center"}>
      <Stack alignSelf={"center"} direction={"row"}>
        <Box paddingX={"10px"}>
          <SchoolIcon fontSize={"large"}/>
        </Box>
        <Stack direction={"row"}>
          <Typography textAlign={"center"} variant="h3">
            {props.userName}
          </Typography>
        </Stack>
      </Stack>
      <TestCard/>
    </Stack>
  )
}