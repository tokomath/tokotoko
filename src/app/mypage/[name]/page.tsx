"use client";
import axios from 'axios'
import { useEffect, useState } from "react";
import { List, ListItem, Card, CardContent, Typography } from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';

interface Test {
  class: string,
  summary: string,
}

export default function Mypage({ params }: { params: { name: string } }) {
  const [tests, setTests] = useState<Test[]>([]);
  useEffect(() => {
    async function f() {
      const tests = await axios.post("/api/mypage", { data: { name: params.name } });
      setTests(tests.data);
    }
    f()
  }, []);
  return (
    <li>
      {
        tests.map((item, idx) => (
          <ol key={idx}>
            <Card>
              <CardContent>
                <Typography variant= "h5">
                  {item.summary}
                </Typography>
                <Typography variant="h6">
                  {"class:  " + item.class}
                </Typography>
              </CardContent>
            </Card>
          </ol>
        ))
      }
    </li>
  )
}
