"use client"
import {Inter} from "next/font/google";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter";
import "./globals.css";
import {Typography} from "@mui/material";
import {SessionProvider} from "next-auth/react";

const inter = Inter({subsets: ["latin"]});

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <SessionProvider>
      <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
    </SessionProvider>
    <footer>
      <Typography fontSize={14} textAlign={"center"} margin={2}>TokoToko / とことこ</Typography>
    </footer>
    </body>
    </html>
  );
}
