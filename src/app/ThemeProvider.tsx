"use client"

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#009786',
      light: '#79c5bc',
      dark: '#01554b',
      contrastText: '#dfdfdf',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f7f7f7',
      paper: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}