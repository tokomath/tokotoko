"use client"

import React, { Suspense, useEffect, useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Container,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import "katex/dist/katex.min.css";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import {
  TestFrame,
  SectionFrame,
} from "@/app/api/test/testFrames";
import { createTest } from "@/app/api/test/createTest";

import { Test, Section, Question, Class } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Autocomplete from '@mui/material/Autocomplete';

import Latex from "react-latex-next";
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from '@clerk/nextjs'

import { getClassByUserId } from "@/app/api/class/getClass";

import InsertFrame from "@/compornents/InsertFrame";
import { TeacherGuard } from "@/lib/guard"

import YAML from 'yaml'
const msg_yaml = require("../../../msg-ja.yaml") as string
const msg = YAML.parse(msg_yaml)

const insert_options = ["None", "Image", "HTML"];

function ClientSearchParamWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const param_classId = searchParams.get("classId");

  const [sections, setSections] = useState<SectionFrame[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [testSummary, setTestSummary] = useState("");
  const [value, setValue] = React.useState(0);
  
  const [dataVersion, setDataVersion] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialStartDate = () => {
    const now = dayjs();
    if (now.minute() < 30) {
      return now.minute(30).second(0).millisecond(0);
    } else {
      return now.add(1, 'hour').minute(0).second(0).millisecond(0);
    }
  };

  const [startDate, setStartDate] = useState<Dayjs>(() => getInitialStartDate());
  const [endDate, setEndDate] = useState<Dayjs>(() => getInitialStartDate().add(7, 'day'));

  const [assignedClass, setAssignedClass] = useState<Class[]>([]);

  const [classList, setClassList] = useState<Class[]>([]);
  const teacherId = useUser().user?.id || "";

  useEffect(() => {
    const fetchClasses = async () => {
      if (teacherId) {
        const classes: Class[] = await getClassByUserId(teacherId);
        setClassList(classes);
        const initialAssignedClass = classes.filter((c: Class) => c.id.toString() === param_classId);
        setAssignedClass(initialAssignedClass);
      }
    };
    fetchClasses();
  }, [teacherId, param_classId]);

  const handleSaveJson = () => {
    const dataToSave = {
      testTitle,
      testSummary,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      assignedClassIds: assignedClass.map((c) => c.id),
      sections,
    };

    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${testTitle || "test_data"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target != null ? e.target.result as string : "");

        if (json.testTitle !== undefined) setTestTitle(json.testTitle);
        if (json.testSummary !== undefined) setTestSummary(json.testSummary);
        if (json.startDate) setStartDate(dayjs(json.startDate));
        if (json.endDate) setEndDate(dayjs(json.endDate));
        if (json.sections) setSections(json.sections);

        if (json.assignedClassIds && Array.isArray(json.assignedClassIds)) {
          const restoredClasses = classList.filter((c) =>
            json.assignedClassIds.includes(c.id)
          );
          setAssignedClass(restoredClasses);
        }

        setDataVersion(prev => prev + 1);
        setValue(0); 
      } catch (error) {
        console.error("JSON Parse Error:", error);
        alert("ファイルの読み込みに失敗しました。形式を確認してください。");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

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
    alert(msg.SUCCESS_CREATE_TEST);
    router.push('/mypage/teacher');
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

  const CreateError = () => {
    const isAfterWarning = () => {
      if (startDate.isAfter(endDate)) {
        return <Alert severity="error">{msg.ERROR_START_AFTER_END}</Alert>;
      }
    };

    const isClassError = () => {
      if (assignedClass.length === 0) {
        return <Alert severity="error">{msg.ERROR_NO_CLASS}</Alert>;
      }
    };

    const isnotInsertedContentError = () => {
      let missing_content: boolean = false;
      let missing_content_list: String = "";
      sections.map((section, count) => {
        section.questions.map((question) => {
          if (question.insertType != "None" && question.insertContent == "") {
            missing_content = true;
            missing_content_list += msg.SECTION_NUMBER+(count + 1).toString() + "-"+msg.QUESTION_NUMBER_PREFIX+question.number.toString() + ",";
          }
        })
      })
      if (missing_content) {
        return <Alert severity="error">{msg.ERROR_CONTENT_MISSING}<br /> {missing_content_list}</Alert>;
      }
    }

    return (
      <Stack gap={1} mb={2} sx={{ flexShrink: 0 }}>
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

    sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.insertType !== "None" && question.insertContent === "") {
          isError = true;
        }
      });
    });

    return isError;
  };

  const handleClassChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const values = event.target.value as string[];
    const select = classList.filter((item) => values.includes(item.id));

    setAssignedClass(select);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        pt: 2,
        pb: 2,
        overflow: "hidden"
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexShrink: 0 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          {msg.CREATE_NEW_TEST}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Open JSON
          </Button>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleLoadJson}
          />

          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleSaveJson}
          >
            Save JSON
          </Button>

          <Button
            variant={"contained"}
            size="large"
            startIcon={<SaveIcon />}
            onClick={createTestButtonFunction}
            disabled={checkDataError()}
            sx={{ px: 4 }}
          >
            {msg.PUBLISH_TEST}
          </Button>
        </Stack>
      </Stack>

      <CreateError />

      <Paper elevation={3} sx={{ flexGrow: 1, minHeight: 0, display: 'flex', overflow: 'hidden', borderRadius: 2 }}>
        <Box
          sx={{
            borderRight: 1,
            borderColor: "divider",
            bgcolor: 'grey.50',
            width: '200px',
            flexShrink: 0,
            overflowY: 'auto'
          }}
        >
          <Tabs
            key={`tabs-${dataVersion}`} 
            value={value}
            onChange={handleChange}
            orientation="vertical"
            variant="scrollable"
            sx={{
              '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', pl: 3 },
            }}
          >
            <Tab label={msg.METADATA} />
            {sections.map((s: SectionFrame, index: number) => (
              <Tab label={`${msg.SECTION_NUMBER} ${index + 1}`} {...a11yProps(index)} key={index} />
            ))}
            <Tab
              icon={<AddIcon />}
              iconPosition="start"
              label={msg.ADD_SECTION}
              onClick={handleAdd}
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
              {...a11yProps(sections.length)}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0, height: '100%' }}>
          <TabPanels value={value} index={0}>
            <MetaDataPage
              key={`metadata-${dataVersion}`}
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
                key={`section-${index}-${dataVersion}`}
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
      </Paper>
    </Container>
  );
}

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
      {value === index && <Box p={4}>{children}</Box>}
    </Box>
  );
};

