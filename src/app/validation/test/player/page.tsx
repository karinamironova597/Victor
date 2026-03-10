'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

export default function VideoPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VideoPlayer />
    </Suspense>
  )
}

function VideoPlayer() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [urls, setUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function loadVideoUrls() {
      if (!email) {
        setError('Email не указан')
        setLoading(false)
        return
      }

      // Находим application по email
      const { data: apps } = await supabase
        .from('applications')
        .select('id')
        .eq('email', email)

      const appId = apps?.[0]?.id
      if (!appId) {
        setError('Заявка не найдена')
        setLoading(false)
        return
      }

      // Достаём video_url из test_results
      const { data: results } = await supabase
        .from('test_results')
        .select('video_url')
        .eq('application_id', appId)
        .order('completed_at', { ascending: false })
        .limit(1)

      const videoUrl = results?.[0]?.video_url
      if (!videoUrl) {
        setError('Видеозапись не найдена')
        setLoading(false)
        return
      }

      const parsed = videoUrl.split(' | ').map((u: string) => u.trim()).filter(Boolean)
      setUrls(parsed)
      setLoading(false)
    }

    loadVideoUrls()
  }, [email])

  // При смене сегмента — автоплей
  useEffect(() => {
    if (videoRef.current && urls[currentIndex]) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex, urls])

  const handleEnded = () => {
    if (currentIndex < urls.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || urls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Видео не найдено</h1>
          <p className="text-gray-400">{error || 'Ссылки на видеозапись отсутствуют'}</p>
        </div>
      </div>
    )
  }

  const total = urls.length

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-white text-lg font-bold">
          Видеозапись тестирования
        </h1>
        <p className="text-gray-400 text-sm">
          {email} — часть {currentIndex + 1} из {total}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <video
            ref={videoRef}
            src={urls[currentIndex]}
            controls
            autoPlay
            onEnded={handleEnded}
            className="w-full rounded-lg shadow-2xl bg-black"
          />
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-sm transition"
            >
              &larr; Пред.
            </button>
            <span className="text-gray-400 text-sm flex-1 text-center">
              Часть {currentIndex + 1} / {total} (минута {currentIndex + 1})
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}
              disabled={currentIndex === total - 1}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded text-sm transition"
            >
              След. &rarr;
            </button>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded text-sm font-semibold transition ${
                  i === currentIndex
                    ? 'bg-yellow-400 text-gray-900'
                    : i < currentIndex
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-600 rounded inline-block"></span> Просмотрено
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-400 rounded inline-block"></span> Текущая
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-700 rounded inline-block"></span> Не просмотрено
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
