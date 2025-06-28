"use client";

import React, { useState, useEffect } from 'react';
import { Class, User } from "@prisma/client";

import { getUsersFromQuery } from "@/app/api/User/getUsersFromQuery";
import { ClassFrame, createClass } from "@/app/api/class/createClass";
import { UserSelector } from "@/compornents/userSelector";
import {
  Button,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Clear } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { TeacherGuard } from "@/lib/guard"


export default function DualRoleUserSelectors() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [className, setClassName] = useState<string>("");
  const router = useRouter(); // ← 追加

  const createClassButtonFunction = () => {
    if (!className) {
      alert("クラス名を入力してください。");
      return;
    }
    if (teachers.length === 0) {
      alert("最低一人の教師を追加してください。");
      return;
    }
    const newClass: Class = {
      id: "", //自動生成されるため空文字
      name: className,
    };
    const users = teachers.concat(students);
    const data: ClassFrame = {
      class: newClass,
      user: users,
    };

    createClass(data);
    alert("Class Created");
    router.push("/mypage"); // クラス作成後にマイページへリダイレクト
  };

  const addUserToList = (
    list: User[],
    setList: React.Dispatch<React.SetStateAction<User[]>>,
    user: User
  ) => {
    if (list.find((u) => u.email === user.email)) return; // 重複排除
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
      <Box display="flex" flexDirection="column" gap={2} padding={2}>
        <TextField
          value={className}
          label={"Class Name"}
          onChange={(e) => {
            setClassName(e.target.value);
          }}
        />
        <Box display="flex" flexDirection="column" gap={2}>
          <h3>学生検索</h3>
          <UserSelector
            role={1}
            onAddUser={(user) => addUserToList(students, setStudents, user)}
          />
          <h4>追加された学生</h4>
          <ul>
            {students.map((user) => (
              <li key={user.email} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {user.name} ({user.email})
                <IconButton
                  onClick={() => removeUserFromList(students, setStudents, user.email)}
                  style={{ marginLeft: "auto", cursor: "pointer" }}
                  aria-label={`Delete ${user.name}`}
                >
                  <Clear sx={{ color: "red" }} />
                </IconButton>
              </li>
            ))}
          </ul>
        </Box>

        {/* Role 1 */}
        <Box display={"flex"} flexDirection={"column"} gap={2}>
          <h3>教師検索</h3>
          <UserSelector
            role={0}
            onAddUser={(user) => addUserToList(teachers, setTeachers, user)}
          />
          <h4>追加された教師一覧</h4>
          <ul>
            {teachers.map((user) => (
              <li key={user.email} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {user.name} ({user.email})
                <IconButton
                  onClick={() => removeUserFromList(teachers, setTeachers, user.email)}
                  style={{ marginLeft: "auto", cursor: "pointer" }}
                  aria-label={`Delete ${user.name}`}
                >
                  <Clear sx={{ color: "red" }} />
                </IconButton>
              </li>
            ))}
          </ul>
        </Box>
        <Button variant={"contained"} onClick={createClassButtonFunction}>
          クラスを作成
        </Button>
      </Box>
    </TeacherGuard>
  );
}