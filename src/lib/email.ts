// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

type ApplicationEmailData = {
  applicationId: string
  fullName: string
  companyName: string
  email: string
  position: string
  documents: Array<{
    name: string
    url: string
    size: number
  }>
  createdAt: string
}

export async function sendAdminNotification(data: ApplicationEmailData) {
  const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/application/approve?id=${data.applicationId}`
  const rejectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/application/reject?id=${data.applicationId}`
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${data.applicationId}`

  const documentsList = data.documents.map((doc, idx) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${idx + 1}. ${doc.name}</strong><br>
        <span style="color: #666; font-size: 14px;">${(doc.size / 1024 / 1024).toFixed(2)} МБ</span><br>
        <a href="${doc.url}" style="color: #F59E0B; text-decoration: none; font-weight: 500;">
          📥 Скачать
        </a>
      </td>
    </tr>
  `).join('')

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                    📋 Новая заявка на валидацию
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="border-bottom: 3px solid #F59E0B; padding-bottom: 10px; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                          👤 Данные специалиста
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #6b7280; font-weight: 500; width: 40%;">ФИО:</td>
                            <td style="color: #1f2937; font-weight: 600;">${data.fullName}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-weight: 500;">Компания:</td>
                            <td style="color: #1f2937; font-weight: 600;">${data.companyName}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-weight: 500;">Email:</td>
                            <td style="color: #1f2937; font-weight: 600;">${data.email}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-weight: 500;">Специализация:</td>
                            <td style="color: #1f2937; font-weight: 600;">${data.position}</td>
                          </tr>
                          <tr>
                            <td style="color: #6b7280; font-weight: 500;">Дата подачи:</td>
                            <td style="color: #1f2937; font-weight: 600;">${new Date(data.createdAt).toLocaleString('ru-RU')}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="border-bottom: 3px solid #F59E0B; padding-bottom: 10px; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                          📎 Документы (${data.documents.length} файлов)
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                          ${documentsList}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-bottom: 3px solid #F59E0B; padding-bottom: 10px; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                          ✅ Действия
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0; text-align: center;">
                        <a href="${approveUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                          ✅ Допуск к валидации
                        </a>
                        <br>
                        <a href="${rejectUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                          ❌ Отклонить заявку
                        </a>
                        <br>
                        <a href="${viewUrl}" style="display: inline-block; color: #6b7280; text-decoration: underline; margin-top: 15px; font-size: 14px;">
                          Посмотреть в админ-панели →
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    ID заявки: <strong>#${data.applicationId}</strong>
                  </p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                    PromKvalBIOT | Система валидации специалистов
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'PromKvalBIOT <onboarding@resend.dev>',
      to: [process.env.NEXT_PUBLIC_ADMIN_EMAIL!],
      subject: `📋 Новая заявка на валидацию: ${data.fullName}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Ошибка отправки email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Ошибка отправки email:', error)
    return { success: false, error }
  }
}

export async function sendApprovalEmail(email: string, fullName: string) {
  const testUrl = `${process.env.NEXT_PUBLIC_APP_URL}/validation/test?email=${encodeURIComponent(email)}`
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #10b981; padding: 30px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; }
        .content { padding: 40px; }
        .content p { font-size: 16px; color: #1f2937; line-height: 1.6; margin-bottom: 15px; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(245,158,11,0.4); }
        .info-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-top: 30px; border-radius: 4px; }
        .info-box p { margin: 0; font-size: 14px; color: #065f46; line-height: 1.8; }
        .footer { font-size: 14px; color: #6b7280; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Заявка одобрена!</h1>
        </div>
        <div class="content">
          <p>Здравствуйте, <strong>${fullName}</strong>!</p>
          
          <p>Ваша заявка на валидацию специалиста по БиОТ была <strong>одобрена</strong>!</p>
          
          <p>Вы допущены к процедуре валидации. Для подтверждения квалификации необходимо пройти тестирование.</p>
          
          <div class="btn-container">
            <a href="${testUrl}" class="btn">
              🎯 Пройти тестирование
            </a>
          </div>
          
          <div class="info-box">
            <p>
              <strong>ℹ️ Информация о тесте:</strong><br>
              • Количество вопросов: 20<br>
              • Время прохождения: 30 минут<br>
              • Минимальный проходной балл: 80% (16 из 20)<br>
              • Прокторинг: камера и полноэкранный режим обязательны
            </p>
          </div>
          
          <p class="footer">
            С уважением,<br>
            Команда PromKvalBIOT
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: 'PromKvalBIOT <onboarding@resend.dev>',
    to: [email],
    subject: '✅ Ваша заявка одобрена - Пройдите тестирование',
    html: emailHtml,
  })
}

export async function sendRejectionEmail(email: string, fullName: string, reason?: string) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="background-color: #ef4444; padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">❌ Заявка отклонена</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
              Здравствуйте, <strong>${fullName}</strong>!
            </p>
            <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
              К сожалению, ваша заявка на валидацию специалиста по БиОТ была <strong>отклонена</strong>.
            </p>
            ${reason ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Причина:</strong></p>
                <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason}</p>
              </div>
            ` : ''}
            <p style="font-size: 16px; color: #1f2937; line-height: 1.6;">
              Вы можете исправить недочёты и подать заявку повторно.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              С уважением,<br>
              Команда PromKvalBIOT
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  await resend.emails.send({
    from: 'PromKvalBIOT <onboarding@resend.dev>',
    to: [email],
    subject: '❌ Ваша заявка на валидацию отклонена',
    html: emailHtml,
  })
}

