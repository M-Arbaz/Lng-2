"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function login(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    // Server-side comparison — password client ko kabhi nahi jata
    if (
        email !== process.env.ADMIN_EMAIL ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return { error: "Invalid credentials" };
    }

    // JWT session token banayein (1 din ke liye valid)
    const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(secret);

    // httpOnly cookie set karein — JS se read nahi ho sakti
    (await cookies()).set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 din
    });

    redirect("/admin");
}