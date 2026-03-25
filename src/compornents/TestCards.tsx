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
    Chip,
    DialogContent,
    DialogActions,
    DialogContentText,
    CircularProgress,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from "react";
import { Test } from "@prisma/client"
import { removeTest } from "@/app/api/test/removeTest";

import YAML from 'yaml'
const msg_yaml = require("../msg-ja.yaml") as string
const msg = YAML.parse(msg_yaml)

interface DeleteTestButtonProps {
    testId: number;
    testTitle: string;
    onSuccess?: () => void;
}

const DeleteTestButton = ({ testId, testTitle, onSuccess }: DeleteTestButtonProps) => {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        if (!isDeleting) {
            setOpen(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await removeTest({ id: testId });
            setOpen(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            alert("削除に失敗しました。");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Button size="large" color="error" onClick={handleOpen}>
                削除
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>テストの削除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        「{testTitle}」を削除してもよろしいですか？この操作は取り消せません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isDeleting}>
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    >
                        削除する
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

interface props {
    testData: Test[]
}

const TestCardItem = ({ testData, onDeleted }: { testData: Test, onDeleted: (id: number) => void }) => {
    const router = useRouter();

    const solveButtonFunction = () => {
        router.push("/solve/" + testData.id)
    }
    const gradingTestButtonFunction = () => {
        router.push("/teacher/grading/" + testData.id)
    }

    const editTestButtonFunction = () => {
        router.push("/teacher/createTest?testId=" + testData.id)
    }

    return (
        <Card sx={{ height: "auto", textAlign: "left", }}>
            <CardContent>
                <Grid container alignItems="center">
                    <Grid size="grow">
                        <Typography variant="h5" component="div">
                            {testData.title}
                        </Typography>
                    </Grid>
                    <Grid>
                        <Chip
                            label={testData.isPublished ? "公開中" : "非公開"}
                            color={testData.isPublished ? "success" : "default"}
                            sx={{ fontWeight: 'normal' }}
                        />
                    </Grid>
                </Grid>
                <Typography variant="h6">{testData.summary}</Typography>
                <Typography>{msg.START + " : " + testData.startDate.toLocaleString()}</Typography>
                <Typography>{msg.END + " : " + testData.endDate.toLocaleString()}</Typography>
            </CardContent>
            <CardActions>
                <Button size="large" onClick={solveButtonFunction}>{msg.SOLVE}</Button>
                <Button size="large" onClick={gradingTestButtonFunction}>{msg.GRADING}</Button>
                <Button size="large" onClick={editTestButtonFunction}>{msg.EDIT}</Button>
                <DeleteTestButton
                    testId={testData.id}
                    testTitle={testData.title}
                    onSuccess={() => onDeleted(testData.id)}
                />
            </CardActions>
        </Card>
    );
}

export function TestCards({ testData }: props) {
    const [tests, setTests] = useState<Test[]>(testData);
    useEffect(() => {
        setTests(testData);
    }, [testData]);
    const handleRemoveFromState = (deletedId: number) => {
        setTests((prev) => prev.filter((t) => t.id !== deletedId));
    };

    return (
        <Grid container spacing={2}>
            {tests.map((t) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={t.id}>
                    <TestCardItem key={t.id} testData={t} onDeleted={handleRemoveFromState} />
                </Grid>
            ))}
        </Grid>
    );
}