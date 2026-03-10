'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-300 mb-4">Ошибка</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h2>
        <p className="text-gray-600 mb-8">Произошла непредвиденная ошибка. Попробуйте обновить страницу.</p>
        <button
          onClick={reset}
          className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
}
