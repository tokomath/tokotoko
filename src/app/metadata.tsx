import type { Metadata } from "next";
import { getMsgServer } from "@/lib/msg-server";

export async function generateMetadata(): Promise<Metadata> {
    const msg = await getMsgServer();

    return {
        title: msg.APP_NAME,
        description: "Numazu Mathematics Assignment Submission and Communication Hub",
    };
}