"use server"
import {prisma} from "@/app/api/prisma_client";

export async function register(id: string){
  const a = await prisma.user.findUnique({where:{id: id}});
  if(a){
    return "Name"
  }
  /*
  let cls = await prisma.class.findUnique({where:{name:"everyone"}})
  if(!cls){
    cls = await prisma.class.create({data:{name: "everyone"}});
  }
  */

  const b = await prisma.user.create({data:{id:id, name:"",role: 1}})//, classes:{connect: {id: cls.id}}}});
  if(b){
    return "OK"
  }else{
    return "ERR"
  }
}