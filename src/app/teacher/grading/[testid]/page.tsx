"use client"

import React, { useEffect, useState, useMemo, useCallback, use } from "react";
import { Box, Container, Paper, Button, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, MenuItem, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";

import { User, Class, Question, Section, Answer, Submission as PrismaSubmission } from "@prisma/client";
import { getTestById } from "@/app/api/test/getTestById";
import { getSubmissionsByTestAndClass } from "@/app/api/test/result";
import { setAnswerPoints } from "@/app/api/test/setAnswerPoints";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import { TeacherGuard } from "@/lib/guard";
import judge, { format } from "@/lib/judge";
import { msg } from "@/msg-ja";


import styles from "./styles.module.css";

interface Point {
  answerId: number;
  point: number;
}

interface SubmissionWithRelations extends PrismaSubmission {
  user: User;
  test: {
    id: number;
    title: string;
    summary: string;
    startDate: Date;
    endDate: Date;
    sections: (Section & { questions: Question[] })[];
  };
  answers: Answer[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index0: number) {
  return {
    id: `simple-tab-${index0}`,
    'aria-controls': `simple-tabpanel-${index0}`,
  };
}

interface SectionTabProps {
  sections: Section[]
  sectionValue: number;
  sectionHandleChange: (event: React.SyntheticEvent, newValue: number) => void;
}

function SectionTabs({ sections, sectionValue, sectionHandleChange }: SectionTabProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={sectionValue} onChange={sectionHandleChange} aria-label="section tabs" variant="fullWidth">
        {
          sections.map((section, index) => (
            <Tab label={msg.SECTION_NUMBER + section.number} key={index} {...a11yProps(index)} />
          ))
        }
      </Tabs>
      {
        sections.map((section, index) => (
          <CustomTabPanel value={sectionValue} index={index} key={index}>
            <Typography sx={{ m: 1 }}>
              <Latex >{section.summary}</Latex>
            </Typography>
          </CustomTabPanel>
        ))
      }
    </Box>
  );
}

const AnswerCell = React.memo(function AnswerCell({ answer, point, allocationPoint, userIndex, questionIndex, answerCellHandle, cursorImage, onRightClick }: { answer: string; point: number; allocationPoint: number; userIndex: number; questionIndex: number; answerCellHandle: (newPoint: number, userIndex: number, questionIndex: number) => void; cursorImage: string; onRightClick: (tex: string, event: React.MouseEvent) => void; }) {
  if (!answer) {
    return null
  }

  const click_handle = () => {
    const new_point = (point <= 0 ? allocationPoint : 0);
    answerCellHandle(new_point, userIndex, questionIndex);
  }

  const keydown_handle = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        click_handle();
    }
  }

  const contextMenuHandle = (event: React.MouseEvent) => {
    onRightClick(answer, event);
  }

  return (<>
    <TableCell onClick={click_handle} onKeyDown={keydown_handle} onContextMenu={contextMenuHandle} tabIndex={0} className={styles.answer_cell} style={{ cursor: cursorImage ? `url(${cursorImage}), auto` : 'pointer' }}>
      <div className={((point === -1) ? styles.ungraded_cell : (point > 0) ? styles.correct_cell : styles.wrong_cell)} ></div>
      <div className={styles.matharea}><Latex>{String(answer)}</Latex></div>
    </TableCell>
  </>)
});

const UngradedCountCell = React.memo(function UngradedCountCell({ ungraded_count }: { ungraded_count: number }) {
  return (
    <TableCell sx={{ textAlign: "center" }} className={styles.point_cell + " " + ((ungraded_count === 0) ? styles.ungraded_false : styles.ungraded_true)}>
      {ungraded_count}
    </TableCell>
  );
});

