"use client"
import React, {useState} from 'react';
import {Stack, Button, Tabs, Tab, Box, Typography} from '@mui/material';
import axios from "axios";

export default function Page() {
  const handle = async () => {
    axios.get("/api/test/submit")
  }
  return (
    <Box width="100vh" justifyContent="center" display="flex">
      <Stack>
        <h1>Test</h1>
        <Button variant="outlined" onClick={handle}>Student</Button>
      </Stack>
    </Box>
  );
}