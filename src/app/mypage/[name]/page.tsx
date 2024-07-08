"use client";

import axios from 'axios'
import React, {useEffect, useState} from "react";
import {List, ListItem, Card, CardContent, Typography, Button, Link, Box} from "@mui/material";
import 'katex/dist/katex.min.css';
import {Test} from "@prisma/client";

import {getTestById} from "@/app/api/testAPIs";

import SchoolIcon from '@mui/icons-material/School';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';

export default function Mypage({params}: { params: { name: string } }) {
  const [testId, setTestId] = useState<number[]>([])
  const [tests, setTests] = useState<Test[]>([]);

  const getTestId = async () => {
  }

  const getTests = async () => {
    const res = await Promise.all(testId.map(async (id: number) => {
      return getTestById(id)
    }))
    const filled: Test[] = res.filter((item) => item !== null) as Test[]

    setTests(filled)
  }

  const TestCard = () => {
    return (
      <Box width={"100%"} alignSelf={"center"}>
        {
          tests.map((item, idx) => (
            // eslint-disable-next-line react/jsx-key
            <Box margin={"15px"}>
              <Card key={idx}>
                <CardContent>
                  <Link href={"/solve/" + item.id}>
                    <Stack direction={"row"}>
                      <Typography alignSelf={"center"} variant="h5">
                        {item.summary}
                        <OpenInNewIcon fontSize={"small"}/>
                      </Typography>
                    </Stack>
                  </Link>

                  <Typography variant="h6">
                    {"class:  " + item.class}
                  </Typography>
                </CardContent>
              </Card>
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
            {params.name}
          </Typography>
        </Stack>
      </Stack>
      <TestCard/>
    </Stack>
  )
}
