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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import { Class, User} from "@prisma/client";

import { getAllStudent } from "@/app/api/student/getStudent";
import { getAllTeachers } from "@/app/api/teacher/getTeacher";
import { ClassFrame,createClass } from "@/app/api/class/createClass";


export default function Page() {
  const [teacherId, setTeacherId] = useState<number>(1);
  const [className, setClassName] = useState<string>("");
  const [assignedStudent, setAssignedStudent] = useState<User[]>([]);
  const [studentList, setStudentList] = useState<User[]>([]);

  const [assignedTeacher, setAssignedTeacher] = useState<User[]>([]);
  const [teacherList, setTeacherList] = useState<User[]>([]);
  const [isAddMe, setIsAddMe] = useState<boolean>(true);

  useEffect(() => {
    // fetch api list
    const fetchStudent = async () => {
      const res = await getAllStudent();
      setStudentList(res);
    };

    const fetchTeacher = async () => {
      const res = await getAllTeachers();
      setTeacherList(res);
    };

    //function call
    fetchStudent();
    fetchTeacher();
  }, [teacherId]);

  const handleStudentChange = (event: SelectChangeEvent<number[]>) => {
    const values = event.target.value as number[];
    const select = studentList.filter((item) => values.includes(item.id));

    setAssignedStudent(select);
  };

  const handleTeacherChange = (event: SelectChangeEvent<number[]>) => {
    const values = event.target.value as number[];
    if (isAddMe && !values.includes(teacherId)) {
      values.push(teacherId);
    }
    console.log(values);
    const select = teacherList.filter((item) => values.includes(item.id));
    setAssignedTeacher(select);
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

  const TeacherList = () => {
    return (
      <FormControl>
        <InputLabel id="teacher-assign">Assigned Teacher</InputLabel>
        <Select
          labelId="teacher-assign"
          input={<OutlinedInput />}
          onChange={handleTeacherChange}
          multiple
          value={assignedTeacher.map((teacher) => teacher.id)}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as number[]).map((value: number) => {
                const item = teacherList.find(
                  (option: Class) => option.id === value,
                );
                return item ? <Chip key={value} label={item.name} /> : null;
              })}
            </Box>
          )}
        >
          {teacherList.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.id}>
              {teacher.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const createClassButtonFunction = () => {
    const newClass: Class = {
      id: 1,
      name: className,
    };
    const users = assignedTeacher.concat(assignedStudent);

    const data: ClassFrame = {
      class: newClass,
      user: users,
    };

    console.log(data);
    createClass(data);
    alert("Class Created");
  };

  return (
    <Stack m={"10px"} gap={"20px"}>
      <NumberInput
        value={teacherId}
        onChange={(_, e) => {
          setTeacherId(e === null ? 0 : e);
        }}
      />
      <Button variant={"contained"} onClick={createClassButtonFunction}>
        create class
      </Button>
      <TextField
        value={className}
        label={"Class Name"}
        onChange={(e) => {
          setClassName(e.target.value);
        }}
      />
      <StudentList />
      <TeacherList />
      <FormControlLabel
        label={"Add me to teacher list"}
        control={
          <Checkbox
            checked={isAddMe}
            onChange={(e) => {
              setIsAddMe(e.target.checked);
            }}
          />
        }
      />
    </Stack>
  );
}
