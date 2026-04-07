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
    name = `${user.lastName || ""} ${user.firstName || ""}`.trim();
  }

  return (
    <>
      <Toolbar sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between" }}>
        <Box width="calc(100%/3)" sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            variant="text"
            onClick={titleEvent}
            sx={{
              color: "white",
              fontSize: "22px",
              whiteSpace: "nowrap",
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              lineHeight: 1.2
            }}
          >
            Formula Form
          </Button>
        </Box>

        <Box width="calc(100%/3)" sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
            {page_name}
          </Typography>
        </Box>

        <Box width="calc(100%/3)" sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Typography sx={{ display: "flex", alignItems: "center", marginRight: "5px" }}>
            {name}
          </Typography>

          {isLoaded && !isSignedIn && (
            <Box sx={{ height: "fit-content", ml: 2, bgcolor: "primary.main", borderRadius: 1, color: "white", fontSize: "0.875 margin-toprem", fontWeight: "bold" }}>
              {/*<SignInButton />*/}
            </Box>
          )}

          {isLoaded && isSignedIn && (
            <Box sx={{ height: "fit-content", ml: 2 }}>
              <UserButton />
            </Box>
          )}
        </Box>
      </Toolbar>
    </>
  )
}