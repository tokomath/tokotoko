"use client";
import React, { Component, ReactElement, ReactNode, useEffect, useState } from "react";
import { Box, Paper, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import { useSession } from 'next-auth/react';

import { getTestById } from "@/app/api/test/getTestById";
import { getSubmission } from "@/app/api/test/result"



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
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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


export default function GradingPage({ params }: { params: { testid: number } }) {
    const [ testData, setTestData ] = useState<TestData | null>(null);
    const { data: session, status } = useSession();
    const [ classID, setClassID ] = useState(0);
    const [sectionValue, setSectionValue] = useState(0);  // Sectionの状態を管理

    const sectionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
        setSectionValue(newValue);
    };

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
                    });
                    
                }
            }
            fetchTest();
        }
        Style();
    }, [status]);

    return (
        <>
        <span>Class ID : {classID}</span>
        <span>Test ID : { params.testid }</span>
        <Paper>
            <Box sx={{ width: '100%' }}>
                {
                    (testData != null) ?  (<SectionTabs sections={testData.sections} sectionValue={sectionValue} sectionHandleChange = {sectionHandleChange}/>) : (<p>Loading...</p>)
                }
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            {
                                testData?.sections.at(sectionValue)?.questions.map((question)=>
                                    <>
                                    <TableCell>{question.question}</TableCell>
                                    </>
                                )
                            }

                        </TableRow>
                    </TableHead>
                    {/*=================================================*/}
                    <TableBody>
                            
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
        </>
    );
}
