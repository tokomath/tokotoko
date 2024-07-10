'use client'
import { signIn } from 'next-auth/react'
import {Box, Button, Input} from "@mui/material";
import {useState} from "react";

export default function Page() {

  const [name , setName] = useState('')
  const [pass, setPass] = useState('')

  const onSubmit = async (data: any) => {
    const result = await signIn('user', {
      redirect: false,
      username: name,
      password: pass
    })

    alert(JSON.stringify(result))
    if (result?.error) {
      // ログイン失敗時処理
    } else {
      // ログイン成功時トップページへリダイレクト
      location.href = '/'
    }
  }

  return (
    <Box>
      <Input onChange={(e) => {setName(e.target.value)}}/>
      <Input onChange={(e) => {setPass(e.target.value)}}/>
      <Button onClick={onSubmit}>submit</Button>
    </Box>
  )
}