"use client";
import { Box, Button, IconButton } from "@mui/material";
import { InlineMath } from "react-katex";
import Stack from '@mui/material/Stack';
import React, { useEffect } from "react";
import 'katex/dist/katex.min.css';
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface AuxiliaryButtonsProps {
  answer: string;
  changeAnswer: (answer: string) => void;

  selectionStart: number;
  setSelectionStart: (start: number) => void;
  selectionEnd: number;
  setSelectionEnd: (end: number) => void;

  cur: boolean;
  setCur: (cur: boolean) => void;
}

export default function AuxiliaryButtons({ answer, changeAnswer, selectionStart, setSelectionStart, selectionEnd, setSelectionEnd, cur, setCur }: AuxiliaryButtonsProps) {

  const insertCommand = (
    command: string,
    start: number = command.length,
    end: number = command.length) => {

    const before = answer.slice(0, selectionStart);
    const after = answer.slice(selectionEnd);
    changeAnswer(before + command + after);
    setSelectionStart(selectionStart + start);
    setSelectionEnd(selectionStart + end);
    setCur(!cur);
  }

  return (

    <Stack spacing={0}>

      <Box sx={{ paddingTop: 0.5, paddingBottom: 0.5, width: "100%" }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <IconButton aria-label="move left" onClick={
            () => {
              if (selectionStart != selectionEnd) {
                setSelectionStart(selectionStart);
                setSelectionEnd(selectionStart);
              } else if (selectionStart == 0) {
              } else {
                setSelectionStart(selectionStart - 1);
                setSelectionEnd(selectionStart - 1);
              }
              setCur(!cur);
            }}>
            <ArrowBack />
          </IconButton>
          <Box display="flex">
            <Button variant="outlined" sx={{ textTransform: 'none', width: 10, whiteSpace: 'nowrap' }} onClick={() => { insertCommand("\\") }}>
              \
            </Button>
            <Button variant="outlined" sx={{ textTransform: 'none', width: 10, whiteSpace: 'nowrap' }} onClick={() => insertCommand("{}", 1, 1)}>
              {"{ }"}
            </Button>
            <Button variant="outlined" sx={{ textTransform: 'none', width: 10, whiteSpace: 'nowrap' }} onClick={() => insertCommand("()", 1, 1)}>
              {"( )"}
            </Button>
            <Button variant="outlined" sx={{ textTransform: 'none', width: 10, whiteSpace: 'nowrap' }} onClick={() => insertCommand(",")}>
              {","}
            </Button>
          </Box>
          <IconButton aria-label="move right" onClick={
            () => {
              if (selectionStart != selectionEnd) {
                setSelectionStart(selectionEnd);
                setSelectionEnd(selectionEnd);
              } else if (selectionStart == answer.length) {
              } else {
                setSelectionStart(selectionStart + 1);
                setSelectionEnd(selectionStart + 1);
              }
              setCur(!cur);
            }}>
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowX: "scroll" }}>
        <Box sx={{ display: 'flex', paddingBottom: 1.5 }}>
          <Box display="flex">
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("+")}>
                <InlineMath math="+"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("=")}>
                <InlineMath math="="></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\geqq")}>
                <InlineMath math="\geqq"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\leqq")}>
                <InlineMath math="\leqq"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("-")}>
                <InlineMath math="-"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\times")}>
                <InlineMath math="\times"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\pm ")}>
                <InlineMath math="\pm"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\pi")}>
                <InlineMath math="\pi"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\frac{a}{b}", 6, 7)}>
                <InlineMath math="\frac{a}{b}"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\sqrt{a}", 6, 7)}>
                <InlineMath math="\sqrt{a}"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\vec{a}", 5, 6)}>
                <InlineMath math="\vec{a}"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("^{a}", 2, 3)}>
                <InlineMath math="□^{a}"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\log{a}", 5, 6)}>
                <InlineMath math="\log{a}"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\log_{a}{b}", 6, 7)}>
                <InlineMath math="\log_{a}{b}"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\sin{a}", 5, 6)}>
                <InlineMath math="\sin{a}"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\cos{a}", 5, 6)}>
                <InlineMath math="\cos{a}"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\tan{a}", 5, 6)}>
                <InlineMath math="\tan{a}"></InlineMath>
              </Button>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\sum_{i=1}^{n}")}>
                <InlineMath math="\sum_{i=1}^{n}"></InlineMath>
              </Button>
            </Stack>
            <Stack>
              <Button variant="outlined" sx={{ textTransform: 'none', width: 15, whiteSpace: 'nowrap' }} onClick={() => insertCommand("\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}", 18, 19)}>
                <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Stack >

  )
}