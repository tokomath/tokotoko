"use client"

import React, { Suspense, useEffect, useState, useRef } from "react";
import {
  Autocomplete,
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
  Menu,
  MenuItem,
  Chip,
  Container,
  Paper,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import {
  TestFrame,
  SectionFrame,
} from "@/app/api/test/testFrames";
import { createTest } from "@/app/api/test/createTest";
import { getTestById } from "@/app/api/test/getTestById";
import { updateTest, updateTestPublishStatus, updateTestMetadata } from "@/app/api/test/updateTest";

import { Test, Section, Question, Class } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from '@clerk/nextjs'

import { getClassByUserId } from "@/app/api/class/getClass";

import InsertFrame from "@/compornents/InsertFrame";
import LaTeXViewer from "@/compornents/LaTeXViewer";
import { TeacherGuard } from "@/lib/guard"

import { msg } from "@/msg-ja";

const insert_options = ["None", "Image", "HTML"];

function ClientSearchParamWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const param_classId = searchParams.get("classId");
  const param_testId = searchParams.get("testId");

  const [sections, setSections] = useState<SectionFrame[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [testSummary, setTestSummary] = useState("");
  const [maxResubmissions, setMaxResubmissions] = useState<number>(0);
  const [value, setValue] = React.useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isCurrentPublished, setIsCurrentPublished] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(param_testId ? Number(param_testId) : null);

  const initialSectionsRef = useRef<string>("");
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

  const [sectionContextMenu, setSectionContextMenu] = useState<{ mouseX: number; mouseY: number; index: number } | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  const exportToJson = () => {
    const exportData = {
      title: testTitle,
      summary: testSummary,
      maxResubmissions: maxResubmissions,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sections: sections,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${testTitle || "test_data"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setTestTitle(data.title || "");
        setTestSummary(data.summary || "");
        setMaxResubmissions(data.maxResubmissions || 0);
        if (data.startDate) setStartDate(dayjs(data.startDate));
        if (data.endDate) setEndDate(dayjs(data.endDate));
        if (data.sections) setSections(data.sections);
      } catch (err) {
        alert(msg.ERROR_FILE_LOAD);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleSectionContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    setSectionContextMenu({ mouseX: event.clientX, mouseY: event.clientY, index });
  };
  const handleSectionContextMenuClose = () => setSectionContextMenu(null);

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex < 0 || hoverIndex < 0 || dragIndex >= sections.length || hoverIndex >= sections.length) return;
    const newSections = [...sections];
    const [draggedItem] = newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedItem);

    const updatedSections = newSections.map((sec, i) => ({ ...sec, section: { ...sec.section, number: i + 1 } }));
    setSections(updatedSections);

    if (value === dragIndex + 1) {
      setValue(hoverIndex + 1);
    } else if (dragIndex < value - 1 && hoverIndex >= value - 1) {
      setValue(value - 1);
    } else if (dragIndex > value - 1 && hoverIndex <= value - 1) {
      setValue(value + 1);
    }
  };

  const duplicateSection = (index: number) => {
    const target = sections[index];
    const dummySectionId = -Math.floor(Math.random() * 1000000);

    const newSection: SectionFrame = JSON.parse(JSON.stringify(target));

    newSection.section.id = dummySectionId;

    newSection.questions = newSection.questions.map((q: Question) => ({
      ...q,
      id: -Math.floor(Math.random() * 1000000),
      sectionId: dummySectionId
    }));

    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);

    const updatedSections = newSections.map((sec, i) => ({
      ...sec,
      section: { ...sec.section, number: i + 1 }
    }));

    setSections(updatedSections);

    setValue(index + 2);
  };

  useEffect(() => {
    const fetchClassesAndTest = async () => {
      if (teacherId) {
        const classes: Class[] = await getClassByUserId(teacherId);
        setClassList(classes);

        if (param_testId) {
          setIsEditing(true);
          const existingTest = await getTestById(Number(param_testId), teacherId);
          if (existingTest) {
            setTestTitle(existingTest.title);
            setTestSummary(existingTest.summary || "");
            setMaxResubmissions(existingTest.maxResubmissions ?? 0);
            setStartDate(dayjs(existingTest.startDate));
            setEndDate(dayjs(existingTest.endDate));
            setIsCurrentPublished(existingTest.isPublished);

            const mappedSections: SectionFrame[] = existingTest.sections.map((s: any) => ({
              section: {
                id: s.id,
                testId: s.testId,
                summary: s.summary,
                number: s.number,
              },
              questions: s.questions
            }));
            setSections(mappedSections);
            setAssignedClass(existingTest.classes);

            const sectionsJson = JSON.stringify(mappedSections);
            initialSectionsRef.current = sectionsJson;
          } else {
            alert(msg.ERROR_TEST_NOT_FOUND);
            router.push('/mypage/teacher');
          }
        } else if (param_classId) {
          const initialAssignedClass = classes.filter((c: Class) => c.id.toString() === param_classId);
          setAssignedClass(initialAssignedClass);
        }
      }
    };
    fetchClassesAndTest();
  }, [teacherId, param_classId, param_testId, router]);

  const performSave = async (publishState?: boolean) => {
    const publishStateToSave = publishState !== undefined ? publishState : isCurrentPublished;

    const testData: Test = {
      id: currentTestId ? currentTestId : 1,
      title: testTitle,
      summary: testSummary,
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      isPublished: publishStateToSave,
      maxResubmissions: maxResubmissions,
    };

    const testFrame: TestFrame = {
      test: testData,
      sections: sections,
      classes: assignedClass,
    };

    if (isEditing) {
      const currentSectionsJson = JSON.stringify(sections);
      const isStructureChanged = currentSectionsJson !== initialSectionsRef.current;

      if (isStructureChanged) {
        await updateTest(testFrame);
        initialSectionsRef.current = currentSectionsJson;
      } else {
        await updateTestMetadata(testFrame);
      }
      alert(msg.SUCCESS_SAVE_TEST);
    } else {
      const newId = await createTest(testFrame);
      if (newId) {
        setCurrentTestId(newId);
        setIsEditing(true);
        router.replace(window.location.pathname + "?testId=" + newId);
      }
      alert(msg.SUCCESS_CREATE_TEST);
    }
  };

  const handleSaveClick = async () => {
    await performSave();
  };

  const handleTogglePublish = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    setIsCurrentPublished(newChecked);
    if (isEditing && currentTestId) {
      await updateTestPublishStatus(currentTestId, newChecked);
    } else {
      await performSave(newChecked);
    }
  };

  const handleAdd = () => {
    const dummyId = -Math.floor(Math.random() * 1000000);
    const section: Section = {
      id: dummyId,
      testId: currentTestId || 1,
      summary: "",
      number: sections.length + 1,
    };
    setSections([...sections].concat({ section: section, questions: [] }));
  };

  const checkDataError = () => {
    if (startDate.isAfter(endDate)) return true;
    if (assignedClass.length === 0) return true;
    if (maxResubmissions < 0) return true;
    return sections.some(section =>
      section.questions.some(q => q.insertType !== "None" && q.insertContent === "")
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        pt: 2,
        pb: 0,
        overflow: "hidden"
      }}
    >

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            {isEditing ? msg.EDIT_TEST : msg.CREATE_NEW_TEST}
          </Typography>
          <Chip
            label={isCurrentPublished ? msg.PUBLISHED : msg.UNPUBLISHED}
            color={isCurrentPublished ? "success" : "default"}
          />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={importFromJson}
          />
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {msg.OPEN_JSON}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToJson}
          >
            {msg.SAVE_JSON}
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveClick}
            disabled={checkDataError()}
            sx={{ px: 4 }}
          >
            {msg.SAVE}
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={isCurrentPublished}
                onChange={handleTogglePublish}
                color="success"
                disabled={checkDataError()}
              />
            }
            label={isCurrentPublished ? msg.PUBLISHED : msg.UNPUBLISHED}
          />
        </Stack>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 0, p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Paper elevation={3} sx={{ flexGrow: 1, minHeight: 0, display: 'flex', overflow: 'hidden', borderRadius: 2 }}>
          <Box sx={{ width: '200px', flexShrink: 0, borderRight: 1, borderColor: "divider", overflowY: 'auto', height: '100%' }}>
            <Tabs
              value={value}
              onChange={(_, v) => setValue(v)}
              orientation="vertical"
              variant="scrollable"
            >
              <Tab label={msg.METADATA} />
              {sections.map((_, index) => (
                <Tab
                  label={`${msg.SECTION_NUMBER} ${index + 1}`}
                  key={index}
                  draggable
                  onDragStart={() => setDraggedSectionIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedSectionIndex !== null && draggedSectionIndex !== index) {
                      moveSection(draggedSectionIndex, index);
                    }
                    setDraggedSectionIndex(null);
                  }}
                  onContextMenu={(e) => handleSectionContextMenu(e, index)}
                  sx={{ cursor: 'grab' }}
                />
              ))}
              <Tab icon={<AddIcon />} iconPosition="start" label={msg.ADD_SECTION} onClick={handleAdd} sx={{ color: 'primary.main', fontWeight: 'bold' }} />
            </Tabs>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', height: '100%' }}>
            {value === 0 && (
              <Box sx={{ p: 4 }}>
                <MetaDataPage
                  testTitle={testTitle} setTestTitle={setTestTitle}
                  testSummary={testSummary} setTestSummary={setTestSummary}
                  maxResubmissions={maxResubmissions} setMaxResubmissions={setMaxResubmissions}
                  startDate={startDate} setStartDate={setStartDate}
                  endDate={endDate} setEndDate={setEndDate}
                  asignedClass={assignedClass}
                  handleClassChange={(e: any) => setAssignedClass(classList.filter(c => e.target.value.includes(c.id)))}
                  classList={classList}
                />
              </Box>
            )}
            {sections.map((s, index) => (
              <Box key={index} hidden={value !== index + 1}>
                <SectionPage
                  index={index}
                  section={s}
                  setSection={(newS: SectionFrame) => setSections(sections.map((sec, i) => i === index ? newS : sec))}
                  deleteSection={() => {
                    const newS = sections.filter((_, i) => i !== index).map((sec, i) => ({ ...sec, section: { ...sec.section, number: i + 1 } }));
                    setSections(newS);
                    if (value > newS.length) setValue(newS.length);
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
      <Menu
        open={sectionContextMenu !== null}
        onClose={handleSectionContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          sectionContextMenu !== null
            ? { top: sectionContextMenu.mouseY, left: sectionContextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (sectionContextMenu) moveSection(sectionContextMenu.index, sectionContextMenu.index - 1);
          handleSectionContextMenuClose();
        }} disabled={sectionContextMenu?.index === 0}>{msg.MOVE_UP}</MenuItem>
        <MenuItem onClick={() => {
          if (sectionContextMenu) moveSection(sectionContextMenu.index, sectionContextMenu.index + 1);
          handleSectionContextMenuClose();
        }} disabled={sectionContextMenu?.index === sections.length - 1}>{msg.MOVE_DOWN}</MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (sectionContextMenu) duplicateSection(sectionContextMenu.index);
          handleSectionContextMenuClose();
        }}>{msg.DUPLICATE}</MenuItem>
      </Menu>
    </Container>
  );
}

const MetaDataPage = ({
  testTitle,
  setTestTitle,
  testSummary,
  setTestSummary,
  maxResubmissions,
  setMaxResubmissions,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  asignedClass,
  handleClassChange,
  classList,
}: any) => {
  const dateWarning = () => {
    if (startDate.isBefore(dayjs())) {
      return <Alert severity="warning">{msg.WARNING_START_DATE_PAST}</Alert>;
    }
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
              <TextField
                label={msg.MAX_RESUBMISSIONS || "再提出回数の上限"}
                variant="outlined"
                type="number"
                fullWidth
                value={maxResubmissions}
                onChange={(e) => setMaxResubmissions(parseInt(e.target.value, 10) || 0)}
                inputProps={{ min: 0 }}
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12 }}>
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
    const dummyId = -Math.floor(Math.random() * 1000000);
    const question: Question = {
      id: dummyId,
      sectionId: section.section.id,
      question: "",
      allocationPoint: 1,
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
        return { ...q, number: i + 1 };
      }
    });
    setSection({ ...section, questions: newQ });
  };

  const handleRemove = (index: number) => {
    const newQ = section.questions.filter(
      (q: Question, i: number) => i !== index,
    ).map((q: Question, i: number) => ({ ...q, number: i + 1 }));
    setSection({ ...section, questions: newQ });
  };

  const handleSectionSummaryChange = (newSummary: string) => {
    const newS: Section = {
      ...section.section,
      summary: newSummary,
    };
    setSection({ section: newS, questions: section.questions });
  }

  const [questionContextMenu, setQuestionContextMenu] = useState<{ mouseX: number; mouseY: number; index: number } | null>(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);

  const handleQuestionContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    setQuestionContextMenu({ mouseX: event.clientX, mouseY: event.clientY, index });
  };
  const handleQuestionContextMenuClose = () => setQuestionContextMenu(null);

  const moveQuestion = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex < 0 || hoverIndex < 0 || dragIndex >= section.questions.length || hoverIndex >= section.questions.length) return;
    const newQuestions = [...section.questions];
    const [draggedItem] = newQuestions.splice(dragIndex, 1);
    newQuestions.splice(hoverIndex, 0, draggedItem);
    const updatedQuestions = newQuestions.map((q, i) => ({ ...q, number: i + 1 }));
    setSection({ ...section, questions: updatedQuestions });
  };

  const duplicateQuestion = (index: number) => {
    const target = section.questions[index];
    const dummyId = -Math.floor(Math.random() * 1000000);
    const newQuestion = JSON.parse(JSON.stringify({ ...target, id: dummyId }));
    const newQuestions = [...section.questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    const updatedQuestions = newQuestions.map((q, i) => ({ ...q, number: i + 1 }));
    setSection({ ...section, questions: updatedQuestions });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card variant="outlined" sx={{  mb: 4 }}>
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
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                label={msg.SECTION_SUMMARY_LABEL}
                fullWidth
                multiline
                minRows={4}
                value={section.section.summary}
                onChange={(e) => handleSectionSummaryChange(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {msg.PREVIEW}
                </Typography>
                <Box>
                  <LaTeXViewer>{section.section.summary}</LaTeXViewer>
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
            <Box
              key={q.id}
              draggable
              onDragStart={() => setDraggedQuestionIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedQuestionIndex !== null && draggedQuestionIndex !== index) {
                  moveQuestion(draggedQuestionIndex, index);
                }
                setDraggedQuestionIndex(null);
              }}
              onContextMenu={(e) => handleQuestionContextMenu(e, index)}
              sx={{ cursor: 'grab' }}
            >
              <QuestionPage
                index={index}
                question={q}
                setQuestion={(q: Question) => handleQuestionChange(q, index)}
                deleteQuestion={() => handleRemove(index)}
              />
            </Box>
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
          sx={{ borderStyle: 'dashed', mt: 4 }}
        >
          {msg.ADD_ANOTHER_QUESTION}
        </Button>
      )}
      <Menu
        open={questionContextMenu !== null}
        onClose={handleQuestionContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          questionContextMenu !== null
            ? { top: questionContextMenu.mouseY, left: questionContextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          if (questionContextMenu) moveQuestion(questionContextMenu.index, questionContextMenu.index - 1);
          handleQuestionContextMenuClose();
        }} disabled={questionContextMenu?.index === 0}>上へ</MenuItem>
        <MenuItem onClick={() => {
          if (questionContextMenu) moveQuestion(questionContextMenu.index, questionContextMenu.index + 1);
          handleQuestionContextMenuClose();
        }} disabled={questionContextMenu?.index === section.questions.length - 1}>下へ</MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (questionContextMenu) duplicateQuestion(questionContextMenu.index);
          handleQuestionContextMenuClose();
        }}>
          {msg.DUPLICATE}
        </MenuItem>
      </Menu>
    </Box>
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

  const setInsertContent = (insertContent: string) => {
    setQuestion({ ...question, insertContent: insertContent });
  };

  const setAllocationPoint = (newPoint: number) => {
    setQuestion({ ...question, allocationPoint: newPoint });
  };

  const contetError = () => {
    if (question.insertType !== "None" && question.insertContent === "") {
      return <Alert severity="error">{msg.ERROR_CONTENT_MISSING}</Alert>;
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        title={<Typography variant="subtitle1" fontWeight="bold">{msg.QUESTION_NUMBER_PREFIX || "Question"} {question.number}</Typography>}
        action={
          <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1 }}>
            <TextField
              label={msg.ALLOCATION_POINT}
              type="number"
              size="small"
              value={question.allocationPoint ?? 1}
              onChange={(e) => setAllocationPoint(parseInt(e.target.value, 10) || 0)}
              inputProps={{ min: 0 }}
              sx={{ width: '80px' }}
            />
            <IconButton aria-label="delete" onClick={deleteQuestion} color="error" size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        }
        sx={{  py: 1 }}
      />
      <CardContent>
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
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
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                flexGrow: 1,
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
                <LaTeXViewer>{question.question}</LaTeXViewer>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">{msg.MEDIA_ATTACHMENT}</Typography></Divider>
          </Grid>

          <Grid size={{ xs: 12 }}>
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

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">{msg.ANSWER_KEY}</Typography></Divider>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              label={msg.ANSWER_FORMULA_LABEL}
              fullWidth
              multiline
              minRows={3}
              value={question.answer}
              onChange={(e) => setAns(e.target.value)}
              placeholder={msg.ANSWER_PLACEHOLDER}
              sx={{
                flexGrow: 1,
                "& .MuiInputBase-root": {
                  height: "100%",
                  alignItems: "flex-start"
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'rgba(0, 0, 0, 0.23)'
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {msg.PREVIEW}
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <LaTeXViewer>{question.answer}</LaTeXViewer>
              </Box>
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