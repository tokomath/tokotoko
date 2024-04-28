"use client";
import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';

interface QuestionProps {
  id: string;
  number: string;
  question: string;
  answer: string;
  changeAnswer: (answer: string) => void;
}

export default function Question({ id, number, question, answer, changeAnswer }: QuestionProps) {

  function AnswerBox() {
    if (answer) {
      return (
        <BlockMath math={answer} />
      )
    } else {
      return (
        <BlockMath math={"?"} />
      )
    }
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      <Box padding={2}>
        <Stack spacing={1}>
          <Typography variant="h2" fontSize={20}>{number}</Typography>
          <Box display="flex">
            <BlockMath>{question}</BlockMath>
          </Box>
          <Box
            display="flex"
            minHeight={80}
            alignItems="center"
          >
            <AnswerBox />
          </Box>
          <Box>
            <TextField
              hiddenLabel
              helperText="回答をKaTeXで入力 改行可能"
              fullWidth
              size="small"
              variant="filled"
              multiline
              value={answer}
              inputProps={{ style: { fontFamily: "monospace" } }}
              onChange={(e) => { changeAnswer(e.target.value) }}
            />
          </Box >
          <Button variant="outlined" onClick={() => changeAnswer(answer + "\\int")}>
            <InlineMath math="\int"></InlineMath>
          </Button>
          <Button variant="outlined" onClick={() => changeAnswer(answer + "\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}")}>
            <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}