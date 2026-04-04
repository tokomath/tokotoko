"use client"

import {
    Box,
    Card,
    CardActionArea,
    Button,
    Grid,
    ListItem,
    ListItemText,
    Stack,
    Typography,
    Avatar,
} from "@mui/material";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { TeacherGuard } from "@/lib/guard"
import { msg } from "@/msg-ja";

const stringToBrightColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 80%, 65%)`;
};

interface ClassData {
    id: string;
    name: string;
    icon: string | null;
    users: User[];
}

interface Props {
    classes: ClassData[];
}

export function TeacherClassCards({ classes }: Props) {
    const ClassCards = ({ classData }: { classData: ClassData }) => {
        const router = useRouter();

        const detailButtonFunction = () => {
            router.push("/classDetail?classId=" + classData.id);
        }
        const manageButtonFunction = () => {
            router.push("/teacher/createClass?classId=" + classData.id);
        }
        const createTestButtonFunction = () => {
            router.push("/teacher/createTest?classId=" + classData.id);
        }

        return (
            <Card sx={{ height: "auto", textAlign: "left", }}>
                <CardActionArea onClick={detailButtonFunction}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar
                                src={classData.icon || undefined}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: !classData.icon && classData.name ? stringToBrightColor(classData.name) : "#e0e0e0",
                                    fontSize: "1.5rem",
                                }}
                                variant="rounded"
                            >
                                {!classData.icon && classData.name ? classData.name.charAt(0).toUpperCase() : ""}
                            </Avatar>
                            <Typography variant="h5" component="div">
                                {classData.name}
                            </Typography>
                        </Box>
                        <Box>
                            <>
                                {(function () {
                                    let comp: JSX.Element[] = [];
                                    for (let i = 0; i < 5; i++) {
                                        const u = classData.users[i];
                                        if (u && classData.users.length > 6 && i == 4) {
                                            comp.push(
                                                <ListItem key={i} sx={{ py: 0, px: 0 }}>
                                                    <ListItemText primary={"︙"} />
                                                </ListItem>);
                                            break;
                                        }
                                        if (!u) {
                                            comp.push(
                                                <ListItem key={i} sx={{ py: 0, px: 0 }}>
                                                    <ListItemText primary={"　"} />
                                                </ListItem>);
                                            continue;
                                        }
                                        comp.push(
                                            <ListItem key={u.id + i} sx={{ py: 0, px: 0 }}>
                                                <ListItemText primary={u.name} />
                                            </ListItem>);
                                    }
                                    return comp;
                                })()}
                            </>
                        </Box>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="large" onClick={detailButtonFunction}>{msg.VIEW_DETAILS}</Button>
                    <Button size="large" onClick={manageButtonFunction}>{msg.MANAGE}</Button>
                    <Button size="large" onClick={createTestButtonFunction}>{msg.CREATE_TEST}</Button>
                </CardActions>
            </Card>
        );
    }

    return (
        <Stack>
            <TeacherGuard>
                <Grid container spacing={2}>
                    {classes.map((c) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={c.id}>
                            <ClassCards key={c.id} classData={c} />
                        </Grid>
                    ))}
                </Grid>
            </TeacherGuard>
        </Stack>
    );
}