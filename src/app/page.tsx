"use client"
import {Box, Button,Typography} from "@mui/material";
import { Stack } from "@mui/system";

import { useUser } from "@clerk/nextjs"; 
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  useEffect(() => {
      if(isSignedIn)
    router.push("mypage");
  },[isSignedIn]);
  return(<>
    
  </>);
}
