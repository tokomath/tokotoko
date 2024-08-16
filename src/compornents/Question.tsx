"use client";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import { BlockMath } from "react-katex";
import Stack from '@mui/material/Stack';
import Latex from "react-latex-next";
import React, { useEffect } from "react";
import 'katex/dist/katex.min.css';
import { Clear } from "@mui/icons-material";
import { red } from "@mui/material/colors";
import AuxiliaryButtons from "./AuxiliaryButtons";

interface QuestionProps {
  id: string;
  number: string;
  question: string;
  answer: string;
  changeAnswer: (answer: string) => void;
}

export default function Question({ id, number, question, answer, changeAnswer }: QuestionProps) {
  const inputRef = React.useRef<HTMLInputElement>();

  // カーソルを移動させるときは、　setSelectionStart, setSelectionEnd で場所を指定後、 setCur(!cur) でトリガーを発火する
  // テキストフィールドの選択範囲
  const [selectionStart, setSelectionStart] = React.useState(0);
  const [selectionEnd, setSelectionEnd] = React.useState(0);
  // カーソルを移動させるためのトリガー
  const [cur, setCur] = React.useState(true);
  const [isFirstRender, setIsFirstRender] = React.useState(true);

  // テキストフィールドにフォーカスがあるかどうか
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    } else if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
      updateSelection();
    }
  }, [cur]);

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

    <Stack spacing={0}>
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
        <IconButton aria-label="clear" sx={{ ml: 'auto' }} onClick={() => changeAnswer("")}>
          <Clear sx={{ color: red[700] }} />
        </IconButton>
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
          setIsFocused(true);
          updateSelection()
        }}
        onClick={() => {
          updateSelection()
        }}
        onTouchEnd={() => {
          updateSelection()
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
      />

      <Buttons />

    </Stack >

  )

  function Buttons() {
    if (isFocused) {
      return (
        <AuxiliaryButtons
          answer={answer}
          changeAnswer={changeAnswer}
          selectionStart={selectionStart}
          setSelectionStart={setSelectionStart}
          selectionEnd={selectionEnd}
          setSelectionEnd={setSelectionEnd}
          cur={cur}
          setCur={setCur} />
      )
    }
  }
}