"use client"
import { Button } from '@mui/material';
import { Stack } from "@mui/system";
import { useCallback, useState } from "react";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";
import { removeTest, createTest, DeleteTestProps, getTest } from "@/app/api/testAPIs";
import { Question, Test } from "@prisma/client";
import { TestFrame, SectionFrame, SubSectionFrame } from "@/app/api/testAPIs";
import dayjs from "dayjs";

export default function Home() {
  return (
    <FormControl>

    </FormControl>
  )
  /*
  const [num, setNum] = useState(0);
  const send = async () => {


    const test: TestFrame = {
      test: {
        title: "Hello",
        id: 1,
        summary: 'test',
        endDate: dayjs().toDate(),
      },
      sections: [
        {
          section: {
            id: 1,
            summary: 'section',
            number: 1,
          },
          subSections: [
            {
              subSection: {
                id: 1,
                summary: 'subSection',
                number: 1,
              },
              questions: [
                {
                  id: 1,
                  question: 'question',
                  number: 1,
                  answer: "hoge",
                } as Question
              ]
            } as SubSectionFrame
          ],
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
  const get = useCallback(async () => {
    await getTest();
  }, []);

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
      <Button
        onClick={get}
      >
        get
      </Button>
      <NumberInput
        aria-label="remove"
        placeholder="Type a number…"
        value={num}
        onChange={(_, n) => {
          setNum(n ?? 0)
        }}
      />
    </Stack>
  );
   */
}
