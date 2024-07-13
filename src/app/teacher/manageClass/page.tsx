"use client"

import {Box, Button, IconButton, ListItem, ListItemIcon, ListItemText, Stack, Tooltip, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import ClassIcon from '@mui/icons-material/Class';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import {Class} from "@prisma/client";
import {NumberInput} from "@mui/base/Unstable_NumberInput/NumberInput";
import AddIcon from "@mui/icons-material/Add";

import {getAllClass, getClassByUser} from "@/app/api/class/getClass";

export default function Page() {
  const YourClassList = () => {
    const [teacherId, setTeacherId] = useState<number>(1)
    const [classes, setClasses] = useState<Class[]>([])

    // TODO: get current teacherId
    useEffect(() => {
      const fetchClass = async () => {
        const tmpClassList = await getClassByUser(teacherId)
        // const tmpClassList = await getAllClass()
        setClasses(tmpClassList)
        console.log(tmpClassList)
      }

      fetchClass()
    }, [teacherId])

    console.log(classes)
    return (
      <Stack alignItems={"center"}>
        <Typography>
          Your Classes
        </Typography>
        <NumberInput
          value={teacherId}
          onChange={(_, e) => {
            setTeacherId(e === null ? 0 : e)
          }}
        />
        {classes.map((c: Class, i: number) => {
          return (
            <ListItem key={i}>
              <ListItemIcon>
                <ClassIcon/>
              </ListItemIcon>
              <ListItemText
                primary={c.name}
              />
              <Tooltip title={"add student"}>
                <IconButton>
                  <PersonAddAlt1Icon/>
                </IconButton>
              </Tooltip>
            </ListItem>
          )
        })}

        <ListItem>
          <Box width={"100%"} display={"flex"} justifyContent={"center"}>
            <Tooltip title={"create new class"}>
              <IconButton>
                <AddIcon/>
              </IconButton>
            </Tooltip>
          </Box>
        </ListItem>
      </Stack>
    )
  }

  return (
    <Stack>
      <Typography>
        create class
      </Typography>
      <YourClassList/>
    </Stack>
  )
}