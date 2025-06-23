import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import UserMenu from "./UserMenu";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
interface QuestionProps {
  page_name: string;
  user_name: string;
}

export default function TopBar({ page_name = "", user_name = "Unknown User" }: QuestionProps) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {page_name}
          </Typography>
          <SignedOut>
            <div className="h-fit ml-4 bg-blue-500 w-fit p-2 rounded-md text-white text-sm font-semibold">
              <SignInButton />
            </div>
          </SignedOut>
          <SignedIn>
            <div className="h-fit ml-4 w-fit">
              <UserButton />
            </div>
          </SignedIn>
        </Toolbar >
      </AppBar >
    </>
  )
}

