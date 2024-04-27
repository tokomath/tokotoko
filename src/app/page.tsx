"use client"
import {Button} from '@mui/material';
import {Stack} from "@mui/system";
import {Test, TestFormLevel} from "@prisma/client";
import {useState} from "react";
import {Unstable_NumberInput as NumberInput} from "@mui/base/Unstable_NumberInput";

export default function Home() {
    const [num, setNum] = useState<number | null>();
    const send = async () => {
        const url = '/api/createTest'
        const test: Test = {
            id: 1,
            summary: 'test',
        }

        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(test),
        };

        await fetch(url, params);
    }
    const remove = async () => {
        const url = '/api/removeTest'
        const test = {
            id: num,
        }

        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(test),
        };

        await fetch(url, params);
    }


    return (
        <Stack>
            <Button
                onClick={send}
            >
                send
            </Button>
            <Button
                onClick={remove}
            >
                remove
            </Button>
            <NumberInput
                aria-label="remove"
                placeholder="Type a number…"
                value={num}
                onChange={(_, val) => setNum(val)}
            />
        </Stack>
    );
}
