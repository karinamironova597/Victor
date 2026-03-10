import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendRejectionEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const reason = searchParams.get('reason')

  if (!id) {
    return NextResponse.json({ error: 'Missing application ID' }, { status: 400 })
  }

  try {
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    if (application.status !== 'pending') {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Заявка уже обработана</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6; }
            .container { background: white; padding: 50px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #f59e0b; font-size: 28px; margin: 0 0 20px 0; }
            p { color: #6b7280; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Заявка уже обработана</h1>
            <p>Статус: <strong>${application.status === 'approved' ? '✅ Одобрена' : '❌ Отклонена'}</strong></p>
            <p style="margin-top:20px;font-size:14px;color:#9ca3af;">Это окно можно закрыть.</p>
          </div>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'rejected',
        admin_comment: reason || 'Не указана',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    await sendRejectionEmail(application.email, application.full_name, reason || undefined)

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Заявка отклонена</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; padding: 60px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 500px; }
          h1 { color: #ef4444; font-size: 36px; margin: 0 0 20px 0; }
          p { color: #6b7280; font-size: 18px; line-height: 1.6; }
          .icon { font-size: 80px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Заявка отклонена</h1>
          <p>Специалист <strong>${application.full_name}</strong> получил уведомление об отклонении заявки.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">Это окно можно закрыть.</p>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

  } catch (error) {
    console.error('Error rejecting application:', error)
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 })
  }
}