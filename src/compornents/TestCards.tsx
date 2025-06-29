"use client"

import {
    Box,
    Card,
    Button,
    Grid,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    Paper,
    DialogContent,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from "react";
import { Test } from "@prisma/client"

interface props{
    testData: Test[]
}

export function TestCards({testData}:props) {
    const TestCards = ({ testData }: { testData: Test }) => {
        const router = useRouter();

        const solveButtonFunction = () => {
            router.push("/solve/" + testData.id)
        }
        const gradingTestButtonFunction = () => {
            router.push("/teacher/grading/" + testData.id)
        }

        return (
            <Card sx={{ height: "auto", textAlign: "left", }}>
                <CardContent>
                    <Typography variant="h5" component="div">{testData.title} </Typography>
                    <Typography variant="h6">{testData.summary}</Typography>
                    <Typography>Start:{testData.startDate.toLocaleString()}</Typography>
                    <Typography>End  :{testData.endDate.toLocaleString()}</Typography>
                </CardContent>
                <CardActions>
                    <Button size="large" onClick={solveButtonFunction}>解答</Button>
                    <Button size="large" onClick={gradingTestButtonFunction}>採点</Button>
                </CardActions>
            </Card>
        );
    }

    return (
        <Grid container spacing={2}>
            {testData.map((t) => (
                <Grid item xs={12} sm={6} md={3} key={t.id}>
                    <TestCards key={t.id} testData={t} />
                </Grid>
            ))}
        </Grid>

    );
}