"use client"
import React, { useEffect, useState } from "react";
import { notFound } from 'next/navigation';
import { Button, Box, Typography } from "@mui/material";
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { changeRole } from "@/app/api/User/updateUser"
export default function Page() {
    //ロール選択ページは一旦無効化
    notFound();
    
    const { user } = useUser();
    const router = useRouter();
    const setRoleTeacher = () => {
        const userId = user?.id;
        if (userId)
            changeRole(userId, 0).then((ok) => {
                if(ok == 0)
                    router.push("mypage");
            });

    }
    const setRoleStudent = () => {
        const userId = user?.id;
        if (userId)
            changeRole(userId, 1).then((ok) => {
                if(ok == 0)
                    router.push("mypage");
            });

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