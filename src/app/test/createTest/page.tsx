"use client"
import React, {useEffect, useState} from "react";
import {Alert, Box, Button, Card, IconButton, Stack, Tab, Tabs, TextField, Typography} from "@mui/material";
import {InlineMath} from "react-katex";
import 'katex/dist/katex.min.css';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
// import {LocalizationProvider} from "@mui/x-date-pickers";

import {TestFrame, SectionFrame, SubSectionFrame, createTest} from "@/app/api/testAPIs";
import {Test, Section, Question} from "@prisma/client";
import dayjs, {Dayjs} from "dayjs";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

export default function Page() {
  const [sections, setSections] = useState<SectionFrame[]>([])
  const [testTitle, setTestTitle] = useState("")
  const [testSummary, setTestSummary] = useState("")
  const [value, setValue] = React.useState(0);

  const [endDate, setEndDate] = useState<Dayjs>(dayjs())
  const [startDate, setStartDate] = useState<Dayjs>(dayjs())

  const handleSectionChange = (item: SectionFrame, index: number) => {
    const newS: SectionFrame[] = sections.map((s: SectionFrame, i: number) => {
      if (i === index) {
        return item
      } else {
        return {section: s.section, subSections: s.subSections}
      }
    })
    setSections(newS)
  }
  const handleRemove = (index: number) => {
    if (sections.length === value) {
      setValue(value - 1)
    }
    const newS: SectionFrame[] = sections.filter((q: SectionFrame, i: number) => i !== index)
    const newS2: SectionFrame[] = newS.map((q: SectionFrame, i: number) => {
      const section: Section = {id: 1, testId: 1, summary: q.section.summary, number: index + 1}
      return {section: section, subSections: q.subSections}
    })
    setSections(newS2)
  }
  const handleAdd = () => {
    const section: Section = {id: 1, testId: 1, summary: "", number: sections.length + 1}
    setSections([...sections].concat({section: section, subSections: []}))
  }

  const createTestButtonFunction = async () => {
    //TODO classes

    alert("Complete Create Test")
    const newTest: Test = {
      id: 1,
      title: testTitle,
      summary: testSummary,
      startDate: startDate.toDate(),
      endDate: endDate.toDate()
    }
    const newTestFrame: TestFrame = {test: newTest, sections: sections}
    await createTest(newTestFrame)
  }

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


  // エラーを追加する場合はCreateErrorとcheckDataErrorを変更する
  const CreateError = () => {
    const isAfterWarning = () => {
      if (startDate.isAfter(endDate)) {
        return (
          <Alert severity="error">開始日が締め切りより後です</Alert>
        )
      }
    }
    return (
      isAfterWarning()
    )
  }

  const checkDataError = () => {
    return startDate.isAfter(endDate)
  }

  return (
    <Stack gap={2} justifyContent={"center"} display={"flex"} marginX={"5vw"}>
      <Button variant={"contained"} onClick={createTestButtonFunction} /*disabled={checkDataError()}*/ >Create
        Test</Button>
      <CreateError/>


      <Box
        sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex'}}
        alignSelf={"center"}
        width={"100%"}
        p={"10px"}
        overflow={"scroll"}
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
          {sections.map((s: SectionFrame, index: number) => (
            <Tab label={index} {...a11yProps(index)} key={index}/>
          ))}
          <Tab icon={<AddIcon/>} onClick={handleAdd} {...a11yProps(sections.length)}/>
        </Tabs>

        <TabPanels value={value} index={0}>
          <MetaDataPage
            testTitle={testTitle}
            setTestTitle={setTestTitle}
            testSummary={testSummary}
            setTestSummary={setTestSummary}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </TabPanels>
        {sections.map((s: SectionFrame, index: number) => (
          <TabPanels value={value} index={index + 1} key={index + 1}>
            <SectionPage key={index} index={index} section={s}
                         setSection={(s: SectionFrame) => {
                           handleSectionChange(s, index)
                         }}
                         deleteSection={() => handleRemove(index)}/>
          </TabPanels>
        ))}
      </Box>
    </Stack>
  );
};

