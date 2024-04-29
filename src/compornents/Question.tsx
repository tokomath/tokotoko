"use client";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Latex from "react-latex-next";

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
            value={answer}
            inputProps={{ style: { fontFamily: "monospace", fontSize: 17 } }}
            onChange={(e) => { changeAnswer(e.target.value) }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => { changeAnswer(answer + "\\") }}>
              \
            </Button>
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\frac{a}{b}")}>
              <InlineMath math="\frac{a}{b}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\int")}>
              <InlineMath math="\int"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\int_{a}^{b}")}>
              <InlineMath math="\int_{a}^{b}"></InlineMath>
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} display="flex">
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}")}>
              <InlineMath math="\begin{vmatrix}a & b \\\\ c & d \end{vmatrix}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}")}>
              <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
            </Button>
            <Button variant="outlined" onClick={() => changeAnswer(answer + "\\sum_{i=1}^{n}")}>
              <InlineMath math="\sum_{i=1}^{n}"></InlineMath>
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
}