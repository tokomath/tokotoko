"use client";
import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Button, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, MenuItem } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Latex from "react-latex-next";
import { useSession } from 'next-auth/react';

import { getTestById } from "@/app/api/test/getTestById";
import { getSubmission } from "@/app/api/test/result"
import { setAnswerPoints } from "@/app/api/test/setAnswerPoints"
import { useRouter,useSearchParams } from "next/navigation"

import styles from "./styles.module.css"

//#region APIのデータ用
interface User {
  id: Number;
  name: String;
  role: Number;
}

interface Class {
  id: Number;
  name: String;
  users: User[];
}

interface Question {
  id: number;
  sectionId: number;
  number: number;
  question: string;
  answer: string;
}

interface Section {
  id: number;
  number: number;
  summary: string;
  questions: Question[];
}

interface TestData {
  id: number;
  title: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  sections: Section[];
  classes: Class[];
}

interface Answer {
  id: Number;
  point: Number;
  questionId: Number;
  submissionId: Number;
  text: string;
}

interface Submission {
  id: Number;
  studentId: Number;
  answers: Answer[];
}

interface Point {
  answerId: number;
  point: number;
}
//#endregion

//======================================
//#region TabPanel等のプロパティ
//(ほぼmui公式サンプルからコピペ)
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

function a11yProps(index0: number, index1?: number, index2?: number) {
  return {
    id: `simple-tab-${index0}` + (index1 == null ? "" : `-${index1}`) + (index2 == null ? "" : `-${index2}`),
    'aria-controls': `simple-tabpanel-${index0}` + (index1 == null ? "" : `-${index1}`) + + (index2 == null ? "" : `-${index2}`),
  };
}
//======================================
//#endregion

//#region Sectionのタブ
interface AnswerCellProps {
  point: number;
  userIndex: number;
  questionIndex: number;
  answer: String;
  answerCellHandle: (point: number, userIndex: number, questionIndex: number) => void;

  cursorImage: String;
}

interface UngradedCountCellProps {
  user_index: number;
  ungraded_count: number;
}

interface SectionTabProps {
  sections: Section[];
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

function AnswerCell({ answer, point, userIndex, questionIndex, answerCellHandle,cursorImage}: AnswerCellProps) {
  if(!answer)
  {
    return null
  }
  
  const click_handle = () => {
    const new_point = (point === 0 ? 1 : 0);
    answerCellHandle(new_point, userIndex, questionIndex);
  }

  const keydown_handle = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    switch(event.key)
    {
      case "Enter":
      case " ":
        click_handle();
    }
  }
  
  return (<>
    <TableCell onClick={click_handle}  onKeyDown={keydown_handle} tabIndex={0} className={styles.answer_cell} style={{ cursor: `url(${cursorImage}), auto` }}>
      <div className={((point == -1) ? styles.ungraded_cell : (point > 0) ? styles.correct_cell : styles.wrong_cell)} ></div>
      <div className={styles.matharea}><InlineMath math={String(answer)} /></div>
    </TableCell>
  </>)
}

function UngradedCountCell({user_index, ungraded_count }: UngradedCountCellProps) {
  let style = (ungraded_count === 0) ? styles.ungraded_false : styles.ungraded_true;
  return (
    <TableCell key={"ungraded-" + user_index} sx={{ textAlign: "center" }} className={styles.point_cell+" "+((ungraded_count === 0) ? styles.ungraded_false : styles.ungraded_true)}>
    {ungraded_count}
  </TableCell>
  );
}


