"use client";
import React, { Component, ReactElement, ReactNode, useEffect, useState } from "react";
import { Box,Container, Paper,Button, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, colors} from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import { useSession } from 'next-auth/react';

import { getTestById } from "@/app/api/test/getTestById";
import { getSubmission } from "@/app/api/test/result"

import styles from "./styles.module.css"
Button


//#region APIのデータ用
interface User {
    id: Number;
    name: String;
    role: Number;
}

interface Class {
    id : Number;
    users : User[];
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

interface Answer  {
    id: Number;
    point: Number;
    questionId: Number;
    submissionId: Number;
    text: string;
}

interface Submission {
    id : Number;
    studentId : Number;
    answers : Answer[];
}

interface Point {
    answerId: number;
    point: number;
}
//#endregion

function Style() {
    document.getElementsByTagName("body")[0].style.height = "100vh";
    document.getElementsByTagName("body")[0].style.display = "flex";
    document.getElementsByTagName("body")[0].style.flexFlow = "column"
    document.getElementsByTagName("footer")[0].style.position = "absolute";
    document.getElementsByTagName("footer")[0].style.bottom = "0";
    document.getElementsByTagName("footer")[0].style.width = "100%";
}

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

function a11yProps(index0: number, index1?: number,index2?: number) {
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
    answerCellHandle: (point: number,userIndex: number, questionIndex: number) => void;
}

interface SectionTabProps {
    sections: Section[];
    sectionValue: number;
    sectionHandleChange: (event: React.SyntheticEvent, newValue: number) => void;
}

function SectionTabs({sections, sectionValue, sectionHandleChange} : SectionTabProps)
{
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={sectionValue} onChange={sectionHandleChange} aria-label="section tabs" variant="fullWidth">
                {
                    sections.map((section,index)=>(
                        <Tab label={"§" + section.number} key={index} {...a11yProps(index)} />
                    ))
                }
            </Tabs>
            {
                sections.map((section,index)=>(
                    <CustomTabPanel value={sectionValue} index={index} key={index}>
                        <InlineMath math = {section.summary} />
                    </CustomTabPanel>
                ))
            }
        </Box>
    );
}
//#endregion

function AnswerCell({answer,point,userIndex,questionIndex,answerCellHandle}:AnswerCellProps)
{
    const cell_handle = () => {
        const new_point = (point === 0 ? 1 : 0);
        answerCellHandle(new_point,userIndex,questionIndex);
    }
    return(<>
        <TableCell onClick={cell_handle} className={styles.answer_cell}>
            <div className={(point > 0) ? styles.correct_cell : styles.wrong_cell}></div>
            <div className={styles.matharea}><InlineMath math = {String(answer)}/></div>
        </TableCell>
    </>)
}

export default function GradingPage({ params }: { params: { testid: number } }) {
    const [ testData, setTestData ] = useState<TestData | null>(null);
    const [ submissionData, setSubmissionData ] = useState<Submission[]>([]);
    const submissionData_buf: Array<Submission> = [];
    const { data: session, status } = useSession();
    const [ classID, setClassID ] = useState(0);
    const [sectionValue, setSectionValue] = useState(0);
    const [points, setPoints] = useState<Record<number, Record<number, number>>>({});

//#region イベントハンドラ
    const sectionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
        setSectionValue(newValue);
    };

    const answerCellHandle = (newPoint:number, userIndex:number,questionIndex: number) => {
        setPoints(prevPoints => ({
            ...prevPoints,
            [userIndex]: {
                ...prevPoints[userIndex],
                [questionIndex]: newPoint
            }
        }));
    }

    const savebuttonHandle = async(e:any) => {
        let send_data: Array<Point> = [];
        submissionData.map((submission,userIndex) => {
            submission.answers.map((answer,answerIndex) => {
                const userPoints = points[userIndex];
                const newPoint = userPoints ? userPoints[answerIndex] || 0 : 0;
                send_data.push({answerId:Number(answer.id),point:newPoint});
            });
        });
        console.log("SEND DATA")
        console.log(send_data);
    }

