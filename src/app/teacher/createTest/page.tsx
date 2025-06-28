"use client"

import React, { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputLabel,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  FormControl,
  OutlinedInput,
  MenuItem,
  Chip,
} from "@mui/material";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  TestFrame,
  SectionFrame,
} from "@/app/api/test/testFrames";
import { createTest } from "@/app/api/test/createTest";

import { Test, Section, Question, Class } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';

import Latex from "react-latex-next";
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from '@clerk/nextjs'

import { getClassByUserId } from "@/app/api/class/getClass";

import InsertFrame from "@/compornents/InsertFrame";
import { TeacherGuard } from "@/lib/guard"


const insert_options = ["None", "Image", "HTML"];

// useSearchParamsを使用するコンポーネントをClientSearchParamWrapperとして分離
function ClientSearchParamWrapper() {
  const searchParams = useSearchParams();
  const param_classId = searchParams.get("classId");

  const [sections, setSections] = useState<SectionFrame[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [testSummary, setTestSummary] = useState("");
  const [value, setValue] = React.useState(0);

  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [assignedClass, setAssignedClass] = useState<Class[]>([]);

  const [classList, setClassList] = useState<Class[]>([]);
  const teacherId = useUser().user?.id || "";

  useEffect(() => {
    const fetchClasses = async () => {
      if (teacherId) { // teacherId が取得できてからフェッチするように変更
        const classes: Class[] = await getClassByUserId(teacherId);
        setClassList(classes);
        // param_classId の初期設定をここで行う
        const initialAssignedClass = classes.filter((c: Class) => c.id.toString() === param_classId);
        setAssignedClass(initialAssignedClass);
      }
    };
    fetchClasses();
  }, [teacherId, param_classId]); // teacherId と param_classId を依存配列に追加

  const handleSectionChange = (item: SectionFrame, index: number) => {
    const newS: SectionFrame[] = sections.map((s: SectionFrame, i: number) => {
      if (i === index) {
        return item;
      } else {
        return { section: s.section, questions: s.questions };
      }
    });
    setSections(newS);
  };
  const handleRemove = (index: number) => {
    if (sections.length === value) {
      setValue(value - 1);
    }
    const newS: SectionFrame[] = sections.filter(
      (q: SectionFrame, i: number) => i !== index,
    );
    const newS2: SectionFrame[] = newS.map((q: SectionFrame, i: number) => {
      const section: Section = {
        id: 1,
        testId: 1,
        summary: q.section.summary,
        number: i + 1,
      };
      return { section: section, questions: q.questions };
    });
    setSections(newS2);
  };
  const handleAdd = () => {
    const section: Section = {
      id: 1,
      testId: 1,
      summary: "",
      number: sections.length + 1,
    };
    setSections([...sections].concat({ section: section, questions: [] }));
  };

  const createTestButtonFunction = async () => {
    alert("Complete Create Test");
    const newTest: Test = {
      id: 1,
      title: testTitle,
      summary: testSummary,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
    };
    const newTestFrame: TestFrame = {
      test: newTest,
      sections: sections,
      classes: assignedClass,
    };
    await createTest(newTestFrame);
  };

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  // エラーを追加する場合はCreateErrorとcheckDataErrorを変更する
  const CreateError = () => {
    const isAfterWarning = () => {
      if (startDate.isAfter(endDate)) {
        return <Alert severity="error">開始日が締め切りより後です</Alert>;
      }
    };

    const isClassError = () => {
      if (assignedClass.length === 0) {
        return <Alert severity="error">クラスが選択されていません</Alert>;
      }
    };

    const isnotInsertedContentError = () => {
      let missing_content: boolean = false;
      let missing_content_list: String = "";
      sections.map((section, count) => {
        section.questions.map((question) => {
          if (question.insertType != "None" && question.insertContent == "") {
            missing_content = true;
            missing_content_list += (count + 1).toString() + "-" + question.number.toString() + ",";
          }
        })
      })
      if (missing_content) {
        return <Alert severity="error">コンテンツが挿入されていません<br />At {missing_content_list}</Alert>;
      }
    }

    return (
      <Stack gap={"5px"}>
        {isAfterWarning()}
        {isClassError()}
        {isnotInsertedContentError()}
      </Stack>
    );
  };

  const checkDataError = () => {
    let isError: boolean = false;
    if (startDate.isAfter(endDate)) {
      isError = true;
    }
    if (assignedClass.length === 0) {
      isError = true;
    }

    sections.forEach((section) => { // forEach を使用して副作用を避ける
      section.questions.forEach((question) => {
        if (question.insertType !== "None" && question.insertContent === "") {
          isError = true;
        }
      });
    });

    return isError;
  };

  // クラスの割り当て用
  const handleClassChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const values = event.target.value as string[];
    const select = classList.filter((item) => values.includes(item.id));

    setAssignedClass(select);
  };

  return (
    <Stack gap={2} justifyContent={"center"} display={"flex"} marginX={"5vw"}>
      <Button
        variant={"contained"}
        onClick={createTestButtonFunction}
        disabled={checkDataError()}
      >
        Create Test
      </Button>
      <CreateError />

      <Box
        sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}
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
          sx={{ borderRight: 1, borderColor: "divider" }}
          aria-label="section tabs"
        >
          <Tab label={"metadata"} />
          {sections.map((s: SectionFrame, index: number) => (
            <Tab label={index + 1} {...a11yProps(index)} key={index} />
          ))}
          <Tab
            icon={<AddIcon />}
            onClick={handleAdd}
            {...a11yProps(sections.length)}
          />
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
            asignedClass={assignedClass}
            handleClassChange={handleClassChange}
            classList={classList}
          />
        </TabPanels>
        {sections.map((s: SectionFrame, index: number) => (
          <TabPanels value={value} index={index + 1} key={index + 1}>
            <SectionPage
              key={index}
              index={index}
              section={s}
              setSection={(s: SectionFrame) => {
                handleSectionChange(s, index);
              }}
              deleteSection={() => handleRemove(index)}
            />
          </TabPanels>
        ))}
      </Box>
    </Stack>
  );
}

