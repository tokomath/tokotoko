import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"; 
import { teacherAuth } from "@/app/api/auth/auth";

export default async function Page() {
  const { userId } = await auth(); 
  if (!userId) {
    redirect("/sign-in"); 
  }
  
  const isTeacher = await teacherAuth(userId);

  if (isTeacher) {
    redirect("/mypage/teacher");
  }

  redirect("/mypage/student");
}
