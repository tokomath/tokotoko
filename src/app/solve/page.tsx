"use client";
import { useEffect, useState } from "react";
import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';

export default function Solve() {

    let [answer, setAnswer] = useState<string>();

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
            <Stack spacing={2}>

                <Box
                    display="flex"
                >
                    <BlockMath> \int_0^\infty x^2 dx</BlockMath>
                </Box>
                <Box
                    display="flex"
                    minHeight={70}
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
                        value={answer}
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