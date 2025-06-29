"use client"
import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography, Paper, Box } from "@mui/material";
import React from "react";
import { useUser } from '@clerk/nextjs'

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
interface QuestionProps {
  page_name: string;
}

export default function TopBar({ page_name = "" }: QuestionProps) {
  const { user } = useUser();

  return (
    <>
      <Toolbar style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Typography variant="h6" component="div" width="calc(100%/3)" textAlign="left">
          Formula Form
        </Typography>
        <Box width="calc(100%/3)" textAlign="center">
          <Typography variant="h4">{page_name}</Typography>
        </Box>
        <Box width="calc(100%/3)" textAlign="right">
          <Box display="flex" justifyContent="flex-end">
            <Typography>{user?.firstName + " " + user?.lastName}</Typography>
            <SignedOut>
              <div className="h-fit ml-4 bg-blue-500 w-fit rounded-md text-white text-sm font-semibold">
                <SignInButton />
              </div>
            </SignedOut>
            <SignedIn>
              <div className="h-fit ml-4 w-fit">
                <UserButton />
              </div>
            </SignedIn>
          </Box>
        </Box>
      </Toolbar>
    </ >
  )
}

