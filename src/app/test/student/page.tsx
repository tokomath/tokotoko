"use client";
import axios from 'axios'
import {TextField} from '@mui/material';
import {useEffect, useState} from "react";
import {Input, Stack, Card, Box, List, ListItem, CardContent, Typography, Button, Link} from "@mui/material";
import 'katex/dist/katex.min.css';

export default function StudentTest() {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [res, setRes] = useState('');
  const submitAdd = async () => {
    const data = {name: name, pass: pass}
    const response = await axios.post('/api/student/add', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitDelete = async () => {
    const data = {name: name}
    const response = await axios.post('/api/student/delete', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitCheck = async () => {
    const data = {name: name, pass: pass}
    const response = await axios.post('/api/student/auth', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }
  const submitChangePass = async () => {
    const data = {name: name, oldpass: pass, newpass: newPass}
    const response = await axios.post('/api/student/change-pass', data).catch(
      (e) => {
        const str = JSON.stringify(e.response.data)
        alert(str)
        setRes(str)
      }
    )
  }

  return (
    <Box width="100vw" display="flex" justifyContent="center">
      <Stack width={400} gap={2}>
        <h1>Student API Test</h1>
        <Card>
          <Stack width={400} margin={2} gap={1}>
            <h4>name</h4>
            <Input onChange={(e) => setName(e.target.value)}/>
            <h4>pass</h4>
            <Input onChange={(e) => setPass(e.target.value)}/>
            <h4>new-pass</h4>
            <Input onChange={(e) => setNewPass(e.target.value)}/>
          </Stack>
        </Card>
        <Button onClick={submitAdd} variant="outlined">Add</Button>
        <Button onClick={submitDelete} variant="outlined">Delete</Button>
        <Button onClick={submitCheck} variant="outlined">Auth</Button>
        <Button onClick={submitChangePass} variant="outlined">Change Pass</Button>
        <p>{res}</p>
      </Stack>
    </Box>
  );
}
