"use client";
import axios from 'axios'
import {TextField} from '@mui/material';
import {useEffect, useState} from "react";
import {Box, List, ListItem, Card, CardContent, Typography, Button, Link} from "@mui/material";
import 'katex/dist/katex.min.css';
import Stack from '@mui/material/Stack';
import Question from "@/compornents/Question";
import SendIcon from '@mui/icons-material/Send';

export default function Mypage({params}: { params: { id: string } }) {
  const [inputs, setInputs] = useState(['']);

  const handleSubmit = async () => {
    const username = "A1";

    const data = {student_name: username, student_pass: "pass", test_id: Number(params.id), answers: inputs}
    console.log(data);
    const response = await axios.post('/api/test/submit', data);
  };

  const handleAddInput = () => {
    setInputs([...inputs, '']); // 新しい入力欄を追加
  };

  const handleRemoveInput = (index:any) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1); // 指定されたインデックスの入力欄を削除
    setInputs(newInputs);
  };

  const handleChangeInput = (value:any, index:any) => {
    const newInputs = [...inputs];
    newInputs[index] = value; // 指定されたインデックスの入力欄の値を更新
    setInputs(newInputs);
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <Box key={index} display="flex" alignItems="center" marginBottom={2}>
          <TextField
            label={`入力欄 ${index + 1}`}
            value={input}
            onChange={(e) => handleChangeInput(e.target.value, index)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="secondary" onClick={() => handleRemoveInput(index)}>
            削除
          </Button>
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={handleAddInput}>
        追加
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        送信
      </Button>
    </div>
  );
}
