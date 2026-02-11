import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "auth-debug.log");

function log(msg: string) {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
}

log("Route file loaded");

export const GET = (request: Request) => {
    log(`GET ${request.url}`);
    if (request.url.includes("test-auth-route")) {
        return NextResponse.json({ message: "Auth Route Works!" });
    }
    return toNextJsHandler(auth).GET(request);
};

export const POST = async (request: Request) => {
    log(`POST ${request.url}`);
    try {
        const body = await request.clone().text();
        log(`Body: ${body}`);
        const response = await toNextJsHandler(auth).POST(request);
        log(`Response Status: ${response.status}`);
        return response;
    } catch (e: any) {
        log(`Error: ${e.message}`);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
