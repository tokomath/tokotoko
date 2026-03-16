"use client"

import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography, Paper, Box } from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

interface QuestionProps {
  page_name?: string;
}

export default function TopBar({ page_name = "" }: QuestionProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const titleEvent = () => {
    router.push("/");
  }

  let name: string = "";
  if (isSignedIn && user) {
    name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  return (
    <>
      <Toolbar style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Typography variant="h6" component="div" width="calc(100%/3)" textAlign="left">
          <Button variant="text" onClick={titleEvent} sx={{ color: "white", fontSize: "22px" }}>
            Formula Form
          </Button>
        </Typography>
        <Box width="calc(100%/3)" textAlign="center">
          <Typography variant="h4">{page_name}</Typography>
        </Box>
        <Box width="calc(100%/3)" textAlign="right" >
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Typography marginRight="5px" sx={{ display: "flex", alignItems: "center" }}>
              {name}
            </Typography>
            
            {isLoaded && !isSignedIn && (
              <div className="h-fit ml-4 bg-blue-500 w-fit rounded-md text-white text-sm font-semibold">
                <SignInButton />
              </div>
            )}

            {isLoaded && isSignedIn && (
              <div className="h-fit ml-4 w-fit">
                <UserButton />
              </div>
            )}
            
          </Box>
        </Box>
      </Toolbar>
    </>
  )
}