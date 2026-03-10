'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

export default function TestResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TestResult />
    </Suspense>
  )
}

function TestResult() {
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '20')
  const passed = searchParams.get('passed') === 'true'
  
  const percentage = Math.round((score / total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl w-full text-center">
        
        {passed ? (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6">
              <span className="text-6xl">✅</span>
            </div>
            
            <h1 className="text-4xl font-bold text-green-600 mb-4">
              Тест пройден успешно!
            </h1>
            
            <p className="text-xl text-gray-700 mb-8">
              Поздравляем! Вы успешно прошли тестирование.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 rounded-full mb-6">
              <span className="text-6xl">❌</span>
            </div>
            
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Тест не пройден
            </h1>
            
            <p className="text-xl text-gray-700 mb-8">
              К сожалению, вы не набрали минимальный проходной балл.
            </p>
          </>
        )}

        <div className="bg-gray-50 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-600 mt-2">Правильных ответов</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600 mt-2">Всего вопросов</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-2">Результат</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {passed ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">✨ Что дальше?</h3>
              <p className="text-green-700 text-sm">
                Результаты теста отправлены администратору. С вами свяжутся в течение 1-2 рабочих дней для получения сертификата.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-2">💡 Рекомендация</h3>
              <p className="text-orange-700 text-sm">
                Минимальный проходной балл: 80% (16 из 20). Рекомендуем повторить материал и пройти тест заново.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
          >
            Вернуться на главную
          </Link>
        </div>

      </div>
    </div>
  )
}