const MetaDataPage = ({
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
        return <Alert severity="warning">{msg.WARNING_START_DATE_PAST}</Alert>;
      }
    };
    return <Box>{isBeforeWarning()}</Box>;
  };

  const ClassAssign = () => {
    return (
      <FormControl fullWidth>
        <InputLabel id={"ClassAssign"}>{msg.TARGET_CLASS}</InputLabel>
        <Select
          labelId={"ClassAssign"}
          id={"ClassAssign"}
          multiple
          value={asignedClass.map((option: Class) => option.id)}
          input={<OutlinedInput label={msg.TARGET_CLASS} />}
          onChange={handleClassChange}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as String[]).map((value: String) => {
                const item = classList.find(
                  (option: Class) => option.id === value,
                );
                return item ? <Chip key={value + ""} label={item.name} color="primary" variant="outlined" /> : null;
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
    <Stack spacing={4} maxWidth="md" mx="auto">
      <Box>
        <Typography variant="h5" gutterBottom color="text.secondary">{msg.BASIC_INFO}</Typography>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <TextField
                label={msg.TEST_TITLE}
                variant="outlined"
                fullWidth
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
              <TextField
                label={msg.TEST_SUMMARY}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={testSummary}
                onChange={(e) => setTestSummary(e.target.value)}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom color="text.secondary">{msg.SCHEDULE}</Typography>
        <Card variant="outlined">
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label={msg.START_DATE}
                    sx={{ width: '100%' }}
                    value={startDate}
                    format="YYYY/MM/DD HH:mm"
                    onChange={(val: Dayjs | null) => {
                      if (val !== null) setStartDate(val);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label={msg.END_DATE}
                    sx={{ width: '100%' }}
                    value={endDate}
                    format="YYYY/MM/DD HH:mm"
                    onChange={(val: Dayjs | null) => {
                      if (val !== null) setEndDate(val);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  {dateWarning()}
                </Grid>
              </Grid>
            </LocalizationProvider>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom color="text.secondary">{msg.ASSIGNMENT}</Typography>
        <Card variant="outlined">
          <CardContent>
            <ClassAssign />
          </CardContent>
        </Card>
      </Box>
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
        const question: Question = {
          id: q.id,
          sectionId: q.sectionId,
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
      return {
        ...q,
        number: i + 1
      };
    });
    setSection({ ...section, questions: newQ2 });
  };

  const handleSectionSummaryChange = (newSummary: string) => {
    const newS: Section = {
      id: section.section.id,
      testId: section.section.testId,
      summary: newSummary,
      number: section.section.number,
    };
    setSection({ section: newS, questions: section.questions });
  }


  return (
    <Stack spacing={4}>
      <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
        <CardHeader
          title={`${msg.SECTION_NUMBER} ${index + 1} ${msg.SECTION_SETTINGS}`}
          action={
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={deleteSection}
              size="small"
            >
              {msg.DELETE_SECTION}
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                label={msg.SECTION_SUMMARY_LABEL}
                fullWidth
                multiline
                minRows={4}
                value={section.section.summary}
                onChange={(e) => handleSectionSummaryChange(e.target.value)}
                sx={{
                  flexGrow: 1,
                  "& .MuiInputBase-root": {
                    height: "100%",
                    alignItems: "flex-start"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  flexGrow: 1,
                  bgcolor: 'common.white',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {msg.PREVIEW}
                </Typography>
                <Box>
                  <Latex>{section.section.summary}</Latex>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="text.secondary">
            {msg.QUESTIONS_LIST} ({section.questions.length})
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addQuestion}>
            {msg.ADD_QUESTION}
          </Button>
        </Stack>

        <Stack spacing={3}>
          {section.questions.map((q: Question, index: number) => (
            <QuestionPage
              key={index}
              index={index}
              question={q}
              setQuestion={(q: Question) => {
                handleQuestionChange(q, index);
              }}
              deleteQuestion={() => handleRemove(index)}
            />
          ))}
          {section.questions.length === 0 && (
            <Alert severity="info">{msg.NO_QUESTIONS_ALERT}</Alert>
          )}
        </Stack>
      </Box>

      {section.questions.length > 0 && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addQuestion}
          fullWidth
          sx={{ borderStyle: 'dashed' }}
        >
          {msg.ADD_ANOTHER_QUESTION}
        </Button>
      )}
    </Stack>
  );
};

const QuestionPage = ({
  index,
  question,
  setQuestion,
  deleteQuestion,
}: any) => {
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
        return <Alert severity="error">{msg.ERROR_CONTENT_MISSING}</Alert>;
      }
    };
    return <Box>{isnotInsertedError()}</Box>;
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="subtitle1" fontWeight="bold">{msg.QUESTION_NUMBER_PREFIX || "Question"} {question.number}</Typography>}
        action={
          <IconButton aria-label="delete" onClick={deleteQuestion} color="error" size="small">
            <CloseIcon />
          </IconButton>
        }
        sx={{ bgcolor: 'grey.100', py: 1 }}
      />
      <CardContent>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              label={msg.QUESTION_TEXT_LABEL}
              fullWidth
              multiline
              minRows={3}
              value={question.question}
              onChange={(e) => setQues(e.target.value)}
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-root": {
                  height: "100%",
                  alignItems: "flex-start"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                flexGrow: 1,
                bgcolor: 'grey.50',
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {msg.QUESTION_PREVIEW}
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <Typography component="span" fontWeight="bold" mr={1}>({question.number})</Typography>
                <Latex>{question.question}</Latex>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">{msg.MEDIA_ATTACHMENT}</Typography></Divider>
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <Autocomplete
                disablePortal
                options={insert_options}
                value={question.insertType}
                disableClearable
                onChange={(event, option) => {
                  setQuestion({
                    ...question,
                    insertType: option,
                    insertContent: ""
                  });
                }}
                sx={{ width: { xs: '100%', sm: 200 } }}
                renderInput={(params) => <TextField {...params} label={msg.ATTACHMENT_TYPE} />}
              />

              <Box flexGrow={1} width="100%">
                {(function () {
                  let acceptFileType: String = "";
                  let icon = <CloudUploadIcon />;

                  switch (question.insertType) {
                    case "None":
                      return (<Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, color: 'text.disabled', textAlign: 'center' }}>{msg.NO_ATTACHMENT}</Box>)
                    case "Image":
                      acceptFileType = "image/*";
                      icon = <ImageIcon />;
                      break;
                    case "HTML":
                      acceptFileType = ".html";
                      icon = <CodeIcon />;
                      break;
                    default:
                      return (<></>)
                  }

                  return (
                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={icon}
                        sx={{ height: 56, px: 3, whiteSpace: 'nowrap' }}
                      >
                        {msg.UPLOAD_FILE} {question.insertType}
                        <input
                          type="file"
                          accept={acceptFileType.toString()}
                          style={{ display: "none" }}
                          onChange={async (event) => {
                            const files = event.currentTarget.files;
                            if (!files || files?.length === 0) return;
                            const file = files[0];
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
                          }}
                        />
                      </Button>
                      <Box flexGrow={1}>
                        {contetError()}
                        {question.insertContent && (
                          <Chip label={msg.FILE_UPLOADED} color="success" size="small" onDelete={() => setInsertContent("")} />
                        )}
                      </Box>
                    </Stack>
                  )
                }())}
              </Box>
            </Stack>

            {question.insertContent && (
              <Box mt={2} p={1} border="1px solid #eee" borderRadius={1}>
                <Typography variant="caption" display="block" mb={1}>{msg.ATTACHMENT_PREVIEW}:</Typography>
                <InsertFrame insertType={question.insertType} insertContent={question.insertContent} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">{msg.ANSWER_KEY}</Typography></Divider>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              label={msg.ANSWER_FORMULA_LABEL}
              fullWidth
              value={question.answer}
              onChange={(e) => setAns(e.target.value)}
              placeholder={msg.ANSWER_PLACEHOLDER}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'grey.50',
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }}
            >
              <Typography variant="body2" color="text.secondary" mr={1}>{msg.PREVIEW}:</Typography>
              <Latex>{question.answer}</Latex>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function Page() {
  return (
    <TeacherGuard>
      <Suspense fallback={<div>{msg.LOADING || "Loading..."}</div>}>
        <ClientSearchParamWrapper />
      </Suspense>
    </TeacherGuard>
  );
}