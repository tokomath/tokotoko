import { cookies, headers } from "next/headers";
import { jaDict, enDict } from "@/msg-com";

const dicts = {
    ja: jaDict,
    en: enDict,
};

export const getLangServer = async (): Promise<"ja" | "en"> => {
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get("NEXT_LOCALE")?.value;
    
    if (cookieLang === "ja" || cookieLang === "en") {
        return cookieLang;
    }
    
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    
    if (acceptLanguage.toLowerCase().startsWith("ja")) {
        return "ja";
    }
    
    return "en";
};

export const getMsgServer = async () => {
    const lang = await getLangServer();
    return dicts[lang];
};