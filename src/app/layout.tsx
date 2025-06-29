import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import TopBar from '@/compornents/TopBar'
import { AppBar, Button, Toolbar, Typography, Paper, Box } from "@mui/material";
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const HEADER_HEIGHT = 64

const RootLayout = ({ children }: { children: ReactNode }) => (
  <ClerkProvider>
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          WebkitFontSmoothing: 'antialiased',
          fontFamily:
            'var(--font-geist-sans), var(--font-geist-mono), system-ui, sans-serif',
        }}
      >
        <AppBar
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: HEADER_HEIGHT,
            zIndex: 50,
            display: 'flex',
          }}
        >
          <TopBar page_name=""/>
        </AppBar>

        <main
          style={{
            flex: 1,
            width: '100%',
            paddingTop: HEADER_HEIGHT,
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          }}
        >
          {children}
        </main>
      </body>
    </html>
  </ClerkProvider>
)

export default RootLayout
