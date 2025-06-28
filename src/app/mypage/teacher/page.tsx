"use client"

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Link,
    Card,
    Paper,
    Tab,
    Tabs,
    Typography,
    Divider,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import 'katex/dist/katex.min.css';
import { Test, Class } from "@prisma/client";

import Stack from '@mui/material/Stack';
import { getTestByClass } from "@/app/api/test/getTestByClass";
import { getClassByUserId } from "@/app/api/class/getClass";
import { TeacherGuard } from "@/lib/guard"
import { TeacherClassCards } from "@/compornents/TeacherClassList"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const ClassCard = () => {
    const routor = useRouter();
    const createClassButtonEvent = () => {
        routor.push("/teacher/createClass");
    }

    const manageClassButtonEvent = () => {
        routor.push("/teacher/manageClass");
    }

    return (<>
        <CardContent>
            <Typography variant="h5">クラス</Typography>
        </CardContent>
        <CardActions>
            <Button size="large" onClick={createClassButtonEvent}>作成</Button>
            <Button size="large" onClick={manageClassButtonEvent}>管理</Button>
        </CardActions>
    </>)
}

const ManageCard = () => {
    
    return (<>
        <CardContent>
            <Typography variant="h5">管理</Typography>
        </CardContent>
        <CardActions>
            <Button size="large" >クラス管理</Button>
            <Button size="large" >テスト管理</Button>
        </CardActions>
    </>)
}

export default function MyPage() {

    const { isLoaded, isSignedIn, user } = useUser();


    return (
        <TeacherGuard>
            <Paper>
                <Box padding={2}>
                    <Typography variant="h4">Mypage</Typography>
                </Box>
            </Paper>
            <Box display="flex" flexWrap="wrap" flexDirection="column">
                <Card style={{ margin: 5, width: "auto" }}>
                    <ClassCard />
                    <ManageCard />
                </Card>
                <TeacherClassCards/>
            </Box>
        </TeacherGuard>
    )
}