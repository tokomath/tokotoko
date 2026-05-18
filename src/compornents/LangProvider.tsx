"use client";
import React, { createContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Lang = "ja" | "en";
export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
    lang: "ja",
    setLang: () => {},
});

export const LangProvider = ({ children, initialLang }: { children: ReactNode; initialLang: Lang }) => {
    const [lang, setLangState] = useState<Lang>(initialLang);
    const router = useRouter();

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
        router.refresh(); 
    };

    return (
        <LangContext.Provider value={{ lang, setLang }}>
            {children}
        </LangContext.Provider>
    );
};