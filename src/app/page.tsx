"use client"
import {signOut} from "next-auth/react";
import {Box, Button} from "@mui/material";

export default function Home() {
  return (
    <Box><Button onClick={(e) => signOut()}>SignOut</Button></Box>
  )
}
