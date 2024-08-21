import React from "react";
import {TeacherGuard} from "@/lib/guards/userGuard";

export default async function TeacherLayout({children}: { children: React.ReactNode }) {
  return (
    <TeacherGuard>{children}</TeacherGuard>
  )
}