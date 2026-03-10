import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { applicationId, fullName, companyName, email, position, documents, createdAt } = body

    if (!applicationId || !fullName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Отправляем email Виктору
    const result = await sendAdminNotification({
      applicationId,
      fullName,
      companyName,
      email,
      position,
      documents: documents || [],
      createdAt
    })

    if (!result.success) {
      console.error('Failed to send admin notification:', result.error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })

  } catch (error) {
    console.error('Error in notify-admin endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
