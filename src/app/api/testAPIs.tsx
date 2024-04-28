"use server"

import {Question, Test, Section, SubSection, SubSubSection, Prisma} from "@prisma/client";
import {prisma} from "@/app/api/prsima_client"

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
  await prisma.test.create({data: test})
}

export const removeTest = async (props: DeleteTestProps) => {
  await prisma.section.findMany({
    where: {
      testId: props.id,
    },
    select: {
      id: true,
    }
  }).then(
    section => {
      section.map(s => {
        return (
          prisma.subSection.findMany({
            where: {
              sectionId: s.id
            },
            select: {
              id: true
            }
          })
        )
      }).map(value => {
        value.then(async subsection => {
          await prisma.subSubSection.deleteMany({
            where: {
              subSectionId: {
                in: subsection.map(s => {
                  return s.id
                })
              }
            }
          }).then(
            async () => {
              await prisma.subSection.deleteMany({
                where: {
                  sectionId: {
                    in: section.map(i => {
                      return i.id
                    })
                  }
                }
              }).then(
                async _ => {
                  await prisma.section.deleteMany({
                    where: {
                      testId: props.id
                    }
                  }).then(
                    async _ => {
                      await prisma.test.deleteMany({
                        where: {id: props.id}
                      });
                    }
                  )
                }
              )
            }
          )
        })
      })
    }
  )
}

export const getTest = async () => {
  const test: Test[] = await prisma.test.findMany({});
  console.log(test)
  return test;
}