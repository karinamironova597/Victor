import { NextResponse } from 'next/server'
import { sendTestResultEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { applicantName, applicantEmail, score, total, passed, language, violationsCount, videoUrl } = body

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY не настроен' }, { status: 500 })
    }

    await sendTestResultEmail(
      applicantName,
      applicantEmail,
      score,
      total,
      passed,
      language,
      violationsCount,
      videoUrl
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Ошибка отправки email:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
