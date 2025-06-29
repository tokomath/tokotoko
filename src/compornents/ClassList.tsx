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
import { useEffect, useState } from "react";
import { ClassFrame } from "@/app/api/class/createClass";
import { Class, User } from "@prisma/client";
import { useUser } from '@clerk/nextjs'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { useRouter } from "next/navigation";
import { TeacherGuard } from "@/lib/guard"

interface ClassData{
    id: string,
    name: string,
    users: User[]
}

interface props{
    classes : ClassData[]
}

export function TeacherClassCards({classes} : props) {
    const ClassCards = ({ classData }: { classData: { id: string, name: string, users: User[] } }) => {
        const router = useRouter();

        const manageButtonFunction = () => {
            router.push("/teacher/manageClass?classId=" + classData.id);
        }
        const createTestButtonFunction = () => {
            router.push("/teacher/createTest?classId=" + classData.id);
        }

        return (
            <Card sx={{ height: "auto", textAlign: "left", }} onClick={() => { }}>
                <CardContent>
                    <Typography variant="h5" component="div">
                        {classData.name}
                    </Typography>
                    <Box>
                        <>
                            {(function () {
                                let comp: JSX.Element[] = [];
                                for (let i = 0; i < 5; i++) {
                                    const u = classData.users[i];
                                    if (u && classData.users.length > 6 && i == 4) {
                                        comp.push(
                                            <ListItem key={i}>
                                                <ListItemText primary={"︙"} />
                                            </ListItem>);
                                        break;
                                    }
                                    if (!u) {
                                        comp.push(
                                            <ListItem key={i}>
                                                <ListItemText primary={"　"} />
                                            </ListItem>);
                                        continue;
                                    }
                                    comp.push(
                                        <ListItem key={u.id + i}>
                                            <ListItemText primary={u.name} />
                                        </ListItem>);
                                }
                                return comp;
                            })()}
                        </>
                    </Box>
                </CardContent>
                <CardActions>
                    <Button size="large" onClick={manageButtonFunction}>管理</Button>
                    <Button size="large" onClick={createTestButtonFunction}>テスト作成</Button>
                </CardActions>
            </Card>
        );
    }

    return (
        <Stack>
            <TeacherGuard>
                <Grid container spacing={2}>
                    {classes.map((c) => (
                        <Grid item xs={12} sm={6} md={3} key={c.id}>
                            <ClassCards key={c.id} classData={c} />
                        </Grid>
                    ))}
                </Grid>
            </TeacherGuard>
        </Stack>
    );
}
