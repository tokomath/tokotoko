"use client"
import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { changeRole } from "@/app/api/User/updateUser"
export default function Page() {
    const { user } = useUser();
    const router = useRouter();
    const setRoleTeacher = () => {
        if (user)
            changeRole(user?.id, 0).then((ok) => {
                if(ok == 0)
                    alert("OK");
            });
        router.push("mypage");
    }
    const setRoleStudent = () => {
        if (user)
            changeRole(user?.id, 1).then((ok) => {
                if(ok == 0)
                    alert("OK");
            });
        router.push("mypage");
    }

    return (
        <Box textAlign="center" position="fixed" display="flex" width="100vw" flexDirection="column">
            <Typography margin={5}>アカウントの種類を選択してください。</Typography>
            <Box>
                <Button variant="contained" size="large" sx={{ margin: 5 }} onClick={setRoleTeacher}>教師</Button>
                <Button variant="contained" size="large" sx={{ margin: 5 }} onClick={setRoleStudent}>学生</Button>
            </Box>
        </Box>
    );
}