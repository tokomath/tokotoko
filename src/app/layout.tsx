import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter";
import "./globals.css";
import { Box, Stack, Typography } from "@mui/material";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "TokoToko",
  description: "E-learning for math",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        <footer>
          <Typography fontSize={14} textAlign={"center"} margin={2}>TokoToko / とことこ</Typography>
        </footer>
      </body>
    </html>
  );
}
