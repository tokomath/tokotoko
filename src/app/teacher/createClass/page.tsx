"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Class, User } from "@prisma/client";
import { ClassFrame, createClass } from "@/app/api/class/createClass";
import { UserSelector } from "@/compornents/userSelector";
import { getClassByClassId } from "@/app/api/class/getClass";
import { addUserToClass } from "@/app/api/class/addUserToClass";
import { getUsersFromQuery } from "@/app/api/User/getUsersFromQuery";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  IconButton,
  TextField,
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";
import { Clear } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { TeacherGuard } from "@/lib/guard";
import { msg } from "@/msg-ja";

export default function DualRoleUserSelectors() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [className, setClassName] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  
  const { user: clerkUser } = useUser();

  const allAddedUsers = useMemo(() => [...teachers, ...students], [teachers, students]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (classId) {
        setIsEditMode(true);
        const classData = await getClassByClassId(classId);
        if (classData) {
          setClassName(classData.name);
          const classUsers = (classData as any).users as User[];
          if (classUsers) {
            setTeachers(classUsers.filter(u => u.role === 0));
            setStudents(classUsers.filter(u => u.role === 1));
          }
        }
      } else {
        const email = clerkUser?.primaryEmailAddress?.emailAddress;
        if (email && teachers.length === 0) {
          const users = await getUsersFromQuery(email, 0);
          if (users.length > 0) {
            setTeachers([users[0]]);
          }
        }
      }
    };
    fetchInitialData();
  }, [classId, clerkUser?.primaryEmailAddress?.emailAddress]);

  const handleSubmit = async () => {
    if (!className) {
      alert(msg.ERROR_NO_CLASS_NAME);
      return;
    }
    if (teachers.length === 0) {
      alert(msg.ERROR_NO_TEACHER);
      return;
    }

    const currentClass: Class = {
      id: classId || "",
      name: className,
    };
    
    const users = teachers.concat(students);
    const data: ClassFrame = {
      class: currentClass,
      user: users,
    };

    if (isEditMode) {
      await addUserToClass(data);
      alert(msg.SUCCESS_UPDATE);
    } else {
      await createClass(data);
      alert(msg.CLASS_CREATED);
    }
    
    router.push("/mypage");
  };

  const addUserToList = (
    list: User[],
    setList: React.Dispatch<React.SetStateAction<User[]>>,
    user: User
  ) => {
    if (list.find((u) => u.email === user.email)) return;
    setList([...list, user]);
  };

  const removeUserFromList = (
    list: User[],
    setList: React.Dispatch<React.SetStateAction<User[]>>,
    email: string
  ) => {
    setList(list.filter((u) => u.email !== email));
  };

  return (
    <TeacherGuard>
      <Box display="flex" flexDirection="column" gap={3} padding={3}>
        <Typography variant="h5" fontWeight="bold">
          {isEditMode ? msg.EDIT_CLASS : msg.CREATE_CLASS}
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>{msg.CLASS_INFO}</Typography>
            <TextField
              fullWidth
              value={className}
              label={msg.CLASS_NAME}
              onChange={(e) => setClassName(e.target.value)}
            />
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>{msg.TEACHER_SECTION}</Typography>
                <UserSelector
                  role={0}
                  onAddUser={(user) => addUserToList(teachers, setTeachers, user)}
                  excludeUsers={allAddedUsers}
                />
                <Box mt={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {msg.CURRENT_MEMBERS}
                  </Typography>
                  <List>
                    {teachers.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        {msg.NO_MEMBERS}
                      </Typography>
                    )}
                    {teachers.map((user) => (
                      <React.Fragment key={user.email}>
                        <ListItem
                          secondaryAction={
                            <IconButton edge="end" onClick={() => removeUserFromList(teachers, setTeachers, user.email)}>
                              <Clear sx={{ color: "red" }} />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={user.name} secondary={user.email} />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>{msg.STUDENT_SECTION}</Typography>
                <UserSelector
                  role={1}
                  onAddUser={(user) => addUserToList(students, setStudents, user)}
                  excludeUsers={allAddedUsers}
                />
                <Box mt={3}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {msg.CURRENT_MEMBERS}
                  </Typography>
                  <List>
                    {students.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        {msg.NO_MEMBERS}
                      </Typography>
                    )}
                    {students.map((user) => (
                      <React.Fragment key={user.email}>
                        <ListItem
                          secondaryAction={
                            <IconButton edge="end" onClick={() => removeUserFromList(students, setStudents, user.email)}>
                              <Clear sx={{ color: "red" }} />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={user.name} secondary={user.email} />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleSubmit} size="large">
            {isEditMode ? msg.UPDATE_CLASS : msg.CREATE_CLASS}
          </Button>
        </Box>
      </Box>
    </TeacherGuard>
  );
}