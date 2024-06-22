"use client"
import React, {useState} from "react";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs"
import dayjs from 'dayjs'

interface TestType {
  title: string,
  summary: string,
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
}

import {Card, Stack, Input, TextField, Button, Container, Box} from '@mui/material';
import {LocalizationProvider} from "@mui/x-date-pickers";
import axios from "axios";

export default function Page() {
  const [sections, setSections] = useState<SectionType[]>([])
  const [testTitle, setTestTitle] = useState('')
  const [testSummary, setTestSummary] = useState('')
  const [endDate, setEndDate] = useState<Dayjs>(dayjs())

  const handleSectionChange = (item: SectionType, index: number) => {
    const newS = sections.map((s: SectionType, i: number) => {
      if (i === index) {
        return item
      } else {
        return {summary: s.summary, subSections: s.subSections, number: s.number}
      }
    })
    setSections(newS)
  }
  const handleRemove = (index: number) => {
    const newS = sections.filter((q: SectionType, i: number) => i !== index)
    const newS2 = newS.map((q: SectionType, i: number) => {
      return {summary: q.summary, subSections: q.subSections, number: index + 1}
    })
    setSections(newS2)
  }
  const handleAdd = () => {
    setSections([...sections].concat({summary: "", subSections: [], number: sections.length + 1}))
  }

  const data = {title: testTitle, summary: testSummary, sections: sections, endDate: endDate.toJSON(), classes:[]}

  const createTest = async () => {
    //TODO classes
    //const data = {title: testTitle, summary: testSummary, sections: sections, endDate: endDate.toJSON(), classes:[]}
    const response = await axios.post('/api/test/create', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert("test created\n" + str)
      }
    )
  }

  return (
    <Box width="100vw" justifyContent="center" display="flex">
      <Stack gap={2}>
        <Button variant={"contained"} onClick={createTest}>Create Test</Button>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker value={endDate} onChange={(val: Dayjs | null) => {
            if (val !== null) {
              setEndDate(val);
            }
          }}/>
        </LocalizationProvider>
        <TextField label="testTitle" onChange={(e) => setTestTitle(e.target.value)}></TextField>
        <TextField label="testSummary" onChange={(e) => setTestSummary(e.target.value)}></TextField>
        {sections.map((s: SectionType, index: number) => (
          <Section key={index} index={index} section={s} setSection={(s: SectionType) => {
            handleSectionChange(s, index)
          }} deleteSection={() => handleRemove(index)}/>
        ))}
        <Button onClick={handleAdd}>Add Section</Button>
        <p>{JSON.stringify(data)}</p>
      </Stack>
    </Box>
  );
};

const Section = ({index, section, setSection}: any) => {
  const handleSubSectionChange = (item: SubSectionType, index: number) => {
    const newS = section.subSections.map((s: SubSectionType, i: number) => {
      if (i === index) {
        return item
      } else {
        return {summary: s.summary, questions: s.questions, number: s.number}
      }
    })
    setSection({...section, subSections: newS})
  }

  const handleRemove = (index: number) => {
    const newS = section.subSections.filter((q: SubSectionType, i: number) => i !== index)
    const newS2 = newS.map((q: SubSectionType, i: number) => {
      return {summary: q.summary, questions: q.questions, number: i + 1}
    })
    setSection({...section, subSections: newS2})
  }

  const handleAdd = () => {
    const newQ = [...section.subSections]
    setSection({
      ...section,
      subSections: [...section.subSections].concat({summary: "", questions: [], number: section.subSections.length + 1})
    })
  }

  return (
    <Card>
      <Box justifyContent="center" display="flex">
        <Stack gap={2}>
          {section.subSections.map((s: SubSectionType, index: number) => (
            <SubSection key={index} index={index} subSection={s} setSubSection={(s: SubSectionType) => {
              handleSubSectionChange(s, index)
            }} deleteSubSection={() => handleRemove(index)}/>
          ))}
          <Button onClick={handleAdd}>Add SubSec</Button>
        </Stack>
      </Box>
    </Card>
  )
}

const SubSection = ({index, subSection, setSubSection, deleteSubSection}: any) => {
  const handleQuestionChange = (item: QuestionType, index: number) => {
    const newQ = subSection.questions.map((q: QuestionType, i: number) => {
      if (i === index) {
        return item
      } else {
        return {question: q.question, answer: q.answer, number: i + 1}
      }
    })
    setSubSection({...subSection, questions: newQ})
  }
  const handleRemove = (index: number) => {
    const newQ = subSection.questions.filter((q: QuestionType, i: number) => i !== index)
    const newQ2 = newQ.map((q: QuestionType, i: number) => {
      return {question: q.question, answer: q.answer, number: i + 1}
    })
    setSubSection({...subSection, questions: newQ2})
  }
  const handleAdd = () => {
    const newQ = [...subSection.questions]
    setSubSection({
      ...subSection,
      questions: [...subSection.questions].concat({question: "", answer: "", number: subSection.questions.length + 1})
    })
  }

  return (
    <Card>
      <Box justifyContent="center" display="flex">
        <Stack gap={1} width={600} margin={2}>
          <Box display="flex" justifyContent="space-between">
            <h5>{"(" + subSection.number + ")"}</h5>
            <Button onClick={deleteSubSection}>×</Button>
          </Box>
          {subSection.questions.map((q: QuestionType, index: number) => (
            <Question key={index} index={index} question={q} setQuestion={(q: QuestionType) => {
              handleQuestionChange(q, index)
            }} deleteQuestion={() => handleRemove(index)}/>
          ))}
          <Button onClick={handleAdd}>Add Question</Button>
        </Stack>
      </Box>
    </Card>
  )
}

const Question = ({index, question, setQuestion, deleteQuestion}: any) => {
  const questionInput = (e: any) => {
    const newQ = question
    newQ.question = e.target.value
    setQuestion(newQ)
  }
  const answerInput = (e: any) => {
    const newQ = question
    newQ.answer = e.target.value
    setQuestion(newQ)
  }

  return (
    <Stack gap={1} width={400} padding={2} border="1p">
      <Box display="flex" justifyContent="space-between">
        <h5>{"(" + question.number + ")"}</h5>
        <Button onClick={deleteQuestion}>×</Button>
      </Box>
      <TextField label={"question"} onChange={questionInput}></TextField>
      <TextField label={"answer"} onChange={answerInput}></TextField>
    </Stack>
  )
}