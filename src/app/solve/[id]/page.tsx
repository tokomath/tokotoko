"use client";
import { useEffect, useState } from "react";
import { Box, Button, Link, Paper, TextField, Typography, styled } from "@mui/material";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';

export default function Solve({ params }: { params: { id: string } }) {

  const [answer, setAnswer] = useState<string>("");

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
    <main>
      <Stack
        spacing={2} maxWidth={640} paddingTop={2} margin="auto"
      >
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box padding={2}>
            <Typography fontFamily="monospace">問題ID:{params.id}</Typography>
            <Typography variant="h1" fontSize={30}>課題1</Typography>
            <Typography>積分の問題です</Typography>
          </Box>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box padding={2}>
            <Stack spacing={1}>
              <Typography variant="h2" fontSize={20}>問題 1</Typography>
              <Box display="flex">
                <BlockMath> \int_0^\infty x^2 dx</BlockMath>
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
                  onChange={(e) => { setAnswer(e.target.value) }}
                />
              </Box >
              <Button variant="outlined" onClick={() => setAnswer(answer + "\\int")}>
                <InlineMath math="\int"></InlineMath>
              </Button>
              <Button variant="outlined" onClick={() => setAnswer(answer + "\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}")}>
                <InlineMath math="\begin{pmatrix}a & b \\\\ c & d \end{pmatrix}"></InlineMath>
              </Button>
              <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener">
                KaTeXチートシート
              </Link>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </main >
  )
}