function generateCursor() : String{
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = 64;
  canvas.width = 64;
  if(ctx != null)
  {
    ctx.clearRect(0,0, canvas.width,canvas.height);

    //@mui/icons-material/ModeEditOutline のpathデータ
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

export default function GradingPage({ params }: { params: { testid: number } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [submissionData, setSubmissionData] = useState<Submission[]>([]);
  const { data: session, status } = useSession();
  const testID = Number(params.testid);
  const classID = Number(searchParams.get("classid"));
  const [classIndex,setClassIndex] = useState(0);
  const [sectionValue, setSectionValue] = useState(0);
  const [points, setPoints] = useState<Record<number, Record<number, number>>>({});

  const [cursorImage,setCursorImage] = useState("");
  const [totalpoint_label, set_totalpoint_label] = useState("");
  const [ungraded_label,set_ungraded_label] = useState("");

  //#region イベントハンドラ
  const selectClassHandle = (selectedClassID: number) => {    
    savebuttonHandle();
    router.push("/teacher/grading/"+testID+"?classid="+selectedClassID);
  }

  const sectionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSectionValue(newValue);
  };

  const answerCellClickHandle = (newPoint: number, userIndex: number, questionIndex: number) => {
    setPoints(prevPoints => ({
      ...prevPoints,
      [userIndex]: {
        ...prevPoints[userIndex],
        [questionIndex]: newPoint
      }
    }));
    console.log(-1 * Number(newPoint))
  }

  const savebuttonHandle = async () => {
    let send_data: Array<Point> = [];
    submissionData.map((submission, userIndex) => {
      submission.answers.map((answer, answerIndex) => {
        const userPoints = points[userIndex];
        const newPoint = userPoints ? userPoints[answerIndex] || 0 : 0;
        send_data.push({ answerId: Number(answer.id), point: newPoint });
      });
    });
    //console.log("SEND DATA")
    //console.log(send_data);
    const send_res = await setAnswerPoints(send_data);
    if (send_res == 0) {
      alert("Saved grading data successfully.")
    }
    else if (send_res == -1) {
      alert("An Error has occurred.")
    }
  }

  const exportbutonHandle = () => {
    let exportdata_csv: String = "";
    let r1: String = "Part-QNumber,";
    let r2: String = "Question,";
    let r3: String = "Answer,";
    testData?.sections.map((section, section_index) => {
      section.questions.map((question, question_index) => {
        r1 += "Part" + section_index + "-" + question_index + ",,";
        r2 += question.question + ",,";
        r3 += question.answer + ",,";
      })
    })
    r1 = r1.slice(0, r1.length - 1) + "\n";
    r2 = r2.slice(0, r2.length - 1) + "\n";
    r3 = r3.slice(0, r3.length - 1) + "\n";
    exportdata_csv = r1 + "" + r2 + "" + r3;
    submissionData.map((submissionDatum, index) => {
      let rn: String = "";
      rn += String(testData?.classes.at(classIndex)?.users.at(index)?.name) + ",";
      submissionDatum.answers.map((answer, answer_index) => {
        rn += answer.text + "," + points[index][answer_index] + ",";
      })
      rn = rn.slice(0, rn.length - 1) + "\n"
      exportdata_csv += rn + "";
    })

    const blob = new Blob([exportdata_csv + ""], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a_buf = document.createElement('a');
    a_buf.href = url;
    a_buf.download = testData?.title + "_" + testData?.classes.at(classIndex)?.name + ".csv"
    document.body.appendChild(a_buf);
    a_buf.click();
    document.body.removeChild(a_buf);
    URL.revokeObjectURL(url);
  }

  //#endregion

  const calculateUserTotalPoints = (userIndex: number): number => {
    let totalPoints = 0;
    const userPoints = points[userIndex];

    if (userPoints) {
      Object.values(userPoints).forEach(point => {
        totalPoints += (point != -1) ? point : 0;
      });
    }

    return totalPoints;
  };

  const countUngraded = (userIndex: number) : number => {
    let ungraded = 0;
    const userPoints = points[userIndex];

    if(userPoints)
    {
      Object.values(userPoints).forEach(point => {
        ungraded += (point === -1) ? 1 : 0;
      });
    }

    return ungraded;
  }
  useEffect(() => {
    if (session && classID != 0) {
      //console.log("Session");
      //console.log(session);

      const submissionData_buf: Array<Submission> = [];
      const fetchTest = async () => {
        const test_res = await getTestById(Number(testID), String(session.user.name));
        if (test_res) {
          let class_index = -1;
          console.log("getTestById");
          console.log(test_res);
          setTestData(test_res);
          test_res.classes.map((a_class,index) => {
            if(a_class.id == classID)
            {
              class_index = index;
              setClassIndex(index);
              console.log(a_class.id + " " + classID +" "+index);
            }
          });

          if(class_index == -1)
          {
            console.log("zero" + class_index)
            setTestData(null);
            return;
          }

          //console.log("Submissions")
          test_res.classes.at(class_index)?.users.map(async (user, index) => {
            const submission_res = await getSubmission({ testId: Number(testID), username: user.name });
            //console.log(index + ":" + user.name);
            //console.log(submission_res);
            if (submission_res) {
              submissionData_buf.push({ id: Number(submission_res?.id), studentId: Number(submission_res?.studentId), answers: submission_res.answers });
            }
            if (index + 1 == test_res.classes.at(class_index)?.users.length) {
              submissionData_buf.map((submissionDatum_buf, index_submission) => {
                submissionDatum_buf.answers.map((answer, index_answer) => {
                  setPoints(prevPoints => ({
                    ...prevPoints,
                    [index_submission]: {
                      ...prevPoints[index_submission],
                      [index_answer]: Number(answer.point)
                    }
                  }));
                })
              })
              setSubmissionData(submissionData_buf);
              set_totalpoint_label("Total Point");
              set_ungraded_label("Ungraded");

              setCursorImage(String(generateCursor()));
              console.log(class_index);
            }
          });
        }
      }
      fetchTest();
    }
  }, [status,classID]);

  return (
    <>
      {/*==========ヘッダエリア==========*/}
      <Paper sx={{ borderRadius: 0, width: "100%",m:0,p:0}}>
        <Box sx={{ pt: 2, pr: 2, pb: 1 }}>
          <Box display="flex" justifyContent="right">
            <Box width="100%">
              <Typography variant="h4" sx={{ ml: 2, mt: 2 }} width="100%">
                {testData?.title}
              </Typography>
              <hr/>
              <Typography variant="h6" sx={{ ml: 2 }}>
                {testData?.summary}
              </Typography>
            </Box>

            <Box width="10em">
              <Box display="flex" justifyContent="right">
              {
                /*クラスを選択するコンボボックス*/
                Number(testData?.classes.length) > 0 ?
                <TextField select id="select_class" value={classID}>
                {
                  testData?.classes.map((a_class,index) => 
                    <MenuItem key={"select_class"+index} value={Number(a_class.id)} onClick={()=>selectClassHandle(Number(a_class.id))}>
                      {a_class.name}
                    </MenuItem>
                  )
                }
              </TextField>
              : <></>
              }
              </Box>
              <Typography textAlign="right">
                Class ID: {classID}
              </Typography>
              <Typography textAlign="right">
                Test ID: {testID}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Container maxWidth={false} sx={{ mb: 1 }}>
        {/*==========ここからTableエリア==========*/}
        <Paper sx={{ m: 1, mr: 0, ml: 0 }}>
          {
            (testData != null) ?
              (<SectionTabs sections={testData.sections} sectionValue={sectionValue} sectionHandleChange={sectionHandleChange} />)
              : (<>
                <p>Submission Data not found. </p>
                <p>The test has not been submitted yet or the test does not exist.</p>
                <p>The ClassID or TestID may be incorrect.</p>
              </>)
          }
          <TableContainer component={Paper}>
            <Table>
              {/*==========Tableヘッダセル==========*/}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: "center" }} className={styles.username_cell}></TableCell>
                  {/* 合計ポイント表示用のヘッダセル */}
                  <TableCell sx={{ textAlign: "center" }} className={styles.point_cell}>
                    {totalpoint_label}
                  </TableCell>

                  {/*未採点問題数表示用のヘッダセル*/}
                  <TableCell sx={{ textAlign: "center" }} className={styles.point_cell}>
                    {ungraded_label}
                  </TableCell>

                  { //表のヘッダ Questionの問題と解を表示する

                    testData?.sections.at(sectionValue)?.questions.map((question: Question, index) =>
                      <TableCell key={"question" + index} sx={{ textAlign: "center" }}>
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
                  testData?.classes.at(classIndex)?.users.map((user: User, user_index) =>
                    <TableRow key={"ROW" + user_index}>
                      {/*ユーザー名を表示するセル*/}
                      <TableCell key={"username" + user_index} className={styles.name_cell}>{user.name}</TableCell>
                      
                      {/* 合計ポイントを表示するセル */}
                      <TableCell key={"totalPoints-" + user_index} sx={{ textAlign: "center" }} className={styles.point_cell}>
                        {calculateUserTotalPoints(user_index)}
                      </TableCell>

                      {/*未採点問題数を表示するセル*/}
                      <UngradedCountCell user_index={user_index} ungraded_count={countUngraded(user_index)}/>
                      
                      {
                        (function () {
                          let start = 0;
                          const cells = [];
                          for (let i = 0; i < sectionValue; i++) //現在のセクションの前にある問題数を数える
                          {
                            start += Number(testData.sections.at(i)?.questions.length);
                          }

                          //現在のセクションの問題を表示する
                          for (let question_index = start; question_index < start + Number(testData.sections.at(sectionValue)?.questions.length); question_index++) {
                            let answer = submissionData.at(user_index)?.answers.at(question_index);
                            if (answer != undefined) {
                              const currentPoint = points[user_index]?.[question_index];
                              cells.push(
                                <AnswerCell answer={answer.text}
                                  point={currentPoint}
                                  answerCellHandle={answerCellClickHandle}
                                  key={user.id + "-" + answer.questionId}
                                  userIndex={user_index}
                                  questionIndex={question_index}
                                  cursorImage={cursorImage}
                                  >
                                </AnswerCell>
                              )
                            }
                          }
                          return cells;
                        }())
                      }
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        {/*==========Table終わり==========*/}
        {
          <>
            {testData ?
              <>
                <Button variant="contained" sx={{ mb: 1, mt: 0 }} className={styles.save_button} onClick={savebuttonHandle}>Save</Button>
                <Button sx={{ mb: 1, mt: 0 }} className={styles.export_button} onClick={exportbutonHandle}>Export as CSV</Button>
              </>
              : <></>}
          </>
        }
      </Container>
    </>
  );
}