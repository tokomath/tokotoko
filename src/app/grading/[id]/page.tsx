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
    
    let rows = [
        createStudentAnsData("Sample Guy1",student_answers),
        createStudentAnsData("Sample Guy2",student_answers),
        createStudentAnsData("Sample Guy3",student_answers),
        createStudentAnsData("Sample Guy4",student_answers),
        createStudentAnsData("Sample Guy5",student_answers),
        createStudentAnsData("Sample Guy6",student_answers),
        createStudentAnsData("Sample Guy7",student_answers),
        createStudentAnsData("Sample Guy8",student_answers),
        createStudentAnsData("Sample Guy9",student_answers),
        createStudentAnsData("Sample Guy10",student_answers),
        createStudentAnsData("Sample Guy11",student_answers),
        createStudentAnsData("Sample Guy12",student_answers),
        createStudentAnsData("Sample Guy13",student_answers),
        createStudentAnsData("Sample Guy14",student_answers),
        createStudentAnsData("Sample Guy15",student_answers),
        createStudentAnsData("Sample Guy16",student_answers),
        createStudentAnsData("Sample Guy17",student_answers),
        createStudentAnsData("Sample Guy18",student_answers),
        createStudentAnsData("Sample Guy19",student_answers),
        createStudentAnsData("Sample Guy20",student_answers),
        createStudentAnsData("Sample Guy21",student_answers),
        createStudentAnsData("Sample Guy22",student_answers),
        createStudentAnsData("Sample Guy23",student_answers),
        createStudentAnsData("Sample Guy24",student_answers),
        createStudentAnsData("Sample Guy25",student_answers),
        createStudentAnsData("Sample Guy26",student_answers),
        createStudentAnsData("Sample Guy27",student_answers),
        createStudentAnsData("Sample Guy28",student_answers),
        createStudentAnsData("Sample Guy29",student_answers),
        createStudentAnsData("Sample Guy30",student_answers),
        createStudentAnsData("Sample Guy31",student_answers),
        createStudentAnsData("Sample Guy32",student_answers),
        createStudentAnsData("Sample Guy33",student_answers),
        createStudentAnsData("Sample Guy34",student_answers),
        createStudentAnsData("Sample Guy35",student_answers),
        createStudentAnsData("Sample Guy36",student_answers),
        createStudentAnsData("Sample Guy37",student_answers),
        createStudentAnsData("Sample Guy38",student_answers),
        createStudentAnsData("Sample Guy39",student_answers),
        createStudentAnsData("Sample Guy40",student_answers),
    ];

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