"use client"

import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Accordion,
  AccordionActions,
  Stack,
} from '@mui/material';

import {useState} from 'react';

import {Add} from '@mui/icons-material';

const section = () => {
  return (
    <Accordion>
      <TextField id="question" label="Standard" variant="standard"/>
    </Accordion>
  );
}

const classList = () => {

  return (
    <Stack>

    </Stack>
  )
}

export default function Home() {
  const [sections, setSections] = useState([]);
  return (
    <Stack>
      <Button variant="outlined" startIcon={<Add/>}>Section</Button>
      {section()}
    </Stack>
  )
}
