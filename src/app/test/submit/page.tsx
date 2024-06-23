"use client"
import React, {useEffect, useState} from "react";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs"
import dayjs from 'dayjs'

interface TestType {
  title: string,
  summary: string,
  startDate: Date,
  endDate: Date,
  sections: SectionType[],
}

interface SectionType {
  summary: string,
  number: number,
  subSections: SubSectionType[],
}

interface SubSectionType {
  summary: string,
  number: number,
  questions: QuestionType[],
}

interface QuestionType {
  question: string,
  number: number,
  answer: string,
  id: number,
}

import {Card, Stack, Input, TextField, Button, Container, Box} from '@mui/material';
import {LocalizationProvider} from "@mui/x-date-pickers";
import axios from "axios";

export default function Page() {
  const [testId, setTestId] = useState<number>(0)
  const [test, setTest] = useState<TestType | null>()
  const [studentName, setStudentName] = useState('')
  const [studentPass, setStudentPass] = useState('')
  const [answer, setAnswer] = useState(new Map())
  const updateMap = (key: number, value: string) => {
    const mp = {...answer}
    // @ts-ignore
    mp[key] = value
    setAnswer(mp)
  }

  const handleSubmit = async () => {
    const answerList: any = []
    const ans = {...answer}
    Object.keys(ans).forEach((key) => {
      // @ts-ignore
      answerList.push({id: Number(key), text: ans[key]})
    })
    const response = await axios.post("/api/test/submit", {
      student_name: studentName,
      student_pass: studentPass,
      test_id: testId,
      answers: answerList
    }).then((res) => {
      alert("Submit")
    }).catch((e) => {
      alert(e)
    })
  }

  const handleLoad = async () => {
    const response = await axios.post("/api/test/get", {id: testId}).then((res) => {
      setTest(res.data)
      const map = new Map()
      if (res.data !== undefined && res.data !== null) {
        res.data.sections.forEach((section: SectionType) => {
          section.subSections.forEach((subSection: SubSectionType) => {
            subSection.questions.forEach((question: QuestionType) => {
              // @ts-ignore
              map[question.id] = ""
            })
          })
        })
      }
      setAnswer(map)
    }).catch((e) => {
      alert(e)
    })
  }
  return (
    <Box width="100vw" justifyContent="center" display="flex">
      <Stack gap={2}>
        <TextField label="test ID" inputMode="numeric"
                   onChange={(e) => setTestId(Number(e.target.value))}></TextField>
        <Button onClick={handleLoad}>Load Test</Button>
        <TextField label="student name" onChange={(e) => setStudentName(e.target.value)}></TextField>
        <TextField label="student pass" onChange={(e) => setStudentPass(e.target.value)}></TextField>
        {
          (test === null || test === undefined) ? <Box><p>no test found</p></Box> :
            <Test item={test} updateMap={updateMap}/>
        }
        <Button onClick={handleSubmit}>Submit</Button>
        <Box width={500}><p>{JSON.stringify(test)}</p></Box>
        <Box width={500}><p>{JSON.stringify(answer)}</p></Box>
      </Stack>
    </Box>
  )
}

const Test = ({item, updateMap}: any) => {
  return (
    <Box width={500}>
      <Stack>
        <h3>{"title: " + item.title}</h3>
        <p>{"summary: " + item.summary}</p>
        {item.sections.map((section: SectionType, index: number) => {
          return (<Section key={index} item={section} updateMap={updateMap}/>)
        })}
      </Stack>
    </Box>)
}

const Section = ({item, updateMap}: any) => {
  return (
    item.subSections.map((subSection: SubSectionType, index: number) => {
      return (<SubSection key={index} item={subSection} updateMap={updateMap}/>)
    })
  )
}

const SubSection = ({item, updateMap}: any) => {
  return (
    item.questions.map((question: QuestionType, index: number) => {
      return (<Question key={index} item={question} updateMap={updateMap}/>)
    })
  )
}
const Question = ({item, updateMap}: any) => {
  return (
    <Card>
      <Stack>
        <h3>{item.number}</h3>
        <p>{item.question}</p>
        <TextField label={"answer"} onChange={(e) => {
          updateMap(item.id, e.target.value)
        }}/>
      </Stack>
    </Card>
  )
}