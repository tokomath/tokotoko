"use client"

import {
  Box,
  Button,
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
} from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ClassIcon from '@mui/icons-material/Class';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { Class, User } from "@prisma/client";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import AddIcon from "@mui/icons-material/Add";

import { getAllClass, getClassByUser } from "@/app/api/class/getClass";
import { getAllStudent } from "@/app/api/student/getStudent";

export default function Page() {
  return (
    <Stack>
      <Typography>
        create class
      </Typography>
      <YourClassList />
    </Stack>
  )
}

const YourClassList = () => {
  const { data: session, status } = useSession()

  const [teacherName, setTeacherName] = useState<string>(session?.user.name || "")
  const [classes, setClasses] = useState<Class[]>([])

  useEffect(() => {
    const fetchClass = async () => {
      const tmpClassList = await getClassByUser(teacherName)
      // const tmpClassList = await getAllClass()
      setClasses(tmpClassList)
    }

    fetchClass()
  }, [teacherName])

  const moveToCreateClass = () => {
    location.href = "createClass"
  }

  const AddStudentDialog = () => {
    const [studentList, setStudentList] = useState<User[]>([]);
    useEffect(() => {
      // fetch api list
      const fetchStudent = async () => {
        const res = await getAllStudent();
        setStudentList(res);
      };
      //function call
      fetchStudent();
    }, []);
    const StudentTable = () => {
      const [selectedStudent, setSelectedStudent] = useState<User[]>([]);
      const columns: GridColDef<(typeof studentList)[number]>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: "Name", width: 150 },
        {
          field: "role",
          headerName: "Role",
          type: "number",
          width: 110,
        },
      ]
      return (
        <DataGrid
          rows={studentList}
          columns={columns}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(RowId) => {
            const selectedUser = studentList.filter((s) => RowId.includes(s.id))
            setSelectedStudent(selectedUser)
          }}
        />
      )

    }
    return (
      <StudentTable />
    )
  }

  return (
    <Stack alignItems={"center"}>
      <Typography>
        {teacherName}&#39;s classes
      </Typography>
      {classes.map((c: Class, i: number) => {
        return (
          <ListItem key={i}>
            <ListItemIcon>
              <ClassIcon />
            </ListItemIcon>
            <ListItemText
              primary={c.name}
            />
            <Tooltip title={"add student"}>
              <IconButton >
                <PersonAddAlt1Icon />
              </IconButton>
            </Tooltip>
          </ListItem>
        )
      })}

      <ListItem>
        <Box width={"100%"} display={"flex"} justifyContent={"center"}>
          <Tooltip title={"create new class"}>
            <IconButton onClick={moveToCreateClass}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>
      <AddStudentDialog />
    </Stack>
  )
}
