"use client"
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentAuth, teacherAuth } from "@/app/api/auth/auth";
import { useUser } from '@clerk/nextjs'

export const StudentGuard = ({ children }: any) => {
    const { user, isSignedIn } = useUser();
    const router = useRouter()
    const [auth, setAuth] = useState("loading")

    useEffect(() => {
        const f = async () => {
            if (isSignedIn && user.id) {
                const ok = await studentAuth(user.id)
                if (ok) {
                    setAuth("ok")
                } else {
                    setAuth("ng")
                }
            } else {
                setAuth("ng")
            }
        }
        f()
    }, [isSignedIn, user])

    if (auth === "ok")
        return <>{children}</>
    if (auth === "ng") {
        router.push('/')
        return null
    }
    return null // Loading state
}
export const TeacherGuard = ({ children }: any) => {
    const { user, isSignedIn } = useUser();    const router = useRouter()
    const [auth, setAuth] = useState("loading")

    useEffect(() => {
        const f = async () => {
            if (isSignedIn && user.id) {
                const ok = await teacherAuth(user.id)
                if (ok) {
                    setAuth("ok")
                } else {
                    setAuth("ng")
                }
            }
        }
        f()
    }, [isSignedIn])

    if (auth === "ok")
        return <>{children}</>
    if (auth === "ng") {

        return <>Error:Login as a teacher</>
    }
}