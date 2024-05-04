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

  const [selectionStart1, setSelectionStart1] = React.useState(0);
  const [selectionEnd1, setSelectionEnd1] = React.useState(0);

  const [selectionStart2, setSelectionStart2] = React.useState(0);
  const [selectionEnd2, setSelectionEnd2] = React.useState(0);

  const [cur, setCur] = React.useState(true);
  const [isFirstRender, setIsFirstRender] = React.useState(true);


  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
    else if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(selectionStart2, selectionEnd2);
      updateSelection();
    }
  }, [cur]);

  const insertCommand = (
    command: string,
    start: number = command.length,
    end: number = command.length) => {

    const before = answer.slice(0, selectionStart1);
    const after = answer.slice(selectionEnd1);
    changeAnswer(before + command + after);
    setSelectionStart2(selectionStart1 + start);
    setSelectionEnd2(selectionStart1 + end);
    setCur(!cur);
  }

  const updateSelection = () => {
    if (inputRef.current) {
      console.log(inputRef.current.selectionStart, "→", inputRef.current.selectionEnd);
      setSelectionStart1(inputRef.current.selectionStart as number);
      setSelectionEnd1(inputRef.current.selectionEnd as number);
    } else {
      console.log("updateSelection inputRef.current is null");
      setSelectionStart1(answer.length);
      setSelectionEnd1(answer.length);
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
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      {selectionStart1}→{selectionEnd1}　{selectionStart2}→{selectionEnd2}　{inputRef.current?.selectionStart}→{inputRef.current?.selectionEnd}
      <Box padding={2}>
        <Stack spacing={2}>
          <Typography variant="h2" fontSize={17}>{number}:</Typography>
          <Box display="flex">
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
              console.log("onChange");
              changeAnswer(e.target.value)
              updateSelection()
            }}
            onSelect={() => {
              console.log("onSelect");
              updateSelection()
            }}
            onClick={() => {
              console.log("onClick");
              updateSelection()
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => { insertCommand("\\") }}>
              \
            </Button>
            <Button variant="outlined" onClick={() => insertCommand("\\frac{a}{b}", 6, 7)}>
              <InlineMath math="\frac{a}{b}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => insertCommand("\\int")}>
              <InlineMath math="\int"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => insertCommand("\\int_{a}^{b}", 6, 7)}>
              <InlineMath math="\int_{a}^{b}"></InlineMath>
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} display="flex">
            <Button variant="outlined" onClick={() => insertCommand("\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}", 18, 19)}>
              <InlineMath math="\begin{vmatrix}a & b \\\\ c & d \end{vmatrix}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => insertCommand("\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}", 18, 19)}>
              <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => insertCommand("\\sum_{i=1}^{n}")}>
              <InlineMath math="\sum_{i=1}^{n}"></InlineMath>
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}