// stateが更新されるたびにレンダリングされるのを避ける
// Page()の中に書かないで
const TabPanels = (props: any) => {
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

const MetaDataPage = ({
                        // SectionPage内のstate
                        testTitle,
                        setTestTitle,
                        testSummary,
                        setTestSummary,
                        startDate,
                        setStartDate,
                        endDate,
                        setEndDate
                      }: any) => {
  const dateWarning = () => {
    const isBeforeWarning = () => {
      if (startDate.isBefore(dayjs())) {
        return (
          <Alert severity="warning">開始日が現在日より前です</Alert>
        )
      }
    }

    return (
      <Stack spacing={"5px"}>
        {isBeforeWarning()}
      </Stack>
    );
  }
  return (
    <Stack gap={2} width={"100%"} padding={2} border="1p">
      <Typography variant={"h5"}>Test Metadata</Typography>
      {/*タイトル・概要*/}
      <TextField label="タイトル" value={testTitle} onChange={(e) => setTestTitle(e.target.value)}/>
      <TextField label="説明" value={testSummary} onChange={(e) => setTestSummary(e.target.value)}/>
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
      {dateWarning()}
    </Stack>
  )
}

const SectionPage = ({index, section, setSection, deleteSection}: any) => {
  const handleSubSectionChange = (item: SubSectionFrame, index: number) => {
    const newS = section.subSections.map((s: SubSectionFrame, i: number) => {
      if (i === index) {
        return item
      } else {
        return {subSection: s.subSection, questions: s.questions}
      }
    })
    setSection({...section, subSections: newS})
  }

  const handleAdd = () => {
    const newSubSection: SubSectionFrame = {
      subSection: {
        id: 1,
        sectionId: 1,
        summary: "",
        number: section.subSections.length + 1
      }, questions: []
    }
    const subSections: SubSectionFrame[] = [...section.subSections].concat(newSubSection)
    const newSection: SectionFrame = {section: section.section, subSections: subSections}
    setSection(newSection)
  }

  const handleRemoveSubSection = (index: number) => {
    const newS = section.subSections.filter((q: SubSectionFrame, i: number) => i !== index)
    const newS2 = newS.map((q: SubSectionFrame, i: number) => {
      return {subSection: q.subSection, questions: q.questions}
    })
    setSection({...section, subSections: newS2})
  }

  return (
    <Stack justifyContent="center" display="flex" width={"100%"} height={"100%"} gap={2} alignItems={"left"}>
      <Box width={"100%"} alignItems={"right"}>
        <Button startIcon={<DeleteIcon/>} onClick={deleteSection}>Delete</Button>
      </Box>
      {section.subSections.map((s: SubSectionFrame, index: number) => (
        <SubSectionPage key={index} indexProps={index} subSectionProps={s} setSubSection={(s: SubSectionFrame) => {
          handleSubSectionChange(s, index)
        }} deleteSubSection={() => handleRemoveSubSection(index)}/>
      ))}
      <Button onClick={handleAdd}>Add SubSec</Button>
    </Stack>
  )
}

const SubSectionPage = ({indexProps, subSectionProps, setSubSection, deleteSubSection}: any) => {
  const [subSectionSummary, setSubSectionSummary] = useState(subSectionProps.subSection.summary)
  const subSection: SubSectionFrame = subSectionProps;


  const changeSubSectionSummary = (newSummary: string) => {
    const newSubSection: SubSectionFrame = {
      subSection: {
        id: 1,
        sectionId: 1,
        summary: newSummary,
        number: subSection.subSection.number
      }, questions: subSection.questions
    }
    setSubSection(newSubSection)
  }

  useEffect(() => {
    changeSubSectionSummary(subSectionSummary)
  }, [subSectionSummary]);

  const handleQuestionChange = (item: Question, index: number) => {
    const newQ = subSection.questions.map((q: Question, i: number) => {
      if (i === index) {
        return item
      } else {
        const question: Question = {id: 1, subSectionId: 1, question: q.question, number: i + 1, answer: q.answer}
        return question;
      }
    })
    setSubSection({...subSection, questions: newQ})
  }
  const handleRemove = (index: number) => {
    const newQ = subSection.questions.filter((q: Question, i: number) => i !== index)
    const newQ2 = newQ.map((q: Question, i: number) => {
      return {question: q.question, answer: q.answer, number: i + 1}
    })
    setSubSection({...subSection, questions: newQ2})
  }
  const handleAdd = () => {
    const question: Question = {
      id: 1,
      subSectionId: 1,
      question: "",
      number: subSection.questions.length + 1,
      answer: ""
    }

    const questions: Question[] = [...subSection.questions].concat(question)
    const newSubSection: SubSectionFrame = {subSection: subSection.subSection, questions: questions}
    setSubSection(newSubSection)
  }

  return (
    <Card>
      <Box alignSelf={"left"} width={"auto"} display="flex">
        <Stack gap={1} width={"100%"} margin={2}>
          <Box display="flex" justifyContent="space-between">
            <InlineMath>{subSection.subSection.number + ". \\quad" + subSectionSummary}</InlineMath>
            <IconButton aria-label="delete" onClick={deleteSubSection}>
              <CloseIcon/>
            </IconButton>
          </Box>
          <TextField label={"SubSection"} value={subSectionSummary}
                     onChange={(e) => {
                       setSubSectionSummary(e.target.value)
                     }}/>
          {subSection.questions.map((q: Question, index: number) => (
            <QuestionPage key={index} index={index} question={q} setQuestion={(q: Question) => {
              handleQuestionChange(q, index)
            }} deleteQuestion={() => handleRemove(index)}/>
          ))}
          <Button onClick={handleAdd}>Add Question</Button>
        </Stack>
      </Box>
    </Card>
  )
}

const QuestionPage = ({index, question, setQuestion, deleteQuestion}: any) => {
  const setAns = (newAns: string) => {
    const newQ = question
    question.answer = newAns

    setQuestion(newQ);
  }

  const setQues = (newQues: string) => {
    const newQ = question
    question.question = newQues

    setQuestion(newQ);
  }

  return (
    <Stack gap={1} width={"100%"} padding={2} border="1p">
      <Box display="flex" justifyContent="space-between">
        <InlineMath>{"(" + question.number + ")\\quad" + question.question}</InlineMath>
        <IconButton aria-label="delete" onClick={deleteQuestion}>
          <CloseIcon/>
        </IconButton>
      </Box>
      <TextField label={"question"} value={question.question} onChange={(e) => setQues(e.target.value)}/>
      <InlineMath>{"A.\\quad" + question.answer}</InlineMath>
      <TextField label={"answer"} value={question.answer} onChange={(e) => setAns(e.target.value)}/>
    </Stack>
  )
}
