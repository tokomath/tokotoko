import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import TopBar from '@/compornents/TopBar'
import { AppBar, Box } from "@mui/material";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const HEADER_HEIGHT = 64;

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ClerkProvider>
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </body>
    </html>
  </ClerkProvider>
)

export default RootLayout
