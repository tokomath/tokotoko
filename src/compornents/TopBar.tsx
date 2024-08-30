import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { signOut } from "next-auth/react";
import React from "react";
import UserMenu from "./UserMenu";

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
          <UserMenu user_name={user_name} />
        </Toolbar >
      </AppBar >
    </>
  )
}

