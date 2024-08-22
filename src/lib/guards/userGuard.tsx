"use client"
import {ReactNode, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {studentAuth, teacherAuth} from "@/app/api/auth/auth";

export const StudentGuard = ({children}: any) => {
  const {data: session, status} = useSession()
  const router = useRouter()
  if (session && session.user.name) {
    studentAuth(session.user.name).then((ok) => {
      if (ok) {
        return <>{children}</>
      } else {
        alert("a")
        router.push('/')
        return null
      }
    })
  }
  router.push('/')
  return null
}
export const TeacherGuard = ({children}: any) => {
  const {data: session, status} = useSession()
  const router = useRouter()
  const [auth, setAuth] = useState("loading")

  useEffect(() => {
    const f = async () => {
      if (session && session.user.name) {
        const ok = await teacherAuth(session.user.name)
        if (ok) {
          setAuth("ok")
        } else {
          setAuth("ng")
        }
      }
    }
    f()
  }, [session])

  if (status === "loading")
    return <>loading...</>
  if (status === "unauthenticated")
    return <>error</>

  if(auth === "loading")
    return <></>
  if(auth === "ok")
    return <>{children}</>
  if(auth === "ng"){
    router.push("/")
    return null
  }
}