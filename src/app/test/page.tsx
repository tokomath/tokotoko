"use client"
import React, { useState } from 'react';
import { Stack, Button, Tabs, Tab, Box, Typography } from '@mui/material';
import Link from 'next/link';

export default function Page() {
  return (
    <Box width="100vh" justifyContent="center" display="flex">
      <Stack>
        <h1>Test</h1>
        <Button href="test/class" variant="outlined">class</Button>
        <Button href="test/createTest" variant="outlined">createTest</Button>
        <Button href="test/form" variant="outlined">form</Button>
        <Button href="test/student" variant="outlined">student</Button>
        <Button href="test/teacher" variant="outlined">teacher</Button>
      </Stack>
    </Box>
  );
}
