"use client"
import {Button} from '@mui/material';
import {Stack} from "@mui/system";
import {useState} from "react";
import {Unstable_NumberInput as NumberInput} from "@mui/base/Unstable_NumberInput";
import {removeTest, createTest, DeleteTestProps} from "@/app/_api/testAPIs";
import {Question} from "@prisma/client";
import {TestFrame, SectionFrame, SubSubSectionFrame, SubSectionFrame} from "@/app/_api/testAPIs";

export default function Home() {
    const [num, setNum] = useState(0);
    const send = async () => {
        const test: TestFrame = {
            test: {
                id: 1,
                summary: 'test',
            },
            questions: [
                {
                    id: 1,
                    question: 'question',
                    answer: 'answer',
                } as Question
            ],
            sections: [
                {
                    section: {
                        id: 1,
                        summary: 'section',
                    },
                    subSections: [
                        {
                            subSection: {
                                id: 1,
                                summary: 'subSection',
                            },
                            subSubSections: [
                                {
                                    subSubSection: {
                                        id: 1,
                                        summary: 'subSubSection',
                                    },
                                    questions: [
                                        {
                                            id: 1,
                                            question: 'question',
                                            answer: 'answer',
                                        } as Question
                                    ]
                                } as SubSubSectionFrame
                            ],
                            questions: [
                                {
                                    id: 1,
                                    question: 'question',
                                    answer: 'answer',
                                } as Question
                            ]
                        } as SubSectionFrame
                    ],
                    questions: [
                        {
                            id: 1,
                            question: 'question',
                            answer: 'answer',
                        } as Question
                    ]
                } as SectionFrame
            ],
        }
        await createTest(test);
    }

    const remove = async () => {
        const testId: DeleteTestProps = {
            id: num,
        }
        await removeTest(testId);
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
                onChange={(e, n) => {
                    setNum(n ?? 0)
                }}
            />
        </Stack>
    );
}
