"use client"
import React, {useState} from 'react';
import {Link, Container, TextField, Button, Box, Typography} from '@mui/material';

export default function Home() {
  const [userName, setUserName] = useState("")
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          ログイン
        </Typography>
        <TextField
          label="ユーザー名"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => {
            setUserName(e.target.value)
          }}
        />
        <Link href={`/mypage/${userName}`}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{mt: 3}}
          >
            ログイン
          </Button>
        </Link>
      </Box>
    </Container>
  );
}