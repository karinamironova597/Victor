'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

export default function TestLanguagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TestLanguageContent />
    </Suspense>
  )
}

function TestLanguageContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-6">
          <span className="text-4xl">📝</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Тестирование специалиста по БиОТ
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Выберите язык для прохождения теста
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href={`/validation/test/ru?email=${encodeURIComponent(email || '')}`}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">🇷🇺</div>
            <h2 className="text-2xl font-bold mb-2">Русский язык</h2>
            <p className="text-blue-100">Пройти тест на русском</p>
          </Link>

          <Link
            href={`/validation/test/kz?email=${encodeURIComponent(email || '')}`}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">🇰🇿</div>
            <h2 className="text-2xl font-bold mb-2">Қазақ тілі</h2>
            <p className="text-green-100">Қазақша тест тапсыру</p>
          </Link>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Информация о тесте</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Количество вопросов: 20</p>
            <p>• Время прохождения: 30 минут</p>
            <p>• Минимальный проходной балл: 80%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
