"use client";
import React, { createContext, useState, ReactNode } from "react";

export type Lang = "ja" | "en";
export const LangContext = createContext<Lang>("ja");

export const LangProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Lang>("ja");

    return (
        <LangContext.Provider value={lang}>
            {children}
        </LangContext.Provider>
    );
};