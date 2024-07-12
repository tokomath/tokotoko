"use client";

import {
  Button,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import { Class, Student } from "@prisma/client";
import { getAllStudent } from "@/app/api/student/get/getStudent";

export default function Page() {
  const [teacherId, setTeacherId] = useState<number>(1);
  const [className, setClassName] = useState<string>("");
  const [assignedStudent, setAssignedStudent] = useState<Student[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudent = async () => {
      const res = await getAllStudent();
      setStudentList(res);
    };

    fetchStudent();
  }, []);

  const handleStudentChange = (event: SelectChangeEvent<number[]>) => {
    const values = event.target.value as number[];
    const select = studentList.filter((item) => values.includes(item.id));

    setAssignedStudent(select);
  };

  const StudentList = () => {
    return (
      <FormControl>
        <InputLabel id="student-assign">Assigned Student</InputLabel>
        <Select
          labelId="student-assign"
          input={<OutlinedInput />}
          onChange={handleStudentChange}
          multiple
          value={assignedStudent.map((student) => student.id)}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as number[]).map((value: number) => {
                const item = studentList.find(
                  (option: Class) => option.id === value,
                );
                return item ? <Chip key={value} label={item.name} /> : null;
              })}
            </Box>
          )}
        >
          {studentList.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Stack m={"10px"} gap={"20px"}>
      <NumberInput
        value={teacherId}
        onChange={(_, e) => {
          setTeacherId(e === null ? 0 : e);
        }}
      />
      <Button variant={"contained"}>create class</Button>
      <TextField
        value={className}
        label={"Class Name"}
        onChange={(e) => {
          setClassName(e.target.value);
        }}
      />
      <StudentList />
    </Stack>
  );
}
