import './globals.css'
import { cookies } from 'next/headers';
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from "@clerk/localizations";
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import TopBar from '@/compornents/TopBar'
import { AppBar, Box } from "@mui/material";
import ThemeProvider from '@/app/ThemeProvider';
import { LangProvider } from "@/compornents/LangProvider";
import { getLangServer } from "@/lib/msg-server";
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const HEADER_HEIGHT = 64;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialLang = await getLangServer();

  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body
          style={{
            margin: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LangProvider initialLang={initialLang}>
            <ThemeProvider>
              <AppBar
                position="static"
                sx={{
                  height: HEADER_HEIGHT,
                }}
              >
                <TopBar page_name="" />
              </AppBar>

              <Box
                component="main"
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {children}
              </Box>
            </ThemeProvider>
          </LangProvider>
        </body>
      </html>
    </ClerkProvider >
  )
}
