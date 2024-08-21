"use client"
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import "./globals.css";
import { Link, Typography } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import { Box } from "@mui/system";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="google" content="notranslate" />
      <body className={inter.className}>
        <SessionProvider>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        </SessionProvider>
        <footer>
          {/* 中央寄せ */}
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Typography fontSize={17}>Formula Form</Typography>
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="row" marginTop={1}>
              <Link href="https://github.com/tokomath/tokotoko" marginRight={1}>Source Code</Link>
              <Link href="https://github.com/tokomath/tokotoko/blob/main/ThirdPartyNotices.txt" marginLeft={1}>Third Party Licenses</Link>
            </Box>
          </Box>
        </footer>
      </body>
    </html >
  );
}
