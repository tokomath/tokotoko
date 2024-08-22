import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { signOut } from "next-auth/react";
import React from "react";

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
          <AccountCircle />
          <Typography marginLeft={1} marginRight={4}>
            {user_name}
          </Typography>
          <Button color="inherit" startIcon={<ExitToAppSharp />} onClick={() => signOut()}>SignOut</Button>
        </Toolbar >
      </AppBar >
    </>
  )
}