function generateCursor(): string {
  if (typeof document === 'undefined') {
    return "";
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = 64;
  canvas.width = 64;
  if (ctx != null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const path = new Path2D("M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z");
    ctx.strokeStyle = "#1976d2";
    ctx.lineWidth = 2;
    ctx.stroke(path);
    const ImageUrl = canvas.toDataURL("image/png");
    canvas.remove();
    return ImageUrl;
  }
  return "";
}

export default function GradingPage({ params }: { params: Promise<{ testid: number }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { testid } = use(params);

  const [Test_, setTest] = useState<any | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmissionWithRelations[] | null>(null);
  const [classId, setClassId] = useState<String | null>(null);
  const [classIndex, setClassIndex] = useState<number>(0);
  const [sectionValue, setSectionValue] = useState(0);
  const [points, setPoints] = useState<Record<number, Record<number, number>>>({});
  const [submission_index, setSubmissionIndex] = useState<Record<number, number>>({});
  const [cursorImage, setCursorImage] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const [texDialogOpen, setTexDialogOpen] = useState(false);
  const [currentTexContent, setCurrentTexContent] = useState("");
  const [autoGradingDialogOpen, setAutoGradingDialogOpen] = useState(false);

  const autoGradingHandle = useCallback(() => {
    if (!Test_ || !submissionData) return;

    setPoints(prevPoints => {
      const newPoints = { ...prevPoints };
      const allQuestions = Test_.sections.flatMap((s: any) => s.questions);

      submissionData.forEach((submission, dataIndex) => {
        const studentPoints = { ...newPoints[dataIndex] };

        submission.answers.forEach((answer: Answer, qIndex: number) => {
          const question = allQuestions[qIndex];
          if (!question) return;

          if (answer.text.trim() === "") {
            studentPoints[qIndex] = 0;
          } else {
            const result = judge(question.answer, answer.text);
            if (result === 1 || result === 2) {
              studentPoints[qIndex] = question.allocationPoint ?? 1;
            } else {
              studentPoints[qIndex] = -1;
            }
          }
        });
        newPoints[dataIndex] = studentPoints;
      });
      return newPoints;
    });

    setAutoGradingDialogOpen(false);
  }, [Test_, submissionData]);

  const handleOpenTexDialog = useCallback((tex: string, event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentTexContent(tex);
    setTexDialogOpen(true);
  }, []);

  const handleCloseTexDialog = useCallback(() => {
    setTexDialogOpen(false);
  }, []);

  useEffect(() => {
    const paramClassId = searchParams.get("classId");
    if (paramClassId) {
      setClassId(paramClassId);
    } else {
      setClassId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    setCursorImage(generateCursor());
  }, []);

  useEffect(() => {
    if (!testid || !isSignedIn || !user?.id) return;

    const fetchTest = async () => {
      const test_res = await getTestById(Number(testid), String(user.id));
      if (test_res) {
        setTest(test_res);
      } else {
        alert(msg.ERROR_TEST_NOT_FOUND);
        router.push('/teacher');
      }
    };

    fetchTest();
  }, [testid, isSignedIn, user?.id, router]);

  useEffect(() => {
    if (Test_ && Test_.classes?.length > 0 && classId === null) {
      const defaultClassId = Test_.classes[0].id;
      router.replace(`/teacher/grading/${testid}?classid=${defaultClassId}`);
    }
  }, [Test_, classId, testid, router]);


  useEffect(() => {
    if (!testid || classId === null || !user?.id || !Test_) return;

    const fetchSubmissions = async () => {
      try {
        const foundClassIndex = Test_.classes.findIndex((a_class: Class) => a_class.id == classId);

        if (foundClassIndex === -1) {
          if (Test_.classes && Test_.classes.length > 0) {
            const firstValidClassId = Test_.classes[0].id;
            router.replace(`/teacher/grading/${testid}?classid=${firstValidClassId}`);
          } else {
            setSubmissionData(null);
          }
          return;
        }

        setClassIndex(foundClassIndex);

        const allSubmissionsForClass: SubmissionWithRelations[] | null = await getSubmissionsByTestAndClass({
          testId: Number(testid),
          classId: String(classId)
        });

        if (!allSubmissionsForClass || allSubmissionsForClass.length === 0) {
          setSubmissionData([]);
          setPoints({});
          setSubmissionIndex({});
          return;
        }

        const newSubmissionData: SubmissionWithRelations[] = [];
        const newPoints: Record<number, Record<number, number>> = {};
        const newSubmissionIndex: Record<number, number> = {};
        const usersInClass = Test_.classes[foundClassIndex]?.users || [];

        usersInClass.forEach((userInClass: User, user_index: number) => {
          const submission_res = allSubmissionsForClass.find(
            (sub) => sub.user.id === userInClass.id
          );

          if (submission_res) {
            const dataIndex = newSubmissionData.length;
            newSubmissionData.push(submission_res);
            newSubmissionIndex[user_index] = dataIndex;

            const userPoints: Record<number, number> = {};
            submission_res.answers.forEach((answer: Answer, answer_index: number) => {
              userPoints[answer_index] = Number(answer.point);
            });
            newPoints[dataIndex] = userPoints;
          }
        });
        setSubmissionData(newSubmissionData);
        setPoints(newPoints);
        setSubmissionIndex(newSubmissionIndex);

      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        setSubmissionData([]);
        setPoints({});
        setSubmissionIndex({});
      }
    };

    fetchSubmissions();
  }, [testid, classId, user?.id, Test_, router]);

  const selectClassHandle = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedClassID = event.target.value as string;
    router.push(`/teacher/grading/${testid}?classid=${selectedClassID}`);
  }, [router, testid]);

  const sectionHandleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSectionValue(newValue);
  }, []);

  const answerCellClickHandle = useCallback((newPoint: number, userIndex: number, questionIndex: number) => {
    setPoints(prevPoints => ({
      ...prevPoints,
      [userIndex]: {
        ...prevPoints[userIndex],
        [questionIndex]: newPoint
      }
    }));
  }, []);

  const savebuttonHandle = useCallback(async () => {
    if (!submissionData) return;

    let send_data: Array<Point> = [];
    submissionData.forEach((submission, dataIndex) => {
      submission.answers.forEach((answer: Answer, answerIndex: number) => {
        const newPoint = points[dataIndex]?.[answerIndex] ?? answer.point;
        send_data.push({ answerId: Number(answer.id), point: Number(newPoint) });
      });
    });

    const send_res = await setAnswerPoints(send_data);
    setIsSaving(false);
    if (send_res === 0) {
      //alert(msg.SUCCESS_SAVE_GRADING);
    } else {
      //alert(msg.ERROR_OCCURRED);
    }
  }, [submissionData, points]);

  useEffect(() => {
    if (!submissionData || Object.keys(points).length === 0) return;

    const timer = setTimeout(() => {
      savebuttonHandle();
    }, 2000);

    return () => clearTimeout(timer);
  }, [points, submissionData, savebuttonHandle]);


  const userMetrics = useMemo(() => {
    if (!Test_ || !submissionData) return [];

    const currentClass = Test_.classes.at(classIndex);
    if (!currentClass) return [];

    return currentClass.users.map((user: User, user_index: number) => {
      const data_index = submission_index[user_index];
      if (data_index === undefined) {
        return { totalPoints: 0, ungradedCount: 0 };
      }

      const userPoints = points[data_index];
      let totalPoints = 0;
      let ungradedCount = 0;

      const submissionAnswers = submissionData[data_index]?.answers || [];
      const totalQuestionsCount = Test_.sections.reduce((acc: number, section: any) => acc + section.questions.length, 0);

      for (let i = 0; i < totalQuestionsCount; i++) {
        const answer = submissionAnswers[i];
        if (answer) {
          const point = userPoints?.[i] ?? answer.point;
          if (point === -1) {
            ungradedCount++;
          } else {
            totalPoints += point;
          }
        }
      }
      return { totalPoints, ungradedCount };
    });
  }, [Test_, classIndex, submission_index, points, submissionData]);

  const currentClassUsers = useMemo(() => {
    const users = Test_?.classes.at(classIndex)?.users || [];
    return users
      .map((user: User, index: number) => ({ user, originalIndex: index }))
      .sort((a: { user: User, originalIndex: number }, b: { user: User, originalIndex: number }) => {
        const emailA = String((a.user as any).email || "");
        const emailB = String((b.user as any).email || "");
        return emailA.localeCompare(emailB);
      });
  }, [Test_, classIndex]);

  const exportbutonHandle = useCallback(() => {
    if (!Test_ || !submissionData) return;

    let exportdata_csv: string = "";
    let r1: string = `${msg.SUBMISSION_STATUS},${msg.NAME},${msg.EMAIL_LABEL},${msg.TOTAL_POINT},${msg.UNGRADED_COUNT},`;
    let r2: string = `,,,,,`;
    let r3: string = `,,,,,`;

    const format_text = (str: string): string => {
      if (!str) return "";
      return String(str).replaceAll("\n", "").replaceAll(",", "，");
    }

    Test_.sections.forEach((section: any, section_index: number) => {
      section.questions.forEach((question: Question, question_index: number) => {
        r1 += `${msg.SECTION_NUMBER}${section_index + 1}-${question_index + 1}解答,${msg.SECTION_NUMBER}${section_index + 1}-${question_index + 1}得点,`;
        r2 += `${format_text(question.question)},,`;
        r3 += `${format_text(question.answer)},,`;
      })
    })

    r1 = r1.slice(0, r1.length - 1) + "\n";
    r2 = r2.slice(0, r2.length - 1) + "\n";
    r3 = r3.slice(0, r3.length - 1) + "\n";
    exportdata_csv = r1 + r2 + r3;

    const totalQuestionsCount = Test_.sections.reduce((acc: number, section: any) => acc + section.questions.length, 0);
    const currentClass = Test_.classes.at(classIndex);

    if (currentClassUsers.length > 0) {
      currentClassUsers.forEach(({ user, originalIndex }: { user: User; originalIndex: number }) => {
        let rn: string = "";
        const data_index = submission_index[originalIndex];
        const submission = data_index !== undefined ? submissionData[data_index] : null;

        let statusText = msg.NOT_SUBMITTED;
        if (submission && Test_.endDate) {
          const subDate = new Date(submission.submissionDate);
          const endDate = new Date(Test_.endDate);
          statusText = subDate > endDate ? msg.OVERDUE : msg.ON_TIME;
        } else if (submission) {
          statusText = msg.SUBMITTED;
        }

        const metrics = userMetrics[originalIndex] || { totalPoints: 0, ungradedCount: 0 };

        rn += `${statusText},`;
        rn += `${format_text(user.name || '')},`;
        rn += `${format_text((user as any).email || '')},`;
        rn += `${metrics.totalPoints},`;
        rn += `${metrics.ungradedCount},`;

        if (submission) {
          for (let i = 0; i < totalQuestionsCount; i++) {
            const answer = submission.answers[i];
            if (answer) {
              rn += `${format_text(answer.text)},${points[data_index]?.[i] ?? 0},`;
            } else {
              rn += ",,";
            }
          }
        } else {
          rn += ",".repeat(totalQuestionsCount * 2);
        }
        rn = rn.slice(0, rn.length - 1) + "\n";
        exportdata_csv += rn;
      });
    }

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, exportdata_csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a_buf = document.createElement('a');
    a_buf.href = url;
    a_buf.download = `${Test_?.title}_${currentClass?.name}.csv`;
    document.body.appendChild(a_buf);
    a_buf.click();
    document.body.removeChild(a_buf);
    URL.revokeObjectURL(url);
  }, [Test_, classIndex, submissionData, submission_index, points, userMetrics, currentClassUsers]);

  const visibleQuestions = useMemo(() => {
    if (!Test_?.sections) return { questions: [], startIndex: 0 };

    let startIndex = 0;
    for (let i = 0; i < sectionValue; i++) {
      startIndex += Test_.sections[i]?.questions.length || 0;
    }
    const questions = Test_.sections.at(sectionValue)?.questions || [];
    return { questions, startIndex };
  }, [Test_, sectionValue]);



  const renderSubmissionStatus = useCallback((user_index: number) => {
    const data_index = submission_index[user_index];
    const submission = data_index !== undefined && submissionData ? submissionData[data_index] : null;

    if (!submission || !Test_?.endDate) {
      return (
        <Tooltip title={msg.NOT_SUBMITTED} arrow>
          <Box width={12} height={12} borderRadius="50%" bgcolor="grey.400" flexShrink={0} />
        </Tooltip>
      );
    }

    const subDate = new Date(submission.submissionDate);
    const endDate = new Date(Test_.endDate);
    const isLate = subDate > endDate;

    let tooltipText = `${msg.SUBMIT_PREFIX}${subDate.toLocaleString()}`;
    if (isLate) {
      const diffMs = subDate.getTime() - endDate.getTime();
      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / 1000 / 60) % 60);
      let lateText = "";
      if (d > 0) lateText += `${d}${msg.DAY}`;
      if (h > 0) lateText += `${h}${msg.HOUR}`;
      if (m > 0) lateText += `${m}${msg.MINUTE}`;
      if (lateText === "") lateText = msg.LESS_THAN_A_MINUTE;
      tooltipText += `\n(${msg.LATE_PREFIX}${lateText}${msg.LATE_SUFFIX})`;
    } else {
      tooltipText += `\n(${msg.ON_TIME})`;
    }

    return (
      <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipText}</span>} arrow>
        <Box width={12} height={12} borderRadius="50%" bgcolor={isLate ? "error.main" : "success.main"} flexShrink={0} />
      </Tooltip>
    );
  }, [submission_index, submissionData, Test_]);

  return (
    <TeacherGuard>
      <Paper sx={{ borderRadius: 0, width: "100%", m: 0, p: 0 }}>
        <Box sx={{ pt: 2, pr: 2, pb: 1 }}>
          <Box display="flex" justifyContent="right">
            <Box width="100%">
              <Typography variant="h4" sx={{ ml: 2, mt: 2 }} width="100%">
                {Test_?.title}
                {Test_ && (
                  <Chip
                    label={Test_.isPublished ? msg.PUBLISHED : msg.UNPUBLISHED}
                    color={Test_.isPublished ? "success" : "default"}
                    sx={{ ml: 2, verticalAlign: 'middle', fontWeight: 'normal' }}
                  />
                )}
              </Typography>
              <hr />
              <Typography variant="h6" sx={{ ml: 2 }}>
                {Test_?.summary}
              </Typography>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={1}>
              {/* 自動採点ボタン */}
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setAutoGradingDialogOpen(true)}
                sx={{ height: '56px', whiteSpace: 'nowrap' }} // TextField(select)の高さに合わせる
              >
                {msg.AUTO_GRADING}
              </Button>

              <Box width="10em">
                <Box display="flex" justifyContent="right">
                  {Test_?.classes?.length > 0 &&
                    <TextField select id="select_class" value={classId || ''} onChange={selectClassHandle} fullWidth>
                      {
                        Test_?.classes.map((a_class: Class) =>
                          <MenuItem key={"select_class_" + a_class.id} value={a_class.id}>
                            {a_class.name}
                          </MenuItem>
                        )
                      }
                    </TextField>
                  }
                </Box>
                <Typography textAlign="right">
                  {msg.CLASS_ID}: {classId ?? '...'}
                </Typography>
                <Typography textAlign="right">
                  {msg.TEST_ID}: {testid}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Container maxWidth={false} sx={{ mb: 1 }}>
        <Paper sx={{ m: 1, mr: 0, ml: 0 }}>
          {
            (Test_ != null && Test_.sections && Test_.sections.length > 0) ?
              (<SectionTabs sections={Test_.sections} sectionValue={sectionValue} sectionHandleChange={sectionHandleChange} />)
              : (<>
                <Box textAlign="center" padding={5}>
                  <Typography>{msg.NO_TEST_DATA}</Typography>
                </Box>
              </>)
          }
          {Test_ ?
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: "center", bgcolor: "background.paper" }} className={styles.username_cell}></TableCell>
                    <TableCell sx={{ textAlign: "center", bgcolor: "background.paper" }} className={styles.point_cell}>{msg.TOTAL_POINT}</TableCell>
                    <TableCell sx={{ textAlign: "center", bgcolor: "background.paper" }} className={styles.point_cell}>{msg.UNGRADED_COUNT}</TableCell>
                    {
                      visibleQuestions.questions.map((question: Question, index: number) =>
                        <TableCell key={"question" + question.id} sx={{ textAlign: "center", bgcolor: "background.paper" }}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            [{msg.ALLOCATION_POINT}: {question.allocationPoint ?? 1}]
                          </Typography>
                          <Latex>{question.question}</Latex>
                          <hr />
                          <Box onContextMenu={(e) => handleOpenTexDialog(question.answer, e)} sx={{ cursor: 'context-menu' }}>
                            <Latex>{question.answer}</Latex>
                          </Box>
                        </TableCell>
                      )
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    currentClassUsers.map(({ user, originalIndex }: { user: User; originalIndex: number }) => {
                      const metrics = userMetrics[originalIndex] || { totalPoints: 0, ungradedCount: 0 };
                      const data_index = submission_index[originalIndex];

                      return (
                        <TableRow key={"ROW-" + user.id}>
                          <TableCell key={"username-" + user.id} className={styles.name_cell}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {renderSubmissionStatus(originalIndex)}
                              <Box display="flex" flexDirection="column">
                                <Typography variant="body2">{user.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{(user as any).email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell key={"totalPoints-" + user.id} sx={{ textAlign: "center" }} className={styles.point_cell}>
                            {metrics.totalPoints}
                          </TableCell>
                          <UngradedCountCell key={"ungraded-" + user.id} ungraded_count={metrics.ungradedCount} />
                          {
                            visibleQuestions.questions.map((question: Question, index: number) => {
                              const questionGlobalIndex = visibleQuestions.startIndex + index;

                              if (data_index !== undefined && submissionData?.[data_index]?.answers?.[questionGlobalIndex]) {
                                const answer = submissionData[data_index].answers[questionGlobalIndex];
                                const currentPoint = points[data_index]?.[questionGlobalIndex] ?? Number(answer.point);

                                return (
                                  <AnswerCell
                                    answer={(answer.text === "" ? " " : answer.text)}
                                    point={currentPoint}
                                    answerCellHandle={answerCellClickHandle}
                                    allocationPoint={question.allocationPoint ?? 1}
                                    key={`answer-${user.id}-${question.id}`}
                                    userIndex={data_index}
                                    questionIndex={questionGlobalIndex}
                                    cursorImage={cursorImage}
                                    onRightClick={handleOpenTexDialog}
                                  />
                                )
                              } else {
                                return (
                                  <TableCell key={`noanswer-${user.id}-${question.id}`} align="center">
                                    -
                                  </TableCell>
                                )
                              }
                            })
                          }
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
            : <></>
          }
        </Paper>
        {Test_ && (
          <>
            <Button variant="contained" sx={{ mb: 1, mt: 0 }} className={styles.save_button} onClick={savebuttonHandle}>{msg.SAVE}</Button>
            <Button sx={{ mb: 1, mt: 0 }} className={styles.export_button} onClick={exportbutonHandle}>{msg.EXPORT_CSV}</Button>
          </>
        )}
      </Container>

      <Dialog open={texDialogOpen} onClose={handleCloseTexDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{msg.RAW_TEX}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, overflowX: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
              {currentTexContent}
            </pre>
          </Box>
        </DialogContent>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            {msg.FORMATED_TEX}
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'blue.50', borderRadius: 1, overflowX: 'auto', border: '1px solid', borderColor: 'blue.100' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
              {format(currentTexContent)}
            </pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTexDialog}>{msg.CLOSE}</Button>
        </DialogActions>
      </Dialog>
      {/* 自動採点確認ダイアログ */}
      <Dialog open={autoGradingDialogOpen} onClose={() => setAutoGradingDialogOpen(false)}>
        <DialogTitle>{msg.AUTO_GRADING_CONFIRM_TITLE}</DialogTitle>
        <DialogContent>
          <Typography>{msg.AUTO_GRADING_CONFIRM_MESSAGE}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoGradingDialogOpen(false)}>{msg.CANCEL}</Button>
          <Button onClick={autoGradingHandle} color="primary" variant="contained">
            {msg.EXECUTE}
          </Button>
        </DialogActions>
      </Dialog>
    </TeacherGuard>
  );
}