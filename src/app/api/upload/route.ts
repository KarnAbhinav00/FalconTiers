import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const filename = `${uuidv4()}-${file.name}`
        const uploadDir = join(process.cwd(), 'public', 'uploads')

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignored
        }

        const path = join(uploadDir, filename)
        await writeFile(path, buffer)

        return NextResponse.json({ imageUrl: `/uploads/${filename}` })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
