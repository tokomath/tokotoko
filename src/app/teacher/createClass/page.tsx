"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Divider,
  Avatar,
  Stack
} from "@mui/material";
import { Clear, Upload } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { TeacherGuard } from "@/lib/guard";
import { msg } from "@/msg-ja";

const stringToBrightColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
};

export default function DualRoleUserSelectors() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [className, setClassName] = useState<string>("");
  const [icon, setIcon] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  
  const { user: clerkUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allAddedUsers = useMemo(() => [...teachers, ...students], [teachers, students]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (classId) {
        setIsEditMode(true);
        const classData = await getClassByClassId(classId);
        if (classData) {
          setClassName(classData.name);
          if (classData.icon) setIcon(classData.icon);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 128, 128);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          setIcon(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveIcon = () => {
    setIcon(null);
  };

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
      icon: icon,
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
            <Stack direction="row" spacing={3} alignItems="center">
              <Box position="relative">
                <Avatar
                  src={icon || undefined}
                  sx={{
                    width: 128,
                    height: 128,
                    bgcolor: !icon && className ? stringToBrightColor(className) : "#e0e0e0",
                    fontSize: "3rem",
                  }}
                >
                  {!icon && className ? className.charAt(0).toUpperCase() : ""}
                </Avatar>
                {icon && (
                  <IconButton
                    size="small"
                    onClick={handleRemoveIcon}
                    sx={{ position: "absolute", top: -8, right: -8, bgcolor: "white", boxShadow: 1 }}
                  >
                    <Clear sx={{ color: "red", fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
              <Box display="flex" flexDirection="column" gap={2} flex={1}>
                <TextField
                  fullWidth
                  value={className}
                  label={msg.CLASS_NAME}
                  onChange={(e) => setClassName(e.target.value)}
                />
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {msg.UPLOAD_ICON}
                  </Button>
                </Box>
              </Box>
            </Stack>
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