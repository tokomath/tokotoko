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
  DialogContent,
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
import { addUserToClass } from "@/app/api/class/addUserToClass";
import { ClassFrame } from "@/app/api/class/createClass";

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
  const [open, setOpen] = useState<boolean>(false)
  const [modifiedClass, setModifiedClass] = useState<Class | null>(null)
  const [studentList, setStudentList] = useState<User[]>([]);

  const handleClickOpen = (c: Class) => {
    setModifiedClass(c)
    setOpen(true);
  }
  const handleClose = () => {
    setOpen(false);
  }


  useEffect(() => {
    const fetchClass = async () => {
      const tmpClassList = await getClassByUser(teacherName)
      // const tmpClassList = await getAllClass()
      setClasses(tmpClassList)
    }

    const fetchStudent = async () => {
      const res = await getAllStudent();
      setStudentList(res);
    };
    fetchClass()
    fetchStudent();
  }, [teacherName])

  const moveToCreateClass = () => {
    location.href = "createClass"
  }

  const AddStudentDialog = () => {
    const StudentTable = () => {
      const [selectedStudent, setSelectedStudent] = useState<User[]>([]);
      const columns: GridColDef<(typeof studentList)[number]>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: "Name", width: 150 },
        //{
        //  field: "role",
        //  headerName: "Role",
        //  type: "number",
        //  width: 110,
        //},
      ]
      const addStudentHandler = () => {
        if (modifiedClass != null) {
          const tmp: ClassFrame = { class: modifiedClass, user: selectedStudent }
          addUserToClass(tmp)
          console.log(tmp)
        }
      }
      return (
        <Stack>

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
          <Button
            variant={"contained"}
            onClick={addStudentHandler}
          >
            Add
          </Button>
        </Stack>
      )

    }
    return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Add student
        </DialogTitle>
        <DialogContent>
          <StudentTable />
        </DialogContent>
      </Dialog>
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
              <IconButton onClick={() => { handleClickOpen(c) }}>
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
