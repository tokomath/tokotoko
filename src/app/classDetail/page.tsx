"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Class, User, Test, Submission } from "@prisma/client";
import { 
  getClassByClassId, 
  getTestByClass, 
  isAlreadySubmit, 
  getSubmissionsByTestId 
} from "@/app/api/test/submit";
import { getClerkUsersImages } from "@/app/api/User/getIcon";
import { useUser } from "@clerk/nextjs";
import { QRCodeCanvas } from "qrcode.react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Snackbar,
  Tooltip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  ListItemAvatar
} from "@mui/material";
import { ContentCopy, Assignment, People, PlayArrow, Assessment } from "@mui/icons-material";
import { useSearchParams, useRouter } from "next/navigation";
import { msg } from "@/msg-ja";

type UserWithImage = User & { image?: string };
type ClassWithUsers = Class & { users: UserWithImage[] };

const stringToBrightColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
};

function MemberItem({ user }: { user: UserWithImage }) {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={user.image} alt={user.name || ""}>
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography
              variant="body1"
              sx={{
                minWidth: { sm: "200px" },
                fontWeight: 500,
                mr: 2
              }}
            >
              {user.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

function TestItem({ test, isTeacher, classStudents, userId }: { test: Test; isTeacher: boolean; classStudents: UserWithImage[]; userId: string }) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isTeacher) {
      getSubmissionsByTestId(test.id).then(setSubmissions);
    } else if (userId) {
      isAlreadySubmit({ testId: test.id, userId }).then(setSubmitted);
    }
  }, [test.id, isTeacher, userId]);

  const submittedStudentIds = submissions.map(s => s.studentId);
  const submittedStudents = classStudents.filter(s => submittedStudentIds.includes(s.id));

  const studentButtonSx = {
    width: "140px",
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pl: 4
  };

  const studentIconSx = {
    position: 'absolute',
    left: '8px'
  };

  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  return (
    <React.Fragment>
      <ListItem
        secondaryAction={
          isTeacher ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
                {msg.SUBMISSION_STATUS} ({submittedStudents.length}/{classStudents.length})
              </Button>
              <Button variant="contained" size="small" color="primary" onClick={() => router.push(`/teacher/grading/${test.id}?classId=${classId}`)}>
                {msg.GRADE}
              </Button>
              <Button variant="contained" size="small" color="primary" onClick={() => router.push(`/teacher/createTest?testId=${test.id}`)}>
                {msg.EDIT_TEST}
              </Button>
              
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={submitted ? msg.SUBMITTED : msg.NOT_SUBMITTED}
                color={submitted ? "success" : "error"}
                variant="outlined"
                size="small"
                sx={{ width: "80px" }}
              />
              {submitted ? (
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => router.push(`/result/${test.id}`)}
                  sx={studentButtonSx}
                >
                  <Assessment sx={studentIconSx} />
                  <span style={{ flexGrow: 1, textAlign: 'center' }}>{msg.VIEW_RESULT}</span>
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  size="small" 
                  color="primary"
                  onClick={() => router.push(`/solve/${test.id}`)}
                  sx={studentButtonSx}
                >
                  <PlayArrow sx={studentIconSx} />
                  <span style={{ flexGrow: 1, textAlign: 'center' }}>{msg.TAKE_TEST}</span>
                </Button>
              )}
            </Stack>
          )
        }
      >
        <ListItemText 
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1">{test.title}</Typography>
              {!test.isPublished && isTeacher && (
                <Chip 
                  label={msg.UNPUBLISHED} 
                  size="small" 
                  sx={{ height: "20px", fontSize: "0.75rem", bgcolor: "#9e9e9e", color: "white" }} 
                />
              )}
            </Box>
          } 
          secondary={test.summary} 
        />
      </ListItem>
      <Divider />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{test.title} - {msg.SUBMISSION_STATUS}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" color="success.main" sx={{ mt: 1 }}>{msg.SUBMITTED_STUDENTS} ({submittedStudents.length})</Typography>
          <List dense>
            {submittedStudents.map(s => (
              <MemberItem key={s.id} user={s} />
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="error.main">{msg.UNSUBMITTED_STUDENTS} ({classStudents.length - submittedStudents.length})</Typography>
          <List dense>
            {classStudents.filter(s => !submittedStudentIds.includes(s.id)).map(s => (
              <MemberItem key={s.id} user={s} />
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

function ClassDetailContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [classData, setClassData] = useState<ClassWithUsers | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const joinUrl = `${baseUrl}/join?classId=${classId}`;

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;
      const fetchedClass = await getClassByClassId(classId);
      if (fetchedClass) {
        const castedClass = fetchedClass as unknown as { id: string; name: string; icon: string | null; users: User[] };
        const clerkImages = await getClerkUsersImages(castedClass.users.map(u => u.id));
        
        const usersWithImages = castedClass.users.map(u => ({
          ...u,
          image: clerkImages.find(img => img.id === u.id)?.imageUrl
        }));

        setClassData({ ...castedClass, users: usersWithImages });
        const fetchedTests = await getTestByClass(classId);
        setTests(fetchedTests);
      }
    };
    if (isUserLoaded && classId) fetchData();
  }, [classId, isUserLoaded]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarOpen(true);
  };

  const teachers = useMemo(() => classData?.users.filter(u => u.role === 0) || [], [classData]);
  const students = useMemo(() => classData?.users.filter(u => u.role === 1) || [], [classData]);
  const isTeacher = useMemo(() => teachers.some(u => u.id === clerkUser?.id), [teachers, clerkUser]);

  if (!classId) return <Typography p={3}>{msg.ERROR_INVALID_URL}</Typography>;
  if (!classData) return <Typography p={3}>{msg.LOADING}</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={3} padding={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">{msg.CLASS_DETAILS}</Typography>
        {isTeacher && (
          <Button variant="contained" onClick={() => router.push(`/teacher/createClass?classId=${classId}`)}>
            {msg.MANAGE}
          </Button>
        )}
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>{msg.CLASS_INFO}</Typography>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={4}>
            <Box flex={1}>
              <Stack direction="row" spacing={3} alignItems="flex-start">
                <Avatar
                  variant="rounded"
                  src={classData.icon || undefined}
                  sx={{ width: 128, height: 128, bgcolor: stringToBrightColor(classData.name), fontSize: "3rem" }}
                >
                  {classData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h4" gutterBottom>{classData.name}</Typography>
                  <Box display="flex" alignItems="center" bgcolor="#f5f5f5" px={2} py={0.5} borderRadius={1} width="fit-content">
                    <Typography variant="body2" color="textSecondary" mr={1}>{msg.CLASS_ID}: {classData.id}</Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(classData.id)}><ContentCopy fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {isTeacher && (
              <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>{msg.INVITATION_QR}</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Paper variant="outlined" sx={{ p: 1.5, display: 'inline-block' }}>
                    <QRCodeCanvas value={joinUrl} size={100} />
                  </Paper>
                  <Box flex={1} width="100%">
                    <Typography variant="caption" color="textSecondary" gutterBottom>{msg.INVITATION_URL}</Typography>
                    <Box display="flex" alignItems="center" gap={1} bgcolor="#f5f5f5" p={1} borderRadius={1}>
                      <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{joinUrl}</Typography>
                      <IconButton onClick={() => copyToClipboard(joinUrl)}><ContentCopy fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Assignment color="primary" />
                  <Typography variant="h6">{msg.TEST_LIST}</Typography>
                </Stack>
                {isTeacher && (
                  <Button variant="contained" size="small" color="secondary" onClick={() => router.push(`/teacher/createTest?classId=${classId}`)}>
                    {msg.CREATE_TEST}
                  </Button>
                )}
              </Stack>
              <Divider />
              <List>
                {tests.length === 0 && <Typography variant="body2" color="textSecondary" py={2}>{msg.NO_TESTS_IN_CLASS}</Typography>}
                {tests.map((test) => (
                  <TestItem key={test.id} test={test} isTeacher={isTeacher} classStudents={students} userId={clerkUser?.id || ""} />
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <People color="primary" />
                <Typography variant="h6">{msg.MEMBERS}</Typography>
              </Stack>
              <Typography variant="subtitle2" color="textSecondary" mt={2} gutterBottom>{msg.TEACHER_SECTION} ({teachers.length})</Typography>
              <List dense>
                {teachers.map(u => (<MemberItem key={u.id} user={u} />))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>{msg.STUDENT_SECTION} ({students.length})</Typography>
              <List dense sx={{ maxHeight: "100%", overflow: 'auto' }}>
                {students.map(u => (<MemberItem key={u.id} user={u} />))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} message={msg.COPIED} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}

export default function ClassDetailPage() {
  return (
    <Suspense fallback={<div>{msg.LOADING}</div>}>
      <ClassDetailContent />
    </Suspense>
  );
}