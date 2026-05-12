"use client"

import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  setThemeMode: (mode: 'light' | 'dark') => {}
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode); 
          return newMode;
        });
      },
      setThemeMode: (newMode: 'light' | 'dark') => {
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
      }
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
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
                text: {
                  primary: '#2c3e50',
                },
              }
            : {
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
                  default: '#0a1929',
                  paper: '#001e3c',
                },
              }),
        },
        typography: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }),
    [mode],
  );

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}