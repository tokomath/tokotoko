"use client"

import { AppBar, Button, Toolbar, Typography, Box, useTheme } from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useUser, SignInButton } from '@clerk/nextjs';
import CustomUserButton from "./CustomUserButton";

import logoImg from "@/app/logo.png"; 

interface QuestionProps {
  page_name?: string;
}

export default function TopBar({ page_name = "" }: QuestionProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const theme = useTheme(); 

  const titleEvent = () => {
    router.push("/");
  }

  let name: string = "";
  if (isSignedIn && user) {
    name = `${user.lastName || ""} ${user.firstName || ""}`.trim();
  }

  return (
    <>
      <AppBar 
        position="fixed" 
        color="inherit" 
        elevation={2} 
        sx={{ 
          bgcolor: "white", 
          color: "text.primary", 
          borderBottom: "4px solid",
          borderColor: "primary.main",
          zIndex: theme.zIndex.appBar, 
        }}
      >
        <Toolbar sx={{ 
          display: "flex", 
          flexDirection: "row", 
          flexWrap: "nowrap", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: { xs: "0 8px", sm: "0 16px" },
        }}>
          <Box width="calc(100%/3)" sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <Button
              variant="text"
              onClick={titleEvent}
              sx={{
                padding: 0,
                minWidth: "auto",
                ml: { xs: 0, sm: 1 }, 
              }}
            >
              <Image
                src={logoImg}
                alt="Formula Form Logo"
                width={150} 
                height={40} 
                style={{ objectFit: "contain" }}
                priority
              />
            </Button>
          </Box>

          <Box width="calc(100%/3)" sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ 
              fontSize: { xs: "1.25rem", sm: "1.75rem" }, 
              fontWeight: "bold", 
              color: "primary.main",
            }}>
              {page_name}
            </Typography>
          </Box>

          <Box width="calc(100%/3)" sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ 
              display: "flex", 
              alignItems: "center", 
              color: "text.secondary", 
              fontSize: { xs: "0.75rem", sm: "0.875rem" }, 
            }}>
              {name}
            </Typography>

            {isLoaded && !isSignedIn && (
              <SignInButton>
                <Button variant="contained" color="primary" size="small" sx={{ textTransform: "none", fontWeight: "bold" }}>
                  Sign In
                </Button>
              </SignInButton>
            )}

            {isLoaded && isSignedIn && (
              <Box sx={{ height: "fit-content" }}>
                <CustomUserButton />
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar/>
      <Box sx={{ height: "4px" }}/> 
    </>
  )
}