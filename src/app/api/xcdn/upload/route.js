import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_PRODUCT_FOLDERS = new Set([
    'products',
    'product-videos',
    'color-variants',
    'shade-colors',
    'profile-images',
    'hero-banners',
    'heroBanners'
])

function getAllowedOrigins() {
    const origins = new Set([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ])

    const configured = [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.SITE_URL,
        ...(process.env.XCDN_ALLOWED_ORIGINS || '').split(','),
    ]
        .map((value) => value?.trim())
        .filter(Boolean)

    for (const value of configured) {
        try {
            origins.add(new URL(value).origin)
        } catch {
            // ignore invalid optional origins
        }
    }

    return origins
}

export async function POST(request) {
    const xcdnBaseUrl = (
        process.env.XCDN_BASE_URL ||
        'https://xpcdn.lampandglow.pk'
    ).replace(/\/+$/, '')

    const uploadApiKey =
        process.env.XCDN_UPLOAD_API_KEY

    if (!uploadApiKey) {
        return NextResponse.json(
            {
                success: false,
                message:
                    'XCDN_UPLOAD_API_KEY is not configured on the Next.js server.',
            },
            { status: 500 }
        )
    }

    const origin =
        request.headers.get('origin')

    if (
        origin &&
        !getAllowedOrigins().has(origin)
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Origin not allowed.',
            },
            { status: 403 }
        )
    }

    try {
        const incoming =
            await request.formData()

        const file =
            incoming.get('file')

        const folder =
            incoming.get('folder')

        if (
            !file ||
            typeof file === 'string'
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No file received.',
                },
                { status: 400 }
            )
        }

        if (
            typeof folder !== 'string' ||
            !ALLOWED_PRODUCT_FOLDERS.has(folder)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Invalid product upload folder.',
                },
                { status: 400 }
            )
        }

        const outgoing =
            new FormData()

        outgoing.append(
            'folder',
            folder
        )

        outgoing.append(
            'file',
            file,
            file.name || 'upload'
        )

        const xcdnResponse =
            await fetch(
                `${xcdnBaseUrl}/api/upload`,
                {
                    method: 'POST',

                    headers: {
                        'X-Upload-Key':
                            uploadApiKey,
                    },

                    body: outgoing,

                    cache: 'no-store',
                }
            )

        const raw =
            await xcdnResponse.text()

        let payload

        try {
            payload =
                JSON.parse(raw)
        } catch {
            payload = {
                success: false,
                message:
                    raw ||
                    'Invalid response from XCDN server.',
            }
        }

        return NextResponse.json(
            payload,
            {
                status:
                    xcdnResponse.status,
            }
        )

    } catch (error) {

        console.error(
            'XCDN product upload proxy error:',
            error
        )

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    'Upload failed.',
            },
            { status: 500 }
        )
    }
}