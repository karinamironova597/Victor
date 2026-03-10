import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendApprovalEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')


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

    // Проверяем что заявка ещё не обработана
    if (application.status !== 'pending') {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Заявка уже обработана</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f3f4f6;
            }
            .container {
              background: white;
              padding: 50px;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #f59e0b;
              font-size: 28px;
              margin: 0 0 20px 0;
            }
            p {
              color: #6b7280;
              font-size: 16px;
            }
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

    // Обновляем статус
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    await sendApprovalEmail(application.email, application.full_name)

    // Показываем страницу успеха
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Заявка одобрена</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          h1 {
            color: #10b981;
            font-size: 36px;
            margin: 0 0 20px 0;
          }
          p {
            color: #6b7280;
            font-size: 18px;
            line-height: 1.6;
            margin: 10px 0;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .success-box {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin-top: 30px;
            border-radius: 8px;
            text-align: left;
          }
          .success-box p {
            margin: 5px 0;
            color: #065f46;
            font-size: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Заявка одобрена!</h1>
          <p>Специалист <strong>${application.full_name}</strong> получил уведомление.</p>
          
          <div class="success-box">
            <p><strong>✉️ Email отправлен на:</strong></p>
            <p>${application.email}</p>
            <p style="margin-top: 15px;">Письмо содержит кнопку для прохождения тестирования.</p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
            Это окно можно закрыть
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })

  } catch (error) {
    console.error('❌ Ошибка одобрения заявки:', error)
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 })
  }
}
