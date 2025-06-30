"use client";

import React, { memo, useCallback, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { TeacherGuard } from "@/lib/guard";
import { TeacherClassCards } from "@/compornents/ClassList";
import { TestCards } from "@/compornents/TestCards"
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Test, User } from "@prisma/client";
import { getTestsByUserId } from "@/app/api/test/getTestsByUserId";
import { getClassByUserId } from "@/app/api/class/getClass";

const TAB_WIDTH = 100;
const HEADER_HEIGHT = 64;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{
                display: value === index ? "block" : "none",
                width: "100%",
                height: "100%",
            }}
            {...other}
        >
            <Box sx={{ p: 3 }}>{children}</Box>
        </div>
    );
}
function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        "aria-controls": `vertical-tabpanel-${index}`,
    };
}


export default function MyPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [value, setValue] = useState(0);
    const handleChange = (_: React.SyntheticEvent, newValue: number) => setValue(newValue);
    const router = useRouter();
    const createClassButtonEvent = () => {
        router.push("/teacher/createClass");
    };

    const createTestButtonEvent = () => {
        router.push("/teacher/createTest")
    };

    const joinClassButtonEvent = () => {
        router.push("/join");
    }

    const [tests, setTests] = useState<Test[]>([]);
    const [classes, setClasses] = useState<{ id: string, name: string, users: User[] }[]>([])

    const userId = user?.id || "";

    useEffect(() => {
        const fetchTest = async () => {
            const tmpTestList = await getTestsByUserId(userId);
            setTests(tmpTestList)
        }

        const fetchClass = async () => {
            const tmpClassList = await getClassByUserId(userId)
            setClasses(tmpClassList)
        }

        fetchTest()
        fetchClass()
    }, [userId]);


    return (
        <TeacherGuard>
            <Box sx={{ display: "flex", height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
                <Box
                    sx={{
                        width: TAB_WIDTH,
                        flexShrink: 0,
                        position: "sticky",
                        top: 0,
                        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                        display: "flex",
                    }}
                >
                    <Tabs
                        orientation="vertical"
                        value={value}
                        onChange={handleChange}
                        aria-label="menu"
                        sx={{ width: "100%", mt: 1 }}
                    >
                        <Tab icon={<ClassIcon />} label="Class" {...a11yProps(0)} sx={{ textTransform: "none" }} />
                        <Tab icon={<EditNoteIcon />} label="Test" {...a11yProps(1)} sx={{ textTransform: "none" }} />
                    </Tabs>
                </Box>
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                    }}
                >
                    <TabPanel value={value} index={0}>
                        <Box display="flex" flexDirection="column" gap={3} marginBottom="50px">
                            <TeacherClassCards classes={classes} />
                        </Box>
                        <Box position="fixed" display="flex" justifyContent="flex-end" sx={{
                            bottom: "20px",
                            right: "20px",
                            height: "50px",
                            gap: 2
                        }}>
                            <Button variant="contained" onClick={joinClassButtonEvent}>クラスに参加</Button>
                            <Button variant="contained" onClick={createClassButtonEvent}>新規クラスを作成</Button>
                        </Box>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Box gap={3}>
                            <TestCards testData={tests} />
                        </Box>
                        <Box position="fixed" display="flex" justifyContent="flex-end" sx={{
                            bottom: "20px",
                            right: "20px",
                            height: "50px"
                        }}>
                            <Button variant="contained" onClick={createTestButtonEvent}>新規テストを作成</Button>

                        </Box>
                    </TabPanel>
                </Box>
            </Box>
        </TeacherGuard>
    );
}
