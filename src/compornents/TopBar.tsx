"use client"
import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography, Paper, Box } from "@mui/material";
import React from "react";
import { useUser } from '@clerk/nextjs'
import { useRouter } from "next/navigation"
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
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const titleEvent = () => {
    router.push("/");
  }
  let name: string = "";
  if (isSignedIn)
    name = user?.firstName + " " + user?.lastName;
  return (
    <>
      <Toolbar style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Typography variant="h6" component="div" width="calc(100%/3)" textAlign="left">
          <Button variant="text" onClick={titleEvent} sx={{ color: "white", fontSize: "22px" }}>Formula Form</Button>
        </Typography>
        <Box width="calc(100%/3)" textAlign="center">
          <Typography variant="h4">{page_name}</Typography>
        </Box>
        <Box width="calc(100%/3)" textAlign="right" >
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Typography marginRight="5px" alignItems="center" sx={{ display: "flex", alignItems: "center" }}>
              {name}
            </Typography>
            <SignedOut>
              <div className="h-fit ml-4 bg-blue-500 w-fit rounded-md text-white text-sm font-semibold">
                <UserButton />
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

