import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server"; 
import { teacherAuth, studentAuth } from "@/app/api/auth/auth";

export default async function Page() {
  const { userId } = await auth(); 
  if (!userId) {
    redirect("/sign-in"); 
  }
  
  const isTeacher = await teacherAuth(userId);
  
  if (isTeacher) 
    redirect("/mypage/teacher");
  

  const isStudent = await studentAuth(userId);
  if(isStudent)
    redirect("/mypage/student");
}
