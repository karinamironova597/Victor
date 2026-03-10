import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File | null
    const email = formData.get('email') as string | null

    if (!file || !email) {
      return NextResponse.json({ error: 'Missing video or email' }, { status: 400 })
    }

    const safeEmail = email.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${safeEmail}-${Date.now()}.webm`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('test-recordings')
      .upload(fileName, buffer, { contentType: 'video/webm' })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('test-recordings')
      .getPublicUrl(fileName)

    return NextResponse.json({ videoUrl: urlData.publicUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
