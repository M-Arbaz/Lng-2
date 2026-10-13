export async function uploadToXcdn(file, folder) {
    if (!file) throw new Error('No file selected')
    if (!folder) throw new Error('Upload folder is required')

    const body = new FormData()
    body.append('folder', folder)
    body.append('file', file)

    const response = await fetch('/api/xcdn/upload', {
        method: 'POST',
        body,
    })

    let data

    try {
        data = await response.json()
    } catch {
        throw new Error(`Upload server returned HTTP ${response.status}`)
    }

    if (!response.ok || !data?.success || !data?.file?.url) {
        throw new Error(
            data?.message || `Upload failed with HTTP ${response.status}`
        )
    }

    return data.file.url
}

export default uploadToXcdn