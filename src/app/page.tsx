"use client"
import {signOut, useSession} from "next-auth/react";
import {Box, Button} from "@mui/material";
import { Stack } from "@mui/system";

export default function Home() {
  const {data: session, status} = useSession()
  return (
    <Stack>
      <Box>{JSON.stringify(session)}</Box>
      <Box>{JSON.stringify(status)}</Box>
      <Button onClick={(e) => signOut()}>SignOut</Button>
    </Stack>
  )
}
