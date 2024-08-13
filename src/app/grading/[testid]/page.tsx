"use client";
import React, { Component, ReactElement, ReactNode, useEffect, useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import { useSession } from 'next-auth/react';
import { getTestById } from "@/app/api/test/getTestById";


//#region APIのデータ用
interface Question {
    id: number;
    subSectionId: number;
    number: number;
    question: string;
    answer: string;
}

interface SubSection {
    id: number;
    number: number;
    sectionId: number;
    summary: string;
    questions: Question[];
}

interface Section {
    id: number;
    number: number;
    summary: string;
    subSections: SubSection[];
}

interface TestData {
    id: number;
    title: string;
    summary: string;
    startDate: Date;
    endDate: Date;
    sections: Section[];
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

//#region Section,SubSection,Questionのタブ
interface QuestionTabProps {
    questions: Question[];
    sectionIndex: number;
    subSectionIndex: number;
}
interface SubSectionTabProps {
    subSections: SubSection[];
    sectionIndex: number;
}

interface SectionTabProps {
    sections: Section[];
}

function QuestionTabs({ questions, sectionIndex,subSectionIndex }: QuestionTabProps) {
    const [questionValue, questionSetValue] = useState(0);

    const questionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
        questionSetValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={questionValue} onChange={questionHandleChange} aria-label="subsection tabs" variant="fullWidth">
                    {questions.map((question, index) => (
                        <Tab label={"Q" + question.number} key={index} {...a11yProps(sectionIndex,subSectionIndex,index)} />
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

function SubSectionTabs({ subSections, sectionIndex }: SubSectionTabProps) {
    const [subsectionValue, subsectionSetValue] = useState(0);
    const subsectionHandleChange = (event: React.SyntheticEvent, newValue: number) => {
        subsectionSetValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={subsectionValue} onChange={subsectionHandleChange} aria-label="subsection tabs" variant="fullWidth">
                    {
                        subSections.map((subsection, index) => (
                            <Tab label={"§§" + subsection.number} key={index} {...a11yProps(sectionIndex, index)} />
                        ))
                    }
                </Tabs>
            </Box>
            {
                subSections.map((subsection, index) => (
                    <CustomTabPanel value={subsectionValue} index={index} key={index}>
                        <InlineMath math={subsection.summary} />
                        <QuestionTabs questions={subsection.questions} sectionIndex={sectionIndex} subSectionIndex={index}/>
                    </CustomTabPanel>
                ))
            }
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
                        <SubSectionTabs subSections={section.subSections} sectionIndex={index} />
                    </CustomTabPanel>
                ))
            }
        </Box>
    );
}
//#endregion


export default function Grading({ params }: { params: { testid: number } }) {
    const [testData, setTestData] = useState<TestData | null>(null);
    const { data: session, status } = useSession();
    useEffect(() => {
        const fetchdata = async() => {
            const response = await getTestById(Number(params.testid),String(session?.user?.name));
            if(response)
            {
                console.log("TEST")
                console.log(response);
            }
        }

        fetchdata();
        Style();
    }, []);

    if(session)
    {
        console.log(session);
        console.log(session?.user?.name);   //sessionテスト
    }

    return (
        <Paper>
            <Box sx={{ width: '100%' }}>
                {
                    (testData != null) ?  (<SectionTabs sections={testData.sections}/>) : (<p>Loading...</p>)
                }
            </Box>
        </Paper>
    );
}
