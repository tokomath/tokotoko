"use client";
import axios from 'axios'
import {useEffect, useState} from "react";
import {List, ListItem, Card, CardContent, Typography, Button, Link, Box} from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';

interface Test {
  class: string,
  summary: string,
  id: number,
}

export default function Mypage({params}: { params: { name: string } }) {
  const [tests, setTests] = useState<Test[]>([]);
  useEffect(() => {
    async function f() {
      const tests = await axios.post("/api/mypage", {data: {name: params.name}});
      setTests(tests.data);
    }

    f()
  }, []);

  return (
    <Stack justifyContent={"center"} alignItems={"center"}>
      <h2>assigned tests</h2>
      {
        tests.map((item, idx) => (
            <Link key={idx} href={"/test/form/" + item.id}>
              <Card>
                <Box width={400}>
                  <CardContent>
                    <Typography variant="h5">
                      {item.summary}
                    </Typography>
                    <Typography variant="h6">
                      {"class:  " + item.class}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Link>
        ))
      }
    </Stack>
  )
}
