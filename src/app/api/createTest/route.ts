"use server"
import {Prisma, PrismaClient} from '@prisma/client'
import {NextRequest} from "next/server";

import {TestFrame} from "@/app/_api/testAPIs";

export async function POST(req: NextRequest) {
    const rcvTest: TestFrame = await req.json()

    const prisma = new PrismaClient()
    let test: Prisma.TestCreateInput = {
        summary: rcvTest.test.summary,
        questions: {
            create: rcvTest.questions.map(question => {
                return {
                    question: question.question,
                    answer: question.answer,
                }
            })
        },
        sections: {
            create: rcvTest.sections.map(section => {
                return {
                    summary: section.section.summary,
                    questions: {
                        create: section.questions.map(question => {
                            return {
                                question: question.question,
                                answer: question.answer,
                            }
                        })
                    },
                    subSections: {
                        create: section.subSections.map(subSection => {
                            return {
                                summary: subSection.subSection.summary,
                                questions: {
                                    create: subSection.questions.map(question => {
                                        return {
                                            question: question.question,
                                            answer: question.answer,
                                        }
                                    })
                                },
                                subSubSections: {
                                    create: subSection.subSubSections.map(subSubSection => {
                                        return {
                                            summary: subSubSection.subSubSection.summary,
                                            questions: {
                                                create: subSubSection.questions.map(question => {
                                                    return {
                                                        question: question.question,
                                                        answer: question.answer,
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    }

    const createTest = await prisma.test.create({data: test,})
    console.log(rcvTest)

}