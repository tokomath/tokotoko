"use client"
import React, {useState} from "react";
// import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
// import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Box, Button, Card, IconButton, Stack, Tab, Tabs, TextField, Typography} from "@mui/material";

import {addStyles} from 'react-mathquill'
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
// import {LocalizationProvider} from "@mui/x-date-pickers";
import axios from "axios";
import {TabPanel} from "@mui/base";

addStyles()

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

export default function Page() {
  const [sections, setSections] = useState<SectionType[]>([])
  const [testTitle, setTestTitle] = useState('')
  const [testSummary, setTestSummary] = useState('')
  //Todo
  // const [endDate, setEndDate] = useState<Dayjs>(dayjs())
  // const [startDate, setStartDate] = useState<Dayjs>(dayjs())

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
    if (sections.length === value) {
      setValue(value - 1)
    }
    const newS = sections.filter((q: SectionType, i: number) => i !== index)
    const newS2 = newS.map((q: SectionType, i: number) => {
      return {summary: q.summary, subSections: q.subSections, number: index + 1}
    })
    setSections(newS2)
  }
  const handleAdd = () => {
    setSections([...sections].concat({summary: "", subSections: [], number: sections.length + 1}))
  }
  //Todo :date
  const data = {title: testTitle, summary: testSummary, sections: sections,/* endDate: endDate.toJSON(),*/ classes: []}

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

  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const TabPanel = (props: any) => {
    const {children, value, index} = props;

    return (
      <Box
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        width={"100%"}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Stack gap={2} justifyContent={"center"} display={"flex"} marginX={"5vw"}>
      <Button variant={"contained"} onClick={createTest}>Create Test</Button>
      {/*
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Typography variant="h6">開始日</Typography>
          <DateTimePicker value={startDate} onChange={(val: Dayjs | null) => {
            if (val !== null) {
              setStartDate(val);
            }
          }}/>
          <Typography variant="h6">締め切り</Typography>
          <DateTimePicker value={endDate} onChange={(val: Dayjs | null) => {
            if (val !== null) {
              setEndDate(val);
            }
          }}/>
        </LocalizationProvider>
        */}
      <Box
        sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex'}}
        alignSelf={"center"}
        width={"100%"}
        height={"100%"}
        p={"10px"}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          orientation="vertical"
          variant="scrollable"
          sx={{borderRight: 1, borderColor: 'divider'}}
          aria-label="section tabs"
        >
          <Tab label={"metadata"}/>
          {sections.map((s: SectionType, index: number) => (
            <Tab label={index} {...a11yProps(index)} key={index}/>
          ))}
          <Tab icon={<AddIcon/>} onClick={handleAdd} {...a11yProps(sections.length)}/>
        </Tabs>

        <TabPanel value={value} index={0}>
          <Box display="flex" justifyContent="center" alignItems="center" width={"100%"}>
            <Stack gap={2} width={"100%"} padding={2} border="1p">
              <Typography variant={"h5"}>Test Metadata</Typography>
              {/*タイトル・概要*/}
              <TextField label="タイトル" onChange={(e) => setTestTitle(e.target.value)}></TextField>
              <TextField label="説明" onChange={(e) => setTestSummary(e.target.value)}></TextField>
            </Stack>

          </Box>
        </TabPanel>
        {sections.map((s: SectionType, index: number) => (
          <TabPanel value={value} index={index + 1} key={index + 1}>
            <Section key={index} index={index} section={s}
                     setSection={(s: SectionType) => {
                       handleSectionChange(s, index)
                     }}
                     deleteSection={() => handleRemove(index)}/>
          </TabPanel>
        ))}
      </Box>
      <p>{JSON.stringify(data)}</p>
    </Stack>
  );
};

const Section = ({index, section, setSection, deleteSection}: any) => {
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

  const handleAdd = () => {
    const newQ = [...section.subSections]
    setSection({
      ...section,
      subSections: [...section.subSections].concat({summary: "", questions: [], number: section.subSections.length + 1})
    })
  }

  const handleRemoveSubSection = (index: number) => {
    const newS = section.subSections.filter((q: SubSectionType, i: number) => i !== index)
    const newS2 = newS.map((q: SubSectionType, i: number) => {
      return {summary: q.summary, questions: q.questions, number: i + 1}
    })
    setSection({...section, subSections: newS2})
  }

  return (
    <Stack justifyContent="center" display="flex" width={"100%"} height={"100%"} gap={2} alignItems={"left"}>
      <Box width={"100%"} alignItems={"right"}>
        <Button startIcon={<DeleteIcon/>} onClick={
          deleteSection
        }>Delete</Button>
      </Box>
      {section.subSections.map((s: SubSectionType, index: number) => (
        <SubSection key={index} index={index} subSection={s} setSubSection={(s: SubSectionType) => {
          handleSubSectionChange(s, index)
        }} deleteSubSection={() => handleRemoveSubSection(index)}/>
      ))}
      <Button onClick={handleAdd}>Add SubSec</Button>
    </Stack>
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
      <Box alignSelf={"left"} width={"auto"} display="flex">

        <Stack gap={1} width={"100%"} margin={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant={"h5"}>{subSection.number + "."}</Typography>
            <IconButton aria-label="delete" onClick={deleteSubSection}>
              <CloseIcon/>
            </IconButton>
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
    newQ.answer = e
    setQuestion(newQ)
  }

  return (
    <Stack gap={1} width={"100%"} padding={2} border="1p">
      <Box display="flex" justifyContent="space-between">
        <Typography variant={"h6"}>{"(" + question.number + ")"}</Typography>
        <IconButton aria-label="delete" onClick={deleteQuestion}>
          <CloseIcon/>
        </IconButton>
      </Box>
      <TextField label={"question"} onChange={questionInput}></TextField>
      <TextField label={"answer"} onChange={answerInput}></TextField>
    </Stack>
  )
}
