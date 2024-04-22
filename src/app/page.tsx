"use client"

import Button from '@mui/material/Button';
import {Stack} from "@mui/system";

import {deleteTest, testSend} from "@/app/_prisma/testTest"

export default function Home() {
    const send = () => {
        testSend();
    }


    return (
        <Stack>
            <button
                onClick={testSend}
            >
                send
            </button>
            <button
                onClick={deleteTest}
            >
                delete
            </button>
        </Stack>
    );
}