// stateが更新されるたびにレンダリングされるのを避ける
// Page()の中に書かないで
const TabPanels = (props: any) => {
  const { children, value, index } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      width={"100%"}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Box>
  );
};

const MetaDataPage = ({
  // SectionPage内のstate
  testTitle,
  setTestTitle,
  testSummary,
  setTestSummary,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  asignedClass,
  handleClassChange,
  classList,
}: any) => {
  const dateWarning = () => {
    const isBeforeWarning = () => {
      if (startDate.isBefore(dayjs())) {
        return <Alert severity="warning">開始日が現在日より前です</Alert>;
      }
    };

    return <Stack spacing={"5px"}>{isBeforeWarning()}</Stack>;
  };

  const ClassAssign = () => {
    return (
      <FormControl>
        <InputLabel id={"ClassAssign"}>class</InputLabel>
        <Select
          labelId={"ClassAssign"}
          id={"ClassAssign"}
          multiple
          value={asignedClass.map((option: Class) => option.id)}
          input={<OutlinedInput label="Class" />}
          onChange={handleClassChange}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as String[]).map((value: String) => {
                const item = classList.find(
                  (option: Class) => option.id === value,
                );
                return item ? <Chip key={value + ""} label={item.name} /> : null;
              })}
            </Box>
          )}
        >
          {classList.map((c: Class) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Stack gap={2} width={"100%"} padding={2} border="1p">
      <Typography variant={"h5"}>Test Metadata</Typography>
      {/*タイトル・概要*/}
      <TextField
        label="タイトル"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
      />
      <TextField
        label="説明"
        value={testSummary}
        onChange={(e) => setTestSummary(e.target.value)}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Typography variant="h6">開始日</Typography>
        <DateTimePicker
          value={startDate}
          onChange={(val: Dayjs | null) => {
            if (val !== null) {
              setStartDate(val);
            }
          }}
        />
        <Typography variant="h6">締め切り日</Typography>
        <DateTimePicker
          value={endDate}
          onChange={(val: Dayjs | null) => {
            if (val !== null) {
              setEndDate(val);
            }
          }}
        />
      </LocalizationProvider>
      {dateWarning()}
      <Typography variant="h6">クラスの割り当て</Typography>
      <ClassAssign />
    </Stack>
  );
};

const SectionPage = ({ index, section, setSection, deleteSection }: any) => {
  const addQuestion = () => {
    const question: Question = {
      id: 1,
      sectionId: 1,
      question: "",
      number: section.questions.length + 1,
      insertType: "None",
      insertContent: "",
      answer: "",
    };

    const questions: Question[] = [...section.questions].concat(question);
    const newSection: SectionFrame = {
      section: section.section,
      questions: questions,
    };

    setSection(newSection);
  }

  const handleQuestionChange = (item: Question, index: number) => {
    const newQ = section.questions.map((q: Question, i: number) => {
      if (i === index) {
        return item;
      } else {
        // id と sectionId が固定値になっているのを修正
        const question: Question = {
          id: q.id, // 既存のidを使用
          sectionId: q.sectionId, // 既存のsectionIdを使用
          question: q.question,
          number: i + 1,
          insertType: q.insertType,
          insertContent: q.insertContent,
          answer: q.answer,
        };
        return question;
      }
    });
    setSection({ ...section, questions: newQ });
  };

  const handleRemove = (index: number) => {
    const newQ = section.questions.filter(
      (q: Question, i: number) => i !== index,
    );
    const newQ2 = newQ.map((q: Question, i: number) => {
      // id, sectionId, insertType, insertContent を保持するように修正
      return {
        ...q, // 既存のプロパティをスプレッド
        number: i + 1
      };
    });
    setSection({ ...section, questions: newQ2 });
  };

  const handleSectionSummaryChange = (newSummary: string) => {
    const newS: Section = {
      id: section.section.id, // 既存のidを使用
      testId: section.section.testId, // 既存のtestIdを使用
      summary: newSummary,
      number: section.section.number,
    };
    setSection({ section: newS, questions: section.questions });
  }


  return (
    <Stack
      justifyContent="center"
      display="flex"
      width={"100%"}
      height={"100%"}
      gap={2}
      alignItems={"left"}
    >
      <Box width={"100%"} alignItems={"right"}>
        <Button startIcon={<DeleteIcon />} onClick={deleteSection}>
          Delete
        </Button>
      </Box>
      <Stack direction={"row"} gap={1}>
        <Typography>{"Summary: "}</Typography>
        <Latex >{section.section.summary}</Latex>
      </Stack>
      <TextField
        label={"summary"}
        value={section.section.summary}
        onChange={(e) => handleSectionSummaryChange(e.target.value)}
      />
      {
        section.questions.map((q: Question, index: number) => (
          <QuestionPage
            key={index}
            index={index}
            question={q}
            setQuestion={(q: Question) => {
              handleQuestionChange(q, index);
            }}
            deleteQuestion={() => handleRemove(index)}
          />
        ))
      }
      <Button onClick={addQuestion}>Add Question</Button>
    </Stack>
  );
};

