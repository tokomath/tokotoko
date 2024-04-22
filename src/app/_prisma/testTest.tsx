import {PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient()

export const testSend = async () => {
    let test: Prisma.TestCreateInput

    // Check if posts should be included in the query
    test = {
        summary: 'elsa@prisma.io',
    }

    // Pass 'user' object into query
    const createTest = await prisma.test.create({data: test})
};

export const deleteTest = () => {

    // Check if posts should be included in the query
    // Pass 'user' object into query
    const deleteTest = prisma.test.deleteMany({
        where: {
            summary: {
                contains: 'elsa@prisma.io',
            },
        },
    })
};
