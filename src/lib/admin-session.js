import 'server-only'

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'admin_session'

export async function getAdminSession() {
    try {
        const secret = process.env.JWT_SECRET

        if (!secret || secret.length < 32) {
            return null
        }

        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value

        if (!token) {
            return null
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
            {
                algorithms: ['HS256'],
                issuer: 'lamp-glow-admin',
                audience: 'lamp-glow-admin',
            }
        )

        const adminEmail = process.env.ADMIN_EMAIL
            ?.trim()
            .toLowerCase()

        if (
            !adminEmail ||
            payload.role !== 'admin' ||
            payload.email !== adminEmail
        ) {
            return null
        }

        return {
            id: 'admin-001',
            email: adminEmail,
            displayName: 'Admin',
            role: 'admin',
        }
    } catch {
        // Missing, expired, invalid or incorrectly signed session.
        return null
    }
}