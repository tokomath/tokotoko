"use client";
import { useEffect, useState } from "react";
import { Box, Link, TextField, Typography } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';

export default function Solve() {

    let [answer, setAnswer] = useState();

    function AnswerBox() {
        if (answer) {
            return (
                <InlineMath math={answer} />
            )
        } else {
            return (
                <InlineMath>?</InlineMath>

            )
        }
    }

    return (
        <main>
            <Stack spacing={2}>
                <Box>
                    <InlineMath>\int_0^\infty x^2 dx</InlineMath>
                </Box>
                <Box
                    display="flex"
                    minHeight={40}
                    alignItems="center"
                >
                    <AnswerBox />
                </Box>
                <Box>
                    <TextField
                        hiddenLabel
                        helperText="回答をKaTeXで入力"
                        fullWidth
                        size="small"
                        variant="filled"
                        multiline
                        inputProps={{ style: { fontFamily: "monospace" }, className: "language-typescript" }}
                        onChange={(e) => { setAnswer(e.target.value) }}
                    />
                </Box >
                <Link href="https://katex.org/docs/supported.html" target="_blank" rel="noopener">
                    KaTeXチートシート
                </Link>
            </Stack>
        </main >
    )
}