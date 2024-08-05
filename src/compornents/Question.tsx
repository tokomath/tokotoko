"use client";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { InlineMath, BlockMath } from "react-katex";
import Stack from '@mui/material/Stack';
import Latex from "react-latex-next";
import React, { useEffect } from "react";
import 'katex/dist/katex.min.css';

interface QuestionProps {
  id: string;
  number: string;
  question: string;
  answer: string;
  changeAnswer: (answer: string) => void;
}

export default function Question({ id, number, question, answer, changeAnswer }: QuestionProps) {
  const inputRef = React.useRef<HTMLInputElement>();

  const [selectionStart, setSelectionStart] = React.useState(0);
  const [selectionEnd, setSelectionEnd] = React.useState(0);

  const [cur, setCur] = React.useState(true);
  const [isFirstRender, setIsFirstRender] = React.useState(true);


  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
    else if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
      updateSelection();
    }
  }, [cur]);

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

  const updateSelection = () => {
    if (inputRef.current) {
      setSelectionStart(inputRef.current.selectionStart as number);
      setSelectionEnd(inputRef.current.selectionEnd as number);
    } else {
      setSelectionStart(answer.length);
      setSelectionEnd(answer.length);
    }
  }

  const AnswerBox = () => {
    if (answer) {
      return (
        <BlockMath>{answer}</BlockMath>
      )
    } else {
      return (
        <BlockMath>?</BlockMath>
      )
    }
  }

  return (

    <Stack spacing={2}>
      {/* 横に並べる */}
      <Box display="flex" alignItems="center">
        <Typography variant="h2" fontSize={17}>({number})　</Typography>
        <Latex>{question}</Latex>
      </Box>
      <Box
        display="flex"
        minHeight={80}
        alignItems="center"
      >
        <AnswerBox />
      </Box>

      <TextField
        placeholder="Answer"
        hiddenLabel
        fullWidth
        size="small"
        variant="filled"
        multiline
        spellCheck="false"
        value={answer}
        inputProps={{ style: { fontFamily: "monospace", fontSize: 17 } }}
        inputRef={inputRef}
        onChange={(e) => {
          changeAnswer(e.target.value)
          updateSelection()
        }}
        onSelect={() => {
          updateSelection()
        }}
        onClick={() => {
          updateSelection()
        }}
        onTouchEnd={() => {
          updateSelection()
        }}
      />
      <Stack display="flex" flexWrap="wrap" direction="row">
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => { insertCommand("\\") }}>
          \
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("()", 1, 1)}>
          {"( )"}
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("{}", 1, 1)}>
          {"{ }"}
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("=")}>
          <InlineMath math="="></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("+")}>
          <InlineMath math="+"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("-")}>
          <InlineMath math="-"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\times")}>
          <InlineMath math="\times"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\frac{a}{b}", 6, 7)}>
          <InlineMath math="\frac{a}{b}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\sqrt{a}", 6, 7)}>
          <InlineMath math="\sqrt{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\vec{a}", 5, 6)}>
          <InlineMath math="\vec{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("^{a}", 2, 3)}>
          <InlineMath math="□^{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\sin{a}", 5, 6)}>
          <InlineMath math="\sin{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\cos{a}", 5, 6)}>
          <InlineMath math="\cos{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\tan{a}", 5, 6)}>
          <InlineMath math="\tan{a}"></InlineMath>
        </Button>
        <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\pi")}>
          <InlineMath math="\pi"></InlineMath>
        </Button>
      </Stack>
    </Stack >

  )
}


// <Button variant="outlined" onClick={() => insertCommand("\\int")}>
//           <InlineMath math="\int"></InlineMath>
//         </Button>
//         <Button variant="outlined" onClick={() => insertCommand("\\int_{a}^{b}", 6, 7)}>
//           <InlineMath math="\int_{a}^{b}"></InlineMath>
//         </Button>
//         <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}", 18, 19)}>
//           <InlineMath math="\begin{vmatrix}a & b \\\\ c & d \end{vmatrix}"></InlineMath>
//         </Button>
//         <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}", 18, 19)}>
//           <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
//         </Button>
//         <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => insertCommand("\\sum_{i=1}^{n}")}>
//           <InlineMath math="\sum_{i=1}^{n}"></InlineMath>
//         </Button>