const QuestionPage = ({
  index,
  question,
  setQuestion,
  deleteQuestion,
}: any) => {
  // useStateを直接更新するのではなく、setQuestionを通じて更新する
  const setAns = (newAns: string) => {
    setQuestion({ ...question, answer: newAns });
  };

  const setQues = (newQues: string) => {
    setQuestion({ ...question, question: newQues });
  };

  const setInsertType = (insertType: string) => {
    setQuestion({ ...question, insertType: insertType });
  };

  const setInsertContent = (insertContent: string) => {
    setQuestion({ ...question, insertContent: insertContent });
  };


  const contetError = () => {
    const isnotInsertedError = () => {
      if (question.insertType != "None" && question.insertContent == "") {
        return <Alert severity="error">コンテンツが挿入されていません。</Alert>;
      }
    };

    return <Stack spacing={"5px"}>{isnotInsertedError()}</Stack>;
  };

  return (
    <Stack gap={1} width={"100%"} padding={2} border="1p">
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignContent="center">
          <Typography>{"(" + question.number + ") "}</Typography>
          <InlineMath>{question.question}</InlineMath>
        </Box>
        <IconButton aria-label="delete" onClick={deleteQuestion}>
          <CloseIcon />
        </IconButton>
      </Box>
      <TextField
        label={"question"}
        value={question.question}
        onChange={(e) => setQues(e.target.value)}
      />
      <Stack direction={"column"}>
        {/*コンテンツ挿入エリア*/}
        <Box display="flex" width={"100%"}>
          <Autocomplete disablePortal
            options={insert_options} defaultValue={question.insertType} disableClearable
            onChange={(event, option) => {
              setInsertType(option);
              setInsertContent(""); // タイプ変更時にコンテンツをクリア
            }}
            sx={{ width: "20%" }} renderInput={(params) => <TextField {...params} label="Insert" />} />
          <>
            {(function () {
              let acceptFileType: String = "";
              switch (question.insertType) {
                case "None":
                  return (<></>)
                case "Image":
                  acceptFileType = "image/*";
                  break;
                case "HTML":
                  acceptFileType = ".html";
                  break;
                default:
                  return (<></>)
              }
              return (
                <>
                  <Box width={"80%"} display="flex" alignItems="center">
                    <Button variant="contained" component="label" sx={{ whiteSpace: 'nowrap', width: "230px", height: "100%", marginLeft: 2 }}>
                      Upload {question.insertType} File
                      <input type="file" accept={acceptFileType.toString()} style={{ display: "none" }} onChange={async (event) => {
                        const files = event.currentTarget.files;
                        if (!files || files?.length === 0) return;
                        const file = files[0];
                        let content: String = "";
                        const reader = new FileReader();
                        switch (question.insertType) {
                          case "Image":
                            reader.readAsDataURL(file);
                            reader.onload = () => {
                              setInsertContent(reader.result != null ? reader.result.toString() : "");
                            };
                            break;
                          case "HTML":
                            reader.readAsText(file);
                            reader.onload = () => {
                              setInsertContent(reader.result != null ? reader.result.toString() : "");
                            }
                        }
                      }} />
                    </Button>
                    <Box width={"100%"} marginLeft={2}>
                      {contetError()}
                    </Box>
                  </Box>
                </>)
            }())}
          </>
        </Box>
        <Box height={"auto"}>
          <InsertFrame insertType={question.insertType} insertContent={question.insertContent} />
        </Box>
      </Stack>
      <Stack direction={"row"} gap={1}>
        <Typography>{"Answer: "}</Typography>
        <InlineMath>{question.answer}</InlineMath>
      </Stack>
      <TextField
        label={"answer"}
        value={question.answer}
        onChange={(e) => setAns(e.target.value)}
      />
    </Stack>
  );
};

export default function Page() {
  return (
    <TeacherGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientSearchParamWrapper />
      </Suspense>
    </TeacherGuard>
  );
}