"use client"

import React, { useEffect, useState, useMemo, useCallback, use } from "react";
import { Box, Container, Paper, Button, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, MenuItem } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";

import { User, Class, Question, Section, Answer, Submission as PrismaSubmission } from "@prisma/client" // Add PrismaSubmission type
import { getTestById } from "@/app/api/test/getTestById";
import { getSubmissionsByTestAndClass } from "@/app/api/test/result"; // Assuming getSubmissionsByTestAndClass is in this file
import { setAnswerPoints } from "@/app/api/test/setAnswerPoints"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from '@clerk/nextjs'
import { TeacherGuard } from "@/lib/guard"

import styles from "./styles.module.css"

//#region APIのデータ用
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
//#endregion

//======================================
//#region TabPanel等のプロパティ
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
//======================================
//#endregion

//#region Sectionのタブ
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
            <Tab label={"Part" + section.number} key={index} {...a11yProps(index)} />
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
//#endregion

//#region Memoized Components
const AnswerCell = React.memo(function AnswerCell({ answer, point, userIndex, questionIndex, answerCellHandle, cursorImage }: { answer: string; point: number; userIndex: number; questionIndex: number; answerCellHandle: (newPoint: number, userIndex: number, questionIndex: number) => void; cursorImage: string; }) {
  if (!answer) {
    return null
  }

  const click_handle = () => {
    const new_point = (point === 0 ? 1 : 0);
    answerCellHandle(new_point, userIndex, questionIndex);
  }

  const keydown_handle = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    switch (event.key) {
      case "Enter":
      case " ":
        click_handle();
    }
  }

  return (<>
    <TableCell onClick={click_handle} onKeyDown={keydown_handle} tabIndex={0} className={styles.answer_cell} style={{ cursor: cursorImage ? `url(${cursorImage}), auto` : 'pointer' }}>
      <div className={((point === -1) ? styles.ungraded_cell : (point > 0) ? styles.correct_cell : styles.wrong_cell)} ></div>
      <div className={styles.matharea}><InlineMath math={String(answer)} /></div>
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
  // `document` is only available in the browser environment
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
//#endregion

export default function GradingPage({ params }: { params: Promise<{ testid: number }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [Test_, setTest] = useState<any | null | undefined>(undefined);
  const [submissionData, setSubmissionData] = useState<SubmissionWithRelations[] | null | undefined>(undefined);

  const { user, isSignedIn } = useUser();

  const { testid } = use(params);
  const classId = searchParams.get("classid");

  const [classIndex, setClassIndex] = useState(0);
  const [sectionValue, setSectionValue] = useState(0);
  const [points, setPoints] = useState<Record<number, Record<number, number>>>({});
  const [submission_index, setSubmissionIndex] = useState<Record<number, number>>({});

  const [cursorImage, setCursorImage] = useState("");

  useEffect(() => {
    setCursorImage(generateCursor());
  }, []);


  const selectClassHandle = useCallback((selectedClassID: string) => {
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
    if (send_res === 0) {
      alert("Saved grading data successfully.");
    } else {
      alert("An Error has occurred.");
    }
  }, [submissionData, points]);
  
  const exportbutonHandle = useCallback(() => {
    if (!Test_ || !submissionData) return;

    let exportdata_csv: string = "";
    let r1: string = "Part-QNumber,";
    let r2: string = "Question,";
    let r3: string = "Answer,";

    const format_text = (str: string): string => {
        return str.replaceAll("\n", "").replaceAll(",", "，");
    }

    Test_.sections.forEach((section:any, section_index: number) => {
        section.questions.forEach((question: Question, question_index: number) => {
            r1 += `Part${section_index + 1}-${question_index + 1},,`;
            r2 += `${format_text(question.question)},,`;
            r3 += `${format_text(question.answer)},,`;
        })
    })

    r1 = r1.slice(0, r1.length - 1) + "\n";
    r2 = r2.slice(0, r2.length - 1) + "\n";
    r3 = r3.slice(0, r3.length - 1) + "\n";
    exportdata_csv = r1 + r2 + r3;

    const totalQuestionsCount = Test_.sections.reduce((acc: number, section: any) => acc + section.questions.length, 0);

    Test_.classes.at(classIndex)?.users.forEach((user: User, user_index: number) => {
        let rn: string = "";
        const data_index = submission_index[user_index];
        rn += `${format_text(user.name || '')},`;

        if (data_index !== undefined) {
            const submission = submissionData.at(data_index); 
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
                // 提出データが見つからない場合
                rn += ",".repeat(totalQuestionsCount * 2);
            }
        } else {
            // 提出インデックスが見つからない場合（提出がないユーザー）
            rn += ",".repeat(totalQuestionsCount * 2);
        }
        rn = rn.slice(0, rn.length - 1) + "\n";
        exportdata_csv += rn;
    });

    const blob = new Blob([exportdata_csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a_buf = document.createElement('a');
    a_buf.href = url;
    a_buf.download = `${Test_?.title}_${Test_?.classes.at(classIndex)?.name}.csv`;
    document.body.appendChild(a_buf);
    a_buf.click();
    document.body.removeChild(a_buf);
    URL.revokeObjectURL(url);
  }, [Test_, classIndex, submissionData, submission_index, points]);


  const userMetrics = useMemo(() => {
      if (!Test_ || !submissionData) return [];

      return Test_.classes.at(classIndex)?.users.map((user: User, user_index: number) => {
          const data_index = submission_index[user_index]; 
          if (data_index === undefined) { 
              return { totalPoints: 0, ungradedCount: 0 };
          }

          const userPoints = points[data_index];
          let totalPoints = 0;
          let ungradedCount = 0;

          const submissionAnswers = submissionData[data_index]?.answers || [];
          for (let i = 0; i < submissionAnswers.length; i++) {
              const point = userPoints?.[i] ?? submissionAnswers[i].point;
              if (point === -1) {
                  ungradedCount++;
              } else {
                  totalPoints += point;
              }
          }
          return { totalPoints, ungradedCount };
      }) || [];
  }, [Test_, classIndex, submission_index, points, submissionData]);

  const visibleQuestions = useMemo(() => {
    if (!Test_?.sections) return { questions: [], startIndex: 0 };
    
    let startIndex = 0;
    for (let i = 0; i < sectionValue; i++) {
        startIndex += Test_.sections[i]?.questions.length || 0;
    }
    const questions = Test_.sections.at(sectionValue)?.questions || [];
    return { questions, startIndex };
  }, [Test_, sectionValue]);


  useEffect(() => {
    if (testid && classId && isSignedIn) {
      const fetchTestAndSubmissions = async () => {
        // 1. テスト情報を取得
        const test_res = await getTestById(Number(testid), String(user?.id));
        if (!test_res) {
          setTest(null);
          return;
        }
        
        // 2. 指定されたclassIdのクラスを見つける
        const foundClassIndex = test_res.classes.findIndex((a_class: Class) => a_class.id == classId);
        if (foundClassIndex === -1) {
          setTest(null);
          return;
        }
        
        setTest(test_res);
        setClassIndex(foundClassIndex);
        
        // 3. getSubmissionsByTestAndClass を使用して、指定されたテストとクラスのすべての提出物を取得
        const allSubmissionsForClass: SubmissionWithRelations[] = await getSubmissionsByTestAndClass({
          testId: Number(testid),
          classId: String(classId)
        });

        const newSubmissionData: SubmissionWithRelations[] = [];
        const newPoints: Record<number, Record<number, number>> = {};
        const newSubmissionIndex: Record<number, number> = {};

        const usersInClass = test_res.classes[foundClassIndex]?.users || [];

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
      };

      fetchTestAndSubmissions();
    }
  }, [testid, classId, isSignedIn, user?.id]);

  return (
    <TeacherGuard>
      {/*==========ヘッダエリア==========*/}
      <Paper sx={{ borderRadius: 0, width: "100%", m: 0, p: 0 }}>
        <Box sx={{ pt: 2, pr: 2, pb: 1 }}>
          <Box display="flex" justifyContent="right">
            <Box width="100%">
              <Typography variant="h4" sx={{ ml: 2, mt: 2 }} width="100%">
                {Test_?.title}
              </Typography>
              <hr />
              <Typography variant="h6" sx={{ ml: 2 }}>
                {Test_?.summary}
              </Typography>
            </Box>

            <Box width="10em">
              <Box display="flex" justifyContent="right">
                {Test_?.classes?.length > 0 &&
                  <TextField select id="select_class" value={classId || ''} fullWidth>
                    {
                      Test_?.classes.map((a_class: Class, index: number) =>
                        <MenuItem key={"select_class" + index} value={a_class.id} onClick={() => selectClassHandle(a_class.id)}>
                          {a_class.name}
                        </MenuItem>
                      )
                    }
                  </TextField>
                }
              </Box>
              <Typography textAlign="right">
                Class ID: {classId}
              </Typography>
              <Typography textAlign="right">
                Test ID: {testid}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Container maxWidth={false} sx={{ mb: 1 }}>
        {/*==========ここからTableエリア==========*/}
        <Paper sx={{ m: 1, mr: 0, ml: 0 }}>
          {
            (Test_ != null && Test_.sections && Test_.sections.length > 0) ?
              (<SectionTabs sections={Test_.sections} sectionValue={sectionValue} sectionHandleChange={sectionHandleChange} />)
              : (<>
                <p>Submission Data not found. </p>
                <p>The test has not been submitted yet or the test does not exist.</p>
                <p>The ClassID or TestID may be incorrect or no sections/questions are defined for the test.</p>
              </>)
          }
          <TableContainer component={Paper}>
            <Table>
              {/*==========Tableヘッダセル==========*/}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: "center" }} className={styles.username_cell}></TableCell>
                  <TableCell sx={{ textAlign: "center" }} className={styles.point_cell}>Total Point</TableCell>
                  <TableCell sx={{ textAlign: "center" }} className={styles.point_cell}>Ungraded</TableCell>
                  {
                    visibleQuestions.questions.map((question: Question, index: number) =>
                      <TableCell key={"question" + question.id} sx={{ textAlign: "center" }}>
                        <Latex>{question.question}</Latex>
                        <hr />
                        <InlineMath>{question.answer}</InlineMath>
                      </TableCell>
                    )
                  }
                </TableRow>
              </TableHead>
              {/*==========以下データセル==========*/}
              <TableBody>
                {
                  Test_?.classes.at(classIndex)?.users.map((user: User, user_index: number) => {
                    const metrics = userMetrics[user_index] || { totalPoints: 0, ungradedCount: 0 };
                    return (
                        <TableRow key={"ROW-" + user.id}>
                            <TableCell key={"username-" + user.id} className={styles.name_cell}>{user.name}</TableCell>
                            <TableCell key={"totalPoints-" + user.id} sx={{ textAlign: "center" }} className={styles.point_cell}>
                                {metrics.totalPoints}
                            </TableCell>
                            <UngradedCountCell key={"ungraded-" + user.id} ungraded_count={metrics.ungradedCount}/>
                            {
                                visibleQuestions.questions.map((question: Question, index: number) => {
                                    // 表示中のセクションでの質問の相対インデックスに、前のセクションまでの質問数を加算して、
                                    // 提出物のanswers配列における絶対インデックスを計算
                                    const questionGlobalIndex = visibleQuestions.startIndex + index;
                                    const data_index = submission_index[user_index]; // user_index から submissionData のインデックスを取得
                                    
                                    if (data_index !== undefined && submissionData?.[data_index]?.answers?.[questionGlobalIndex]) {
                                        const answer = submissionData[data_index].answers[questionGlobalIndex];
                                        const currentPoint = points[data_index]?.[questionGlobalIndex] ?? Number(answer.point);
                                        return (
                                            <AnswerCell
                                                answer={(answer.text === "" ? " " : answer.text)}
                                                point={currentPoint}
                                                answerCellHandle={answerCellClickHandle}
                                                key={`answer-${user.id}-${question.id}`}
                                                userIndex={data_index} 
                                                questionIndex={questionGlobalIndex}
                                                cursorImage={cursorImage}
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
        </Paper>
        {/*==========Table終わり==========*/}
        {Test_ && (
            <>
                <Button variant="contained" sx={{ mb: 1, mt: 0 }} className={styles.save_button} onClick={savebuttonHandle}>Save</Button>
                <Button sx={{ mb: 1, mt: 0 }} className={styles.export_button} onClick={exportbutonHandle}>Export as CSV</Button>
            </>
        )}
      </Container>
    </TeacherGuard>
  );
}
