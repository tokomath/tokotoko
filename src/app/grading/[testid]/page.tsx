"use client";
import React, { Component, ReactElement, ReactNode, useEffect, useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import { useSession } from 'next-auth/react';

import { getTestById } from "@/app/api/test/getTestById";
import { getSubmission } from "@/app/api/test/result"



//#region APIのデータ用
interface User {
    id: Number;
    name: String;
    pass: String;
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

//#region Section,Questionのタブ
interface QuestionTabProps {
    questions: Question[];
    SectionIndex: number;
}

interface SectionTabProps {
    sections: Section[];
}

function QuestionTabs({ questions, SectionIndex}: QuestionTabProps) {
    const [questionValue, questionSetValue] = useState(0);

    const questionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
        questionSetValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={questionValue} onChange={questionHandleChange} aria-label="subsection tabs" variant="fullWidth">
                    {questions.map((question, index) => (
                        <Tab label={"Q" + question.number} key={index} {...a11yProps(SectionIndex)} />
                    ))}
                </Tabs>
            </Box>
            {questions.map((question, index) => (
                <CustomTabPanel value={questionValue} index={index} key={index}>
                    <InlineMath math={question.question}/>
                </CustomTabPanel>
            ))}
        </Box>
    );
}

function SectionTabs({sections} : SectionTabProps)
{
    const [sectionValue, sectionSetValue] = useState(0);
    const sectionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
         sectionSetValue(newValue);
    };

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
                        <QuestionTabs questions={section.questions} SectionIndex={index} />
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
    const[ classID, setClassID ] = useState(0);

    
    
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

                    console.log("SUBMISSION")
                    const res = await getSubmission({testId: Number(params.testid), username: String(test_res.classes.at(0)?.users.at(0)?.name)});
                    if(res)
                    {
                        console.log(1);
                        console.log(res)
                    }
                    

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
                    (testData != null) ?  (<SectionTabs sections={testData.sections}/>) : (<p>Loading...</p>)
                }
            </Box>
        </Paper>
        </>
    );
}
