"use client";
import axios from 'axios'
import {TextField} from '@mui/material';
import {useEffect, useState} from "react";
import {Input, Stack, Card, Box, List, ListItem, CardContent, Typography, Button, Link} from "@mui/material";
import 'katex/dist/katex.min.css';

export default function StudentTest() {
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPass, setTeacherPass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [res, setRes] = useState('');
  const submitAdd = async () => {
    const data = {teacher_name: teacherName, teacher_pass: teacherPass, name: className}
    const response = await axios.post('/api/class/add', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitDelete = async () => {
    const data = {teacher_name: teacherName, teacher_pass: teacherPass, name: className}
    const response = await axios.post('/api/class/delete', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitAddStudent = async () => {
    const data = {
      teacher_name: teacherName,
      teacher_pass: teacherPass,
      student_name: studentName,
      class_name: className
    }
    const response = await axios.post('/api/class/add-student', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitDeleteStudent = async () => {
    const data = {
      teacher_name: teacherName,
      teacher_pass: teacherPass,
      student_name: studentName,
      class_name: className
    }
    const response = await axios.post('/api/class/delete-student', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitAddTeacher = async () => {
    const data = {teacher_name: teacherName, class_name: className}
    const response = await axios.post('/api/class/add-teacher', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitDeleteTeacher = async () => {
    const data = {teacher_name: teacherName, class_name: className}
    const response = await axios.post('/api/class/delete-teacher', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }

  return(
    <Box width="100vw" display="flex" justifyContent="center">
      <Stack width={400} gap={2}>
        <h1>Student API Test</h1>
        <Card>
          <Stack width={400} margin={2} gap={1}>
            <h4>class-name</h4>
            <Input onChange={(e) => setClassName(e.target.value)}/>
            <h4>student-name</h4>
            <Input onChange={(e) => setStudentName(e.target.value)}/>
            <h4>teacher-name</h4>
            <Input onChange={(e) => setTeacherName(e.target.value)}/>
            <h4>teacher-pass</h4>
            <Input onChange={(e) => setTeacherPass(e.target.value)}/>
          </Stack>
        </Card>
        <Button onClick={submitAdd} variant="outlined">Add Class</Button>
        <Button onClick={submitDelete} variant="outlined">Delete Class</Button>
        <Button onClick={submitAddStudent} variant="outlined">Add student to Class</Button>
        <Button onClick={submitDeleteStudent} variant="outlined">Delete student from Class</Button>
        <Button onClick={submitAddTeacher} variant="outlined">Add teacher to class</Button>
        <Button onClick={submitDeleteTeacher} variant="outlined">Delete teacher from Class</Button>
        <p>{res}</p>
      </Stack>
    </Box>
  );
}
