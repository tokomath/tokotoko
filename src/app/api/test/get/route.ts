import {NextResponse, NextRequest} from "next/server";
import {Question, Test, Section, SubSection, Prisma} from "@prisma/client";
import {prisma} from "@/app/api/prisma_client"

export async function POST(request: NextRequest) {
  const info = await request.json();
  // todo need to check user has access
  const id = info.id;
  try {
    const test = await prisma.test.findUnique({ where: { id: id },include: {sections: {include: {subSections: {include: {questions : true}}}}} });
    return NextResponse.json(test);
  } catch (e) {
    return NextResponse.json({message: e}, {status: 500});
  }
}
