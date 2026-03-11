import ValidationForm from '@/components/ValidationForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Валидация специалистов по БиОТ',
  description: 'Подайте заявку на независимую оценку и подтверждение квалификации специалиста по безопасности и охране труда. Онлайн-тестирование с прокторингом, сертификат соответствия профстандартам РК.',
  keywords: [
    'валидация специалистов БиОТ',
    'аттестация охрана труда',
    'подтверждение квалификации',
    'сертификация специалистов Казахстан',
    'онлайн тестирование БиОТ',
    'профессиональный стандарт РК',
  ],
  alternates: {
    canonical: 'https://iqsafety.kz/validation',
  },
  openGraph: {
    title: 'Валидация специалистов по БиОТ | ПромКвалБиОТ',
    description: 'Подайте заявку на независимую оценку квалификации специалиста по безопасности и охране труда',
    url: 'https://iqsafety.kz/validation',
    type: 'website',
  },
}

export default function ValidationPage() {
  return (
    <>
      <h1 className="sr-only">Подача заявки на валидацию специалиста по безопасности и охране труда</h1>
      <ValidationForm />
    </>
  )
}
