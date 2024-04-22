"use client";
import { TextField } from "@mui/material";
import { InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import { useState } from "react";

export default function Solve() {
    let [answer, setAnswer] = useState("\\frac{1}{2}");

    return (
        <main>
            <div>
                <InlineMath>\int_0^\infty x^2 dx</InlineMath>
            </div>

            <div>
                <TextField
                    hiddenLabel
                    id="filled-hidden-label-normal"
                    fullWidth
                    onChange={(e) => { setAnswer(e.target.value) }}
                />
            </div>

            <div>
                <InlineMath>{answer}</InlineMath>
            </div>
        </main >

    )
}