//#endregion
    
    useEffect(() => {
        if(session)
        {
            console.log("Session");
            console.log(session);
            const fetchTest = async() => {
                const test_res = await getTestById(Number(params.testid),String(session.user.name));
                if(test_res)
                {
                    console.log("getTestById");
                    console.log(test_res);
                    setTestData(test_res);
                    setClassID(Number(test_res.classes.at(0)?.id));

                    console.log("Submissions")
                    test_res.classes.at(0)?.users.map(async(user,index) => {
                        const submission_res = await getSubmission({testId: Number(params.testid),username: user.name});
                        console.log(index + ":" + user.name);
                        console.log(submission_res);
                        if(submission_res)
                        {
                            submissionData_buf.push({id:Number(submission_res?.id),studentId:Number(submission_res?.studentId),answers:submission_res.answers});
                        }
                        if(index+1 == test_res.classes.at(0)?.users.length)
                        {
                            setSubmissionData(submissionData_buf);
                        }
                    });
                }
            }
            fetchTest();
        }
        Style();
    }, [status]);

    return (
    <>
        {/*==========ヘッダエリア==========*/}
        <Paper sx={{ borderRadius: 0, width: "100%"}}>
            <Box sx={{pt:2,pr:2,pb:1}}>
                <Box display="flex">
                    <Typography variant="h4" sx={{ml:2}}>
                        {testData?.title}
                    </Typography>
                    <Box width="100%" justifyContent="right">
                        <Typography  textAlign="right">
                            Class ID: {classID}
                        </Typography>
                        <Typography  textAlign="right">
                            Test ID: {params.testid}
                        </Typography>
                    </Box>

                </Box>
                <hr/>
                <Typography variant="h6" sx={{ml:2}}>
                        {testData?.summary}
                </Typography> 
            </Box>
        </Paper>
        
        <Container maxWidth={false} sx={{mb:1}}>
            {/*==========ここからTableエリア==========*/}
            <Paper sx={{m:1, mr:0, ml:0}}>
                {
                    (testData != null) ?  (<SectionTabs sections={testData.sections} sectionValue={sectionValue} sectionHandleChange = {sectionHandleChange}/>) : (<p>Loading...</p>)
                }
                <TableContainer component={Paper}>
                    <Table>
                        {/*==========Tableヘッダセル==========*/}
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                { //表のヘッダ Questionの問題と解を表示する
                                
                                    testData?.sections.at(sectionValue)?.questions.map((question : Question,index)=>
                                        <TableCell key={"question"+index}>
                                            { question.question }
                                            <hr/>
                                            { question.answer }
                                        </TableCell>
                                    )
                                }
                            </TableRow>
                        </TableHead>
                        {/*==========以下データセル==========*/}
                        <TableBody>
                            {
                                testData?.classes.at(0)?.users.map((user : User,user_index) => 
                                    <TableRow key={"ROW"+user_index}>
                                        <TableCell key={"username" + user_index} className={styles.name_cell}>{user.name}</TableCell>
                                        {
                                            (function () {
                                                let start = 0;
                                                const cells = [];
                                                for(let i = 0; i < sectionValue;i++) //現在のセクションの前にある問題数を数える
                                                {
                                                    start += Number(testData.sections.at(i)?.questions.length);
                                                }

                                                //現在のセクションの問題を表示する
                                                for(let question_index = start;question_index < start + Number(testData.sections.at(sectionValue)?.questions.length);question_index++)
                                                {
                                                    let answer  = submissionData.at(user_index)?.answers.at(question_index);
                                                    if(answer != undefined)
                                                    {
                                                        const currentPoint = points[user_index]?.[question_index] || Number(answer.point);
                                                        cells.push(
                                                            <AnswerCell answer={answer.text}
                                                                        point={currentPoint}
                                                                        answerCellHandle={answerCellHandle}
                                                                        key={user.id + "-" + answer.questionId}
                                                                        userIndex={user_index}
                                                                        questionIndex={question_index}>
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
                testData ? <Button variant="contained" sx={{mb:1, mt:0}} className={styles.save_button} onClick={savebuttonHandle}>Save</Button>: <></>
            }                
        </Container>
    </>
    );
}
