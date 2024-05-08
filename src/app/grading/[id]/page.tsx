"use client";
import * as React from "react";
import { Paper,Typography } from "@mui/material";
import { Table,TableContainer, TableBody, TableHead, TableRow,TableCell } from "@mui/material";
import { InlineMath } from "react-katex";
import Latex from "react-latex-next";
import 'katex/dist/katex.min.css';

interface Answer{
    id:string;
    number:string;
    answer:string;
}

interface StudentAnswer{
    name:string;
    answers:Answer[];
}

function createAnsData(id:string,number:string,answer:string)
: Answer{
    return {id,number,answer};
}

function createStudentAnsData(name:string, answers:Answer[])
: StudentAnswer{
    return {name,answers};
}

export default function Grading({ params }: { params: { id: string } })
{
    let assignment = {
        title: "課題1",
        description: "積分の問題です",
    };

    let questions = [
        {
            id: "0",
            number: "Q1",
            question: "$ \\int x^3 dx $ を解け",
          },
          {
            id: "1",
            number: "Q2",
            question: "$ \\int x^4 dx $ を解け",
          },
          {
            id: "2",
            number: "Q3",
            question: "$ \\int x^5 dx $ を解け",
          }
    ];

    let student_answers = [
        createAnsData("0","Q1","$ \\frac{1}{4} x^4$"),
        createAnsData("1","Q2","$ \\frac{1}{5} x^5$"),
        createAnsData("2","Q3","$ \\frac{1}{6} x^6$"),
    ]
    
    let rows = [];
    for(let i = 1;i < 41;i++)
    {
        let data = createStudentAnsData("Sample Guy"+i,student_answers);
        rows.push(data);
    }

    return (
        <>
        <Paper >
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography>問題ID:{params.id}</Typography>
                            <Typography>出席番号</Typography>
                        </TableCell>
                        {
                            questions.map((question, index) => {
                                return (
                                    <TableCell key={"index-header0-${question.id}"}>
                                        {question.number}<br />
                                        <Latex>{question.question}</Latex>
                                    </TableCell>
                                    
                                );
                            })
                        }
                    </TableRow>
                </TableHead>

                <TableBody>
                    {
                        rows.map((row) => {
                            return (
                                <TableRow key="-$rowname-{row.name}">
                                    <TableCell>{row.name}</TableCell>
                                    {
                                        row.answers.map((answer) => {
                                            return (
                                                <TableCell key={answer.id}><Latex>{answer.answer}</Latex></TableCell>
                                            );
                                        })
                                    }
                                </TableRow>
                                );
                        })
                    }
                </TableBody>
            </Table>
        </Paper>
        </>
    )
}