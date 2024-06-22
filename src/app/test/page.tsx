"use client"
import React, {useState} from 'react';
import {Stack,Button, Tabs, Tab, Box, Typography} from '@mui/material';

export default function Page(){
  return (
    <Box width="100vh" justifyContent="center" display="flex">
      <Stack>
        <h1>Test</h1>
        <Button variant="outlined">Student</Button>
        <Button variant="outlined">Teacher</Button>
        <Button variant="outlined">Student</Button>
        <Button variant="outlined">Student</Button>
      </Stack>
    </Box>
  );
}