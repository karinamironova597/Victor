import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Страница не найдена</h2>
        <p className="text-gray-600 mb-8">Запрашиваемая страница не существует или была перемещена.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
