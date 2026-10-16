import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES =
    15 * 1024 * 1024

function normalizeInstagramUrl(value) {
    const raw =
        String(value || '').trim()

    if (!raw) {
        throw new Error(
            'Instagram URL is required.'
        )
    }

    let parsed

    try {
        parsed = new URL(raw)
    } catch {
        throw new Error(
            'Please enter a valid Instagram URL.'
        )
    }

    const hostname =
        parsed.hostname
            .toLowerCase()
            .replace(/^www\./, '')

    if (
        hostname !== 'instagram.com'
    ) {
        throw new Error(
            'Only Instagram URLs are supported.'
        )
    }

    const parts =
        parsed.pathname
            .split('/')
            .filter(Boolean)

    const type =
        parts[0]

    const shortcode =
        parts[1]

    if (
        ![
            'p',
            'reel',
            'reels',
            'tv',
        ].includes(type) ||
        !shortcode
    ) {
        throw new Error(
            'Please use an Instagram post or reel URL.'
        )
    }

    const normalizedType =
        type === 'reels'
            ? 'reel'
            : type

    return {
        url:
            `https://www.instagram.com/${normalizedType}/${shortcode}/`,

        type: normalizedType,

        shortcode,
    }
}

function decodeHtml(value) {
    return String(value || '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&#x2F;/gi, '/')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
}

function extractMetaContent(
    html,
    key
) {
    const escapedKey =
        key.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        )

    const patterns = [
        new RegExp(
            `<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`,
            'i'
        ),

        new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`,
            'i'
        ),
    ]

    for (const pattern of patterns) {
        const match =
            html.match(pattern)

        if (match?.[1]) {
            return decodeHtml(
                match[1]
            )
        }
    }

    return ''
}

function isAllowedMediaUrl(value) {
    try {
        const url =
            new URL(value)

        if (
            url.protocol !== 'https:'
        ) {
            return false
        }

        const hostname =
            url.hostname.toLowerCase()

        return (
            hostname ===
            'instagram.com' ||
            hostname.endsWith(
                '.instagram.com'
            ) ||
            hostname.endsWith(
                '.cdninstagram.com'
            ) ||
            hostname.endsWith(
                '.fbcdn.net'
            )
        )
    } catch {
        return false
    }
}

async function fetchImage(
    url
) {
    if (!isAllowedMediaUrl(url)) {
        throw new Error(
            'Instagram returned an unsupported image URL.'
        )
    }

    const response =
        await fetch(url, {
            redirect: 'follow',
            cache: 'no-store',

            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',

                Accept:
                    'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',

                'Accept-Language':
                    'en-US,en;q=0.9',
            },
        })

    if (!response.ok) {
        throw new Error(
            'Instagram preview image could not be downloaded.'
        )
    }

    const contentType =
        response.headers.get(
            'content-type'
        ) || ''

    if (
        !contentType.startsWith(
            'image/'
        )
    ) {
        throw new Error(
            'Instagram did not return an image preview.'
        )
    }

    const declaredLength =
        Number(
            response.headers.get(
                'content-length'
            ) || 0
        )

    if (
        declaredLength >
        MAX_IMAGE_BYTES
    ) {
        throw new Error(
            'Instagram preview image is too large.'
        )
    }

    const buffer =
        await response.arrayBuffer()

    if (
        buffer.byteLength >
        MAX_IMAGE_BYTES
    ) {
        throw new Error(
            'Instagram preview image is too large.'
        )
    }

    return {
        buffer,
        contentType,
    }
}

async function findInstagramImage({
    url,
    type,
    shortcode,
}) {
    const pageResponse =
        await fetch(url, {
            redirect: 'follow',
            cache: 'no-store',

            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',

                Accept:
                    'text/html,application/xhtml+xml',

                'Accept-Language':
                    'en-US,en;q=0.9',
            },
        })

    if (pageResponse.ok) {
        const html =
            await pageResponse.text()

        const previewUrl =
            extractMetaContent(
                html,
                'og:image'
            ) ||
            extractMetaContent(
                html,
                'twitter:image'
            )

        if (
            previewUrl &&
            isAllowedMediaUrl(
                previewUrl
            )
        ) {
            try {
                return await fetchImage(
                    previewUrl
                )
            } catch (error) {
                console.warn(
                    'Instagram meta preview failed:',
                    error
                )
            }
        }
    }

    /*
     * Best-effort fallback for public
     * Instagram media.
     */
    const directMediaUrl =
        `https://www.instagram.com/${type}/${shortcode}/media/?size=l`

    try {
        return await fetchImage(
            directMediaUrl
        )
    } catch {
        throw new Error(
            'Instagram could not provide a preview for this post. The post may be private or Instagram may be blocking preview access. Please upload a custom image instead.'
        )
    }
}

function extensionFromType(
    contentType
) {
    if (
        contentType.includes(
            'png'
        )
    ) {
        return 'png'
    }

    if (
        contentType.includes(
            'webp'
        )
    ) {
        return 'webp'
    }

    if (
        contentType.includes(
            'avif'
        )
    ) {
        return 'avif'
    }

    return 'jpg'
}

async function uploadToXcdn({
    buffer,
    contentType,
    shortcode,
}) {
    const xcdnBaseUrl = (
        process.env.XCDN_BASE_URL ||
        'https://xpcdn.lampandglow.pk'
    ).replace(/\/+$/, '')

    const uploadApiKey =
        process.env.XCDN_UPLOAD_API_KEY

    if (!uploadApiKey) {
        throw new Error(
            'XCDN_UPLOAD_API_KEY is not configured on the server.'
        )
    }

    const extension =
        extensionFromType(
            contentType
        )

    const blob =
        new Blob(
            [buffer],
            {
                type: contentType,
            }
        )

    const body =
        new FormData()

    body.append(
        'folder',
        'instagramGrid'
    )

    body.append(
        'file',
        blob,
        `instagram-${shortcode}-${Date.now()}.${extension}`
    )

    const response =
        await fetch(
            `${xcdnBaseUrl}/api/upload`,
            {
                method: 'POST',

                headers: {
                    'X-Upload-Key':
                        uploadApiKey,
                },

                body,

                cache: 'no-store',
            }
        )

    const raw =
        await response.text()

    let data

    try {
        data = JSON.parse(raw)
    } catch {
        data = null
    }

    if (
        !response.ok ||
        !data?.success ||
        !data?.file?.url
    ) {
        throw new Error(
            data?.message ||
            'Failed to save Instagram preview to XCDN.'
        )
    }

    return data.file.url
}

export async function POST(
    request
) {
    try {
        const body =
            await request.json()

        const instagram =
            normalizeInstagramUrl(
                body?.url
            )

        const image =
            await findInstagramImage(
                instagram
            )

        const imageUrl =
            await uploadToXcdn({
                ...image,

                shortcode:
                    instagram.shortcode,
            })

        return NextResponse.json({
            success: true,

            url:
                instagram.url,

            imageUrl,

            imageSource:
                'instagram-auto',
        })
    } catch (error) {
        console.error(
            'Instagram preview error:',
            error
        )

        return NextResponse.json(
            {
                success: false,

                message:
                    error?.message ||
                    'Instagram preview could not be fetched.',
            },
            {
                status: 422,
            }
        )
    }
}