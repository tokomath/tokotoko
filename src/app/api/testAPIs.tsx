"use server"

import {Question, Test, Section, SubSection, SubSubSection, Prisma} from "@prisma/client";
import {PrismaClient} from '@prisma/client'

export interface TestFrame {
    test: Test,
    questions: Question[],
    sections: SectionFrame[],
}

export interface SectionFrame {
    section: Section,
    subSections: SubSectionFrame[],
    questions: Question[],
}

export interface SubSectionFrame {
    subSection: SubSection,
    subSubSections: SubSubSectionFrame[],
    questions: Question[],
}

export interface SubSubSectionFrame {
    subSubSection: SubSubSection,
    questions: Question[],
}

export interface DeleteTestProps {
    id: number,
}

export const createTest = async (props: TestFrame) => {
    const prisma = new PrismaClient()
    let test: Prisma.TestCreateInput = {
        summary: props.test.summary,
        questions: {
            create: props.questions.map(question => {
                return {
                    question: question.question,
                    answer: question.answer,
                }
            })
        },
        sections: {
            create: props.sections.map(section => {
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
}

export const removeTest = async (props: DeleteTestProps) => {
    const prisma = new PrismaClient()
    console.log(props)
    await prisma.test.deleteMany({
        where: {id: props.id}
    });
}

export const getTest = async () => {
    console.log('getTest')
    const prisma = new PrismaClient()
    const test = await prisma.test.findMany({});
    console.log(test)
    return test;
}