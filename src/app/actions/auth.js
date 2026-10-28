'use server'

import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const COOKIE_NAME = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24

function getJwtSecret() {
    const value = process.env.JWT_SECRET

    if (!value || value.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters.')
    }

    return new TextEncoder().encode(value)
}

export async function login(formData) {
    const email = String(formData.get('email') || '')
        .trim()
        .toLowerCase()

    // Password ko trim nahi karna: spaces password ka hissa ho sakti hain.
    const password = String(formData.get('password') || '')

    const adminEmail = process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase()

    const adminPassword = process.env.ADMIN_PASSWORD

    if (
        !adminEmail ||
        !adminPassword ||
        !process.env.JWT_SECRET ||
        process.env.JWT_SECRET.length < 32
    ) {
        console.error('Admin authentication environment is not configured.')
        return {
            error: 'Admin login is not configured. Contact the site administrator.',
        }
    }

    if (email !== adminEmail || password !== adminPassword) {
        return { error: 'Invalid admin email or password.' }
    }

    try {
        const token = await new SignJWT({
            role: 'admin',
            email: adminEmail,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('lamp-glow-admin')
            .setAudience('lamp-glow-admin')
            .setExpirationTime('1d')
            .sign(getJwtSecret())

        const cookieStore = await cookies()

        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_TTL_SECONDS,
        })

        return { success: true }
    } catch (error) {
        console.error('Admin session creation failed:', error)

        return {
            error: 'Unable to sign in right now. Please try again.',
        }
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)

    return { success: true }
}