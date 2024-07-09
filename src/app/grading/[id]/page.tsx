"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { Box,Paper,Tab,Tabs,Typography, } from "@mui/material";
import { InlineMath } from "react-katex";
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';
import axios, { AxiosResponse } from "axios";

//#region interface宣言
//#region APIのデータ用
interface Question
{
    id: number;
    subSectionId: number;
    number: number;
    question: string;
    answer: string;
}

interface SubSection
{
    id: number;
    number: number;
    sectionId: number;
    summary: string;
    questions: Question[];
}

interface Section
{
    id: number;
    number: number;
    summary: string;
    subSections: SubSection[];
}

interface TestData
{
    id : number;
    title: string;
    summary: string;
    startDate: Date;
    endDate: Date;
    sections: Section[];
}
//#endregion

interface TabPanelProps
{
    children?: ReactNode;
    index: number;
    value: number;
}
//#endregion

//このへんほぼmuiサンプルのコピペ（仕方ない）
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }
  

function TabPanelArea()
{
    const [value0, setValue0] = React.useState(0);
    const handleChange0 = (event: React.SyntheticEvent, newValue: number) => {
      setValue0(newValue);
    };

    const [value1, setValue1] = React.useState(0);
    const handleChange1 = (event: React.SyntheticEvent, newValue: number) => {
      setValue1(newValue);
    };
    

    return(
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}>
        <Tabs orientation="vertical" variant="scrollable" value={value0} onChange={handleChange0} aria-label="問">
            <Tab label="1" {...a11yProps(0)}/>
            <Tab label="2" {...a11yProps(1)}/>
            <Tab label="3"{ ...a11yProps(2)}/>
        </Tabs>
        <TabPanel value={value0} index={0}>
            <Tabs orientation="vertical" variant="scrollable" value={value1} onChange={handleChange1} aria-label="問">
                <Tab label="1" {...a11yProps(0)}/>
                <Tab label="2" {...a11yProps(1)}/>
                <Tab label="3"{ ...a11yProps(2)}/>
            </Tabs>
            <TabPanel value={value0} index={0}>
            </TabPanel>
            <TabPanel value={value0} index={1}>
            </TabPanel>
            <TabPanel value={value0} index={2}>
            </TabPanel>
        </TabPanel>
        <TabPanel value={value0} index={1}>
            Two
        </TabPanel>
        <TabPanel value={value0} index={2}>
            Three
        </TabPanel>
    </Box>
    );
}


export default function Grading({ params }: { params: { id: number } })
{
    const [test_data,set_test_data] = useState<TestData|null>(null);

    useEffect(()=>
    {
        axios.post("/api/test/get",{ id: Number(params.id)})
        .then(response =>{
            set_test_data(response.data);
        });
    },[])

    
    //console.log(test);
    return (
        <>
        <Paper>
            {TabPanelArea()}
        </Paper>
        </>
    )
}