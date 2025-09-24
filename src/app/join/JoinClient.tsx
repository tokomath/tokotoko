"use client"

import React, { useEffect, useState } from "react";
import { Button, Box, Typography, TextField, CircularProgress } from "@mui/material";

import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

import { joinUserToClass } from "../api/class/addUserToClass";
import { getClassByClassId } from "../api/class/getClass";
import { Class } from "@prisma/client"
import YAML from 'yaml'

const msg_yaml = require("../../msg-ja.yaml") as string
const msg = YAML.parse(msg_yaml)



export default function JoinClient() { 
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [classId, setClassId] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [classData, setClassData] = useState<Class | null>(null);
    const [classExistsMessage, setClassExistsMessage] = useState('');

    useEffect(() => {
        const classIdFromUrl = searchParams.get('classId');
        if (classIdFromUrl) {
            setClassId(classIdFromUrl);
        }
    }, [searchParams]);

    const joinButtonEvent = () => {
        const join = async () => {
            console.log("Joining class with ID:", classId);
            const res = await joinUserToClass(classId, user?.id || "")
            if (res) {
                alert(`${classData?.name}`+msg.JOINED);
                router.push("/mypage");
            } else {
                alert(msg.JOIN_ERROR)
            }
        }

        if (classId) {
            join();
        } else {
            console.error("Class ID is required.");
        }
    }

    useEffect(() => {
        const checkClassExistence = async () => {
            if (classId.length === 6) {
                setIsChecking(true);
                setClassExistsMessage("");
                setClassData(null);

                const fetchedClass = await getClassByClassId(classId);
                setClassData(fetchedClass);

                if (fetchedClass) {
                    setClassExistsMessage(`${fetchedClass.name}`+ msg.EXIST);
                } else {
                    setClassExistsMessage(msg.NOT_EXIST);
                }
                setIsChecking(false);
            } else {
                setClassData(null);
                setClassExistsMessage("");
            }
        };

        if (classId) {
            const handler = setTimeout(() => {
                checkClassExistence();
            }, 500);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [classId]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            sx={{ p: 2, marginTop: "50px" }}
        >
            <Typography variant="h5" component="h1" gutterBottom>
                {msg.JOINCLASS}
            </Typography>
            <Typography marginY={2}>
                {msg.ENTER_CODE}
            </Typography>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
                sx={{ width: '100%', maxWidth: '500px', mt: 2 }}
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    gap={2}
                    sx={{ width: '100%' }}
                >
                    <TextField
                        required
                        id="outlined-required"
                        label={msg.CLASSCODE}
                        value={classId}
                        onChange={(e) => setClassId(e.target.value.trim())}
                        fullWidth
                        inputProps={{ maxLength: 6 }}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        onClick={joinButtonEvent}
                        disabled={!classId || classId.length !== 6 || !classData || isChecking}
                        sx={{ width: "200px" }}
                    >
                        {msg.JOIN}
                    </Button>
                </Box>

                <Box sx={{ height: '24px', mt: 1 }}>
                    {isChecking && <CircularProgress size={24} />}
                    {!isChecking && classExistsMessage && (
                        <Typography
                            variant="body1"
                            color={classData ? 'primary' : 'error'}
                        >
                            {classExistsMessage}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}