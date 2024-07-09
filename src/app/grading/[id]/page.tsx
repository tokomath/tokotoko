"use client";
import React, { useEffect, useState } from "react";
import { Paper,Typography } from "@mui/material";
import { Table,TableContainer, TableBody, TableHead, TableRow,TableCell } from "@mui/material";
import { InlineMath } from "react-katex";
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';
import axios, { AxiosResponse } from "axios";
import { error } from "console";

//#region interface宣言
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

        </Paper>
        </>
    )
}