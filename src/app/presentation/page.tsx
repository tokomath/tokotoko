"use client"
import {Box, Button, Card, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {register} from "@/app/api/presentation/register";
import Stack from "@mui/material/Stack";
import {signIn } from "next-auth/react";

export default function Page() {
  const [name, setName] = useState("")
  const [pass, setPass] = useState("")
  const [ok, setOk] = useState(false)

  const router = useRouter()

  const submit = async () => {
    const a = await register(name,pass)
    if(a === "Name"){
      alert("その名前はすでに使われています")
    }else if(a === "OK"){
      setOk(true)
    }else{
    }
  }

  if (ok) {
    return router.push("/mypage")
  }
  return <Box margin={3}>
    <Typography variant="h2" color="textSecondary">発表用ページ</Typography>
    <Card>
      <Stack gap={2} padding={2}>
      <Typography variant="h5" color="textSecondary">アカウントを作成</Typography>
      <Typography variant="body2" color="textSecondary">※名前は重複不可</Typography>
      <TextField label="Name" variant="outlined" onChange={(e) => setName(e.target.value)} value={name}/>
      <TextField label="Pass" variant="outlined" onChange={(e) => setPass(e.target.value)} value={pass}/>
      <Button onClick={submit} variant="contained">作成</Button>
      </Stack>
    </Card>
  </Box>;
}