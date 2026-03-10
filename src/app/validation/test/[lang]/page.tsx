'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProctorCheck from '@/components/ProctorCheck'

type Question = {
  id: string
  question_text_ru: string
  question_text_kk: string | null
  options: Array<{
    text_ru: string
    text_kk?: string
    is_correct: boolean
  }>
  category: string
}

export default function TestPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const lang = params.lang as string
  const email = searchParams.get('email')?.replace(/['"]/g, '') || ''
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(30 * 60)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Прокторинг
  const [proctorReady, setProctorReady] = useState(false)
  const [violations, setViolations] = useState<string[]>([])

  // Запись видео — сегментами по 5 минут (каждый < 50 МБ)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const segmentIndexRef = useRef(0)
  const uploadedUrlsRef = useRef<string[]>([])
  const segmentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Состояние загрузки видео
  const [uploadState, setUploadState] = useState<'idle' | 'stopping' | 'uploading' | 'done' | 'error'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const submittedRef = useRef(false)
  const [testFinished, setTestFinished] = useState(false)

  const loadQuestions = async () => {
    setLoading(true)
    setLoadError(false)

    try {
      const resp = await fetch('/api/test/questions')
      if (!resp.ok) throw new Error('API error: ' + resp.status)

      const data = await resp.json()
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data)
        setSelectedAnswers(new Array(data.length).fill(-1))
        setLoading(false)
        return
      }
    } catch (e) {
      console.error('Ошибка загрузки:', e)
    }

    setLoading(false)
    setLoadError(true)
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (testFinished) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, testFinished])

  // Функция записи нарушений
  const logViolation = async (type: string, details?: any) => {
    console.log('⚠️ Нарушение прокторинга:', type)
    setViolations(prev => [...prev, type])
    
    const { data: apps } = await supabase
      .from('applications')
      .select('id')
      .eq('email', email)
    
    const appId = apps?.[0]?.id
    
    if (appId) {
      await supabase.from('test_violations').insert({
        application_id: appId,
        violation_type: type,
        details: details || {}
      })
    }
  }

  // Детекция смены вкладки
  useEffect(() => {
    if (!proctorReady || testFinished) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', { timestamp: new Date().toISOString() })
        alert('⚠️ ВНИМАНИЕ!\n\nПереключение на другую вкладку зафиксировано!\nЭто нарушение правил тестирования.')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [proctorReady, email, testFinished])

  // Детекция выхода из полного экрана
  useEffect(() => {
    if (!proctorReady || testFinished) return

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement

      if (!isFullscreen && proctorReady) {
        logViolation('exit_fullscreen', { timestamp: new Date().toISOString() })
        alert('⚠️ ВНИМАНИЕ!\n\nВыход из полноэкранного режима зафиксирован!\n\nПожалуйста, нажмите F11 для возврата в полный экран.')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [proctorReady, testFinished])

  // Блокировка копирования
  useEffect(() => {
    if (!proctorReady || testFinished) return

    const preventCopy = (e: Event) => {
      e.preventDefault()
      logViolation('copy_attempt', { timestamp: new Date().toISOString() })
      alert('⚠️ Копирование текста запрещено!')
    }

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault()
      logViolation('right_click', { timestamp: new Date().toISOString() })
    }

    document.addEventListener('copy', preventCopy)
    document.addEventListener('contextmenu', preventRightClick)

    return () => {
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('contextmenu', preventRightClick)
    }
  }, [proctorReady, testFinished])

  // Блокируем закрытие вкладки во время загрузки
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadState === 'stopping' || uploadState === 'uploading') {
        e.preventDefault()
        e.returnValue = 'Видео ещё загружается. Вы уверены, что хотите закрыть страницу?'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [uploadState])

  // Загрузить один сегмент в Supabase (с retry)
  const uploadSegment = async (blob: Blob, segmentNum: number): Promise<string | null> => {
    const safeEmail = email.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${safeEmail}-${Date.now()}-seg${segmentNum}.webm`

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { error: err } = await supabase.storage
          .from('test-recordings')
          .upload(fileName, blob, {
            contentType: 'video/webm',
            upsert: true,
          })
        if (err) throw err

        const { data: urlData } = supabase.storage
          .from('test-recordings')
          .getPublicUrl(fileName)

        console.log(`Segment ${segmentNum} uploaded: ${(blob.size / 1024 / 1024).toFixed(1)} MB`)
        return urlData.publicUrl
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`Segment ${segmentNum} attempt ${attempt}/3 failed:`, msg)
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt))
      }
    }
    return null
  }

  // Завершить текущий сегмент записи и загрузить в фоне
  const rotateSegment = () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording') return

    // Останавливаем текущий recorder — ondataavailable отправит последний чанк
    recorder.stop()
  }

  // Создать новый MediaRecorder на том же потоке
  const startNewRecorderSegment = (stream: MediaStream) => {
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ]
    const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || ''
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

    // Каждый сегмент хранит свои чанки изолированно
    const segmentChunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        segmentChunks.push(event.data)
      }
    }

    recorder.onstop = async () => {
      // Собираем blob из чанков ЭТОГО сегмента
      if (segmentChunks.length > 0) {
        const blob = new Blob(segmentChunks, { type: 'video/webm' })
        const segNum = segmentIndexRef.current
        segmentIndexRef.current++

        const url = await uploadSegment(blob, segNum)
        if (url) uploadedUrlsRef.current.push(url)
      }

      // Если тест ещё идёт — запускаем новый сегмент
      if (!submittedRef.current && stream.active) {
        startNewRecorderSegment(stream)
      } else {
        // Тест завершён — сигнализируем что последний сегмент загружен
        lastSegmentDoneRef.current?.()
      }
    }

    recorder.start(1000)
    recorderRef.current = recorder
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 15 },
        audio: true
      })
      setCameraStream(stream)

      // Запускаем первый сегмент
      segmentIndexRef.current = 0
      uploadedUrlsRef.current = []
      startNewRecorderSegment(stream)

      // Каждую минуту — ротация сегмента (stop + start нового)
      // 1 мин при 640x480@15fps ≈ 10-15 МБ — гарантированно < 50 МБ
      segmentIntervalRef.current = setInterval(() => {
        rotateSegment()
      }, 60 * 1000)
    } catch (error) {
      console.error('Ошибка записи видео:', error)
      alert('Не удалось начать запись. Продолжить без записи?')
    }
  }

  // Остановить запись и дождаться загрузки последнего сегмента
  const lastSegmentDoneRef = useRef<(() => void) | null>(null)

  const stopRecordingAndUploadFinal = async (): Promise<void> => {
    // Остановить авторотацию
    if (segmentIntervalRef.current) {
      clearInterval(segmentIntervalRef.current)
      segmentIntervalRef.current = null
    }

    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording') {
      cameraStream?.getTracks().forEach(track => track.stop())
      return
    }

    // Создаём промис который резолвится когда onstop завершит загрузку
    const done = new Promise<void>((resolve) => {
      lastSegmentDoneRef.current = resolve
    })

    // recorder.stop() вызовет onstop из startNewRecorderSegment
    // submittedRef.current = true → новый сегмент не создастся
    // onstop загрузит blob и вызовет lastSegmentDoneRef.current()
    recorder.stop()

    await done
    cameraStream?.getTracks().forEach(track => track.stop())
  }

  const handleProctorReady = () => {
    setProctorReady(true)
    startRecording()
    setTimeout(() => {
      alert('ℹ️ ИНСТРУКЦИЯ:\n\n1. Нажмите F11 для входа в полноэкранный режим\n2. Начните тест\n3. Идёт запись видео - не закрывайте камеру\n4. НЕ выходите из полного экрана до завершения\n5. Видео будет загружено автоматически')
    }, 500)
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setTestFinished(true)

    let score = 0
    const answers = questions.map((q, idx) => {
      const selectedIdx = selectedAnswers[idx]
      const isCorrect = selectedIdx !== -1 && q.options[selectedIdx]?.is_correct
      if (isCorrect) score++

      return {
        question_id: q.id,
        selected_answer: selectedIdx,
        is_correct: isCorrect
      }
    })

    // 1. Остановка записи и загрузка последнего сегмента
    setUploadState('stopping')
    await stopRecordingAndUploadFinal()

    // 2. Проверка загруженных сегментов
    const urls = uploadedUrlsRef.current
    const videoUrl = urls.length > 0 ? urls.join(' | ') : null

    if (urls.length > 0) {
      setUploadState('done')
    } else {
      setUploadState('error')
      setUploadError('Не удалось загрузить видеозапись')
      await new Promise(r => setTimeout(r, 3000))
    }

    // 3. Отправка результатов + email
    try {
      const resp = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lang,
          score,
          totalQuestions: questions.length,
          answers,
          violationsCount: violations.length,
          videoUrl
        })
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        console.error('Submit error:', err)
      }
    } catch (e) {
      console.error('Submit fetch error:', e)
    }

    // 4. Переход к результатам
    router.push(`/validation/test/result?score=${score}&total=${questions.length}&passed=${score >= 16}`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Экран загрузки видео
  if (uploadState !== 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-lg w-full">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              Тест завершён
            </div>
          </div>

          {uploadState === 'stopping' && (
            <>
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Остановка записи...
              </h2>
              <p className="text-gray-500">Подготовка видео к загрузке</p>
            </>
          )}

          {uploadState === 'uploading' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Загрузка видеозаписи
              </h2>
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              {uploadError && (
                <p className="text-yellow-600 text-sm mt-2">{uploadError}</p>
              )}
              <p className="text-gray-400 text-sm mt-6">
                Пожалуйста, не закрывайте страницу.<br />
                Видео загружается на сервер.
              </p>
            </>
          )}

          {uploadState === 'done' && (
            <>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Видео загружено!
              </h2>
              <p className="text-gray-500 mb-4">Отправка результатов и уведомления...</p>
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </>
          )}

          {uploadState === 'error' && (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Не удалось загрузить видео
              </h2>
              <p className="text-gray-600 mb-4">{uploadError}</p>
              <p className="text-gray-400 text-sm">
                Результаты теста будут сохранены без видеозаписи.<br/>
                Переход к результатам...
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // Если прокторинг не готов - показываем ProctorCheck
  if (!proctorReady) {
    return (
      <ProctorCheck 
        onReady={handleProctorReady}
        applicationId={email}
        onViolation={logViolation}
      />
    )
  }

  if (loading || questions.length === 0 || loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-600 mb-2">Загрузка теста...</div>
              <div className="text-gray-400">Подключение к серверу</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки вопросов</div>
              <p className="text-gray-500 mb-6">Сервер не отвечает. Нажмите кнопку ниже.</p>
              <button
                onClick={() => loadQuestions()}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition text-lg"
              >
                Попробовать снова
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const questionText = lang === 'kz' ? (question.question_text_kk || question.question_text_ru) : question.question_text_ru

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Видео с камеры в углу */}
        {cameraStream && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-2">
              <video
                ref={(video) => {
                  if (video && cameraStream && !video.srcObject) {
                    video.srcObject = cameraStream
                  }
                }}
                autoPlay
                muted
                className="w-48 h-36 rounded-lg border-2 border-red-500"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="flex items-center justify-center mt-1 text-xs text-red-600 font-semibold">
                <span className="animate-pulse">🔴 REC</span>
              </div>
            </div>
          </div>
        )}

        {/* Индикатор нарушений */}
        {violations.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 font-semibold">
              ⚠️ Нарушений прокторинга: {violations.length}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Вопрос {currentQuestion + 1} из {questions.length}
            </h1>
            <p className="text-sm text-gray-500">{question.category}</p>
          </div>
          <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-green-500'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {questionText}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, idx) => {
              const optionText = lang === 'kz' ? (option.text_kk || option.text_ru) : option.text_ru
              const isSelected = selectedAnswers[currentQuestion] === idx
              
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      isSelected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="text-lg">{optionText}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition"
          >
            ← Назад
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
            >
              Завершить тест ✓
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
            >
              Далее →
            </button>
          )}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Прогресс:</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  selectedAnswers[idx] !== -1
                    ? 'bg-green-500 text-white'
                    : idx === currentQuestion
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}