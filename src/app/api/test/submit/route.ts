import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTestResultEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, lang, score, totalQuestions, answers, violationsCount, videoUrl } = body

    // Ищем заявку
    const { data: applications } = await supabase
      .from('applications')
      .select('id, full_name, email')
      .eq('email', email)

    const application = applications?.[0]
    if (!application) {
      return NextResponse.json({ error: 'Application not found for email: ' + email }, { status: 404 })
    }

    // Удаляем старые результаты
    await supabase
      .from('test_results')
      .delete()
      .eq('application_id', application.id)

    // Вставляем новый результат
    const passed = score >= 16
    const { data: insertedResult, error: insertError } = await supabase
      .from('test_results')
      .insert({
        application_id: application.id,
        language: lang,
        score,
        total_questions: totalQuestions,
        answers,
        violations_count: violationsCount
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Insert failed: ' + insertError.message }, { status: 500 })
    }

    // Сохраняем video_url если есть
    if (videoUrl && insertedResult) {
      await supabase
        .from('test_results')
        .update({ video_url: videoUrl })
        .eq('id', insertedResult.id)
    }

    // Отправляем email
    try {
      await sendTestResultEmail(
        application.full_name,
        application.email,
        score,
        totalQuestions,
        passed,
        lang,
        violationsCount,
        videoUrl
      )
    } catch (e) {
      console.error('Email send error:', e)
    }

    return NextResponse.json({
      success: true,
      resultId: insertedResult.id,
      applicationName: application.full_name
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Submit error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
