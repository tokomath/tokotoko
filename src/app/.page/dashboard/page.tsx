"use client"
import {signOut, useSession} from "next-auth/react";
import {Box, Button} from "@mui/material";
import {getServerSession} from "next-auth";

export default function Home() {
  const {data: session} = useSession()
  if (session && session.user) {
    return (
      <Box>
        this is your dashboard {session.user.name}
        <Button onClick={(e) => signOut()}>SignOut</Button>
      </Box>
    )
  } else {
    return (
      <Box></Box>
    )
  }
}
