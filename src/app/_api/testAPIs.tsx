"use server"

import {Question, Test, Section, SubSection, SubSubSection} from "@prisma/client";

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

export const createTest = async (props: TestFrame) => {
    const url = 'http://localhost:3000/api/createTest'

    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(props),
    };

    await fetch(url, params);
}

export const removeTest = async (props: Test) => {
    const url = '/api/removeTest'

    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(props),
    };

    await fetch(url, params);
}
