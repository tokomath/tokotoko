import { Box, Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import { InlineMath } from "react-katex";
import Stack from '@mui/material/Stack';
import React, { useEffect } from "react";
import 'katex/dist/katex.min.css';
import { ArrowBack, ArrowForward, Clear } from "@mui/icons-material";
import { red } from "@mui/material/colors";

import InsertFrame from "@/compornents/InsertFrame"
import LaTeXViewer from "@/compornents/LaTeXViewer";
import { msg } from "@/msg-ja";

interface QuestionProps {
  id: string;
  number: string;
  question: string;
  insertType: string;
  insertContent: string;
  answer: string;
  changeAnswer: (answer: string) => void;
}

export default function Question({ id, number, question, answer, insertType, insertContent, changeAnswer }: QuestionProps) {
  const inputRef = React.useRef<HTMLInputElement>();

  const [selectionStart, setSelectionStart] = React.useState(0);
  const [selectionEnd, setSelectionEnd] = React.useState(0);

  const [cur, setCur] = React.useState(true);
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  const [showKeyboard, setShowKeyboard] = React.useState(false);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    } else if (inputRef.current) {
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

    const dollarCount = (before.match(/\$/g) || []).length;
    const isInsideMath = dollarCount % 2 === 1;

    let textToInsert = command;
    let newCursorOffsetStart = start;
    let newCursorOffsetEnd = end;

    if (!isInsideMath) {
      textToInsert = `$${command}$`;
      newCursorOffsetStart += 1;
      newCursorOffsetEnd += 1;
    }

    changeAnswer(before + textToInsert + after);
    setSelectionStart(selectionStart + newCursorOffsetStart);
    setSelectionEnd(selectionStart + newCursorOffsetEnd);
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
        <LaTeXViewer>{answer}</LaTeXViewer>
      )
    } else {
      return (
        <LaTeXViewer>$?$</LaTeXViewer>
      )
    }
  }

  const handleFocus = () => {
    setShowKeyboard(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowKeyboard(false);
    }
  };

  return (

    <Stack spacing={0}>
      <Box display="flex" alignItems="center">
        <Typography variant="h2" fontSize={17}>({number})　</Typography>
        <LaTeXViewer>{question}</LaTeXViewer>
      </Box>
      <Box>
        <InsertFrame insertType={insertType} insertContent={insertContent} />
      </Box>
      
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          my: 1.5,
          display: 'flex',
          flexDirection: 'column',
          borderColor: 'rgba(0, 0, 0, 0.23)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {msg.PREVIEW}
          </Typography>
          <IconButton aria-label="clear" size="small" sx={{ mt: -1, mr: -1 }} onClick={() => changeAnswer("")}>
            <Clear sx={{ color: red[700] }} fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ minHeight: 40, overflowX: 'auto' }}>
          <AnswerBox />
        </Box>
      </Paper>

      <Box onFocus={handleFocus} onBlur={handleBlur}>
        <TextField
          placeholder={msg.ENTER_ANSWER}
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

        {showKeyboard && (
          <>
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
          </>
        )}
      </Box>
    </Stack >

  )
}