export async function sendTestResultEmail(
  applicantName: string,
  applicantEmail: string,
  score: number,
  total: number,
  passed: boolean,
  language: string,
  violationsCount?: number,
  videoUrl?: string
) {
  const percentage = Math.round((score / total) * 100)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${passed ? '#10b981' : '#ef4444'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .result-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${passed ? '#10b981' : '#ef4444'}; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: ${passed ? '#10b981' : '#ef4444'}; }
        .stat-label { font-size: 14px; color: #666; }
        .violation-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${passed ? '✅ Тест пройден' : '❌ Тест не пройден'}</h1>
        </div>
        <div class="content">
          <h2>Результаты тестирования специалиста</h2>
          
          <div class="result-box">
            <p><strong>Специалист:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> ${applicantEmail}</p>
            <p><strong>Язык теста:</strong> ${language === 'ru' ? 'Русский' : 'Казахский'}</p>
            <p><strong>Дата прохождения:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${score}/${total}</div>
              <div class="stat-label">Правильных ответов</div>
            </div>
            <div class="stat">
              <div class="stat-value">${percentage}%</div>
              <div class="stat-label">Результат</div>
            </div>
          </div>

          ${videoUrl ? (() => {
            const urls = videoUrl.split(' | ').filter(Boolean)
            const duration = urls.length
            const playerUrl = `https://iqsafety.kz/validation/test/player?email=${encodeURIComponent(applicantEmail)}`
            return `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #1e40af;">
                  <strong>🎥 ВИДЕОЗАПИСЬ ТЕСТА${duration > 1 ? ` (~${duration} мин)` : ''}:</strong>
                </p>
                <a href="${playerUrl}" target="_blank"
                   style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  📹 Посмотреть видео
                </a>
              </div>`
          })() : ''}

          ${violationsCount !== undefined && violationsCount > 0 ? `
            <div class="violation-box">
              <p style="margin: 0; color: #991b1b;">
                <strong>⚠️ ПРОКТОРИНГ:</strong> Зафиксировано нарушений: <strong>${violationsCount}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 14px;">
                Возможные нарушения: смена вкладки, выход из полного экрана, попытки копирования
              </p>
            </div>
          ` : violationsCount === 0 ? `
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0; color: #065f46;">
                <strong>✅ ПРОКТОРИНГ:</strong> Нарушений не зафиксировано
              </p>
            </div>
          ` : ''}

          ${passed ? `
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #065f46;"><strong>✨ Рекомендация:</strong> Специалист успешно прошёл тестирование и может получить сертификат.</p>
            </div>
          ` : `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #991b1b;"><strong>⚠️ Внимание:</strong> Специалист не набрал минимальный проходной балл (80%).</p>
            </div>
          `}

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Это автоматическое уведомление от системы валидации специалистов PromKvalBIOT
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const result = await resend.emails.send({
      from: 'PromKvalBIOT <onboarding@resend.dev>',
      to: [process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'karina.mironova.597@gmail.com'],
      subject: `${passed ? '✅ Тест пройден' : '❌ Тест не пройден'} - ${applicantName}${violationsCount && violationsCount > 0 ? ` [⚠️ ${violationsCount} нарушений]` : ''}${videoUrl ? ' [🎥 Видео]' : ''}`,
      html
    })
    
  } catch (error) {
    console.error('Resend ошибка:', error)
    throw error
  }
}