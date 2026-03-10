'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadTestPage() {
  const [status, setStatus] = useState<string>('idle')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [sizeMB, setSizeMB] = useState(100) // размер тестового видео в MB

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${time}] ${msg}`])
  }

  const generateFakeVideoBlob = (megabytes: number): Blob => {
    log(`Генерация фейкового видео ${megabytes} MB...`)
    // Создаём blob из нескольких частей чтобы не крашнуть RAM одним ArrayBuffer
    const chunkSize = 10 * 1024 * 1024 // 10MB chunks
    const chunks: Blob[] = []
    let remaining = megabytes * 1024 * 1024

    while (remaining > 0) {
      const size = Math.min(remaining, chunkSize)
      chunks.push(new Blob([new Uint8Array(size)]))
      remaining -= size
    }

    const blob = new Blob(chunks, { type: 'video/webm' })
    log(`Blob создан: ${(blob.size / 1024 / 1024).toFixed(1)} MB`)
    return blob
  }

  const uploadWithRetry = async (blob: Blob, maxRetries = 3): Promise<string | null> => {
    const safeEmail = 'upload-test'
    const fileName = `${safeEmail}-${Date.now()}.webm`
    const fileSizeMB = (blob.size / 1024 / 1024).toFixed(1)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setProgress(0)

        log(`Загрузка файла ${fileSizeMB} MB целиком...`)
        const startTime = performance.now()

        const { error: uploadError } = await supabase.storage
          .from('test-recordings')
          .upload(fileName, blob, {
            contentType: 'video/webm',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
        setProgress(100)
        log(`Загружено за ${elapsed}s`)

        const { data: urlData } = supabase.storage
          .from('test-recordings')
          .getPublicUrl(fileName)

        return urlData.publicUrl
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log(`Попытка ${attempt}/${maxRetries} ОШИБКА: ${msg}`)

        if (attempt < maxRetries) {
          const delay = 2000 * attempt
          log(`Повтор через ${delay / 1000}s...`)
          await new Promise(r => setTimeout(r, delay))
        } else {
          return null
        }
      }
    }
    return null
  }

  const runTest = async () => {
    setStatus('running')
    setLogs([])
    setProgress(0)

    log(`=== ТЕСТ ЗАГРУЗКИ ${sizeMB} MB ВИДЕО ===`)

    // 1. Проверка RAM
    log('Проверка доступной памяти...')
    if ((performance as any).memory) {
      const mem = (performance as any).memory
      log(`  Heap used: ${(mem.usedJSHeapSize / 1024 / 1024).toFixed(0)} MB`)
      log(`  Heap limit: ${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(0)} MB`)
    } else {
      log('  performance.memory недоступен (не Chrome)')
    }

    // 2. Генерация blob
    const startGen = performance.now()
    let blob: Blob
    try {
      blob = generateFakeVideoBlob(sizeMB)
    } catch (e) {
      log(`ОШИБКА генерации blob: ${e}`)
      log('Браузер не смог выделить память — видео такого размера крашнет вкладку!')
      setStatus('error')
      return
    }
    log(`Генерация заняла ${((performance.now() - startGen) / 1000).toFixed(1)}s`)

    // 3. Загрузка
    log('Начинаем загрузку в Supabase Storage...')
    const startUpload = performance.now()
    const url = await uploadWithRetry(blob)
    const totalTime = ((performance.now() - startUpload) / 1000).toFixed(1)

    if (url) {
      log(`УСПЕХ! Загружено за ${totalTime}s`)
      log(`URL: ${url}`)
      setStatus('success')
    } else {
      log(`ПРОВАЛ после ${totalTime}s — видео не загрузилось`)
      setStatus('error')
    }

    // 4. RAM после загрузки
    if ((performance as any).memory) {
      const mem = (performance as any).memory
      log(`RAM после загрузки: ${(mem.usedJSHeapSize / 1024 / 1024).toFixed(0)} MB`)
    }

    log('=== ТЕСТ ЗАВЕРШЁН ===')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Тест загрузки видео</h1>
        <p className="text-gray-500 mb-8">
          Генерирует фейковый blob заданного размера и загружает в Supabase Storage
        </p>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <label className="block font-semibold text-gray-700 mb-2">
            Размер тестового видео (MB):
          </label>
          <div className="flex gap-3 mb-4 flex-wrap">
            {[10, 50, 100, 150, 200, 300].map(size => (
              <button
                key={size}
                onClick={() => setSizeMB(size)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sizeMB === size
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size} MB
              </button>
            ))}
          </div>

          <input
            type="number"
            value={sizeMB}
            onChange={e => setSizeMB(Number(e.target.value) || 10)}
            min={1}
            max={500}
            className="w-32 px-3 py-2 border rounded-lg mb-4"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={runTest}
              disabled={status === 'running'}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition"
            >
              {status === 'running' ? 'Идёт тест...' : 'Запустить тест'}
            </button>

            {status === 'success' && (
              <span className="text-green-600 font-bold text-lg">PASSED</span>
            )}
            {status === 'error' && (
              <span className="text-red-600 font-bold text-lg">FAILED</span>
            )}
          </div>
        </div>

        {status === 'running' && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Прогресс загрузки</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-green-400 max-h-[500px] overflow-y-auto">
            {logs.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('ОШИБКА') || line.includes('ПРОВАЛ')
                    ? 'text-red-400'
                    : line.includes('УСПЕХ') || line.includes('PASSED')
                    ? 'text-green-300 font-bold'
                    : ''
                }
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
