import React from "react";
import {TeacherGuard} from "@/lib/guards/userGuard";

export default async function TeacherLayout({children}: { children: React.ReactNode }) {
  return (
    <>
      <h1>Debug: TeacherLayout</h1>
      <TeacherGuard>{children}</TeacherGuard>
    </>
  )
}