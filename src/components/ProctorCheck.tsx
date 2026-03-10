'use client'

import { useEffect, useState } from 'react'

type ProctorCheckProps = {
  onReady: () => void
  applicationId: string
  onViolation: (type: string) => void
}

export default function ProctorCheck({ onReady, applicationId, onViolation }: ProctorCheckProps) {
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    async function requestCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        })
        setStream(mediaStream)
        setCameraPermission('granted')
      } catch (error) {
        console.error('Ошибка доступа к камере:', error)
        setCameraPermission('denied')
      }
    }
    
    requestCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (cameraPermission === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">📹</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Запрос доступа к камере...
          </h2>
          <p className="text-gray-600">
            Пожалуйста, разрешите доступ к камере в браузере
          </p>
        </div>
      </div>
    )
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Доступ к камере отклонён
          </h2>
          <p className="text-gray-600 mb-6">
            Для прохождения теста необходимо включить камеру. Это требование прокторинга.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Камера активирована
        </h2>
        
        <div className="mb-6">
          <video 
            ref={(video) => {
              if (video && stream && !video.srcObject) {
                video.srcObject = stream
              }
            }}
            className="w-full rounded-lg border-4 border-green-500"
            autoPlay
            muted
          />
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Требования прокторинга:</strong><br/>
            • Камера должна быть включена всё время<br/>
            • Тест в полноэкранном режиме (нажмите F11)<br/>
            • Нельзя переключаться на другие вкладки<br/>
            • Нельзя выходить из полного экрана
          </p>
        </div>

        <button
          onClick={onReady}
          className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg transition"
        >
          Я понимаю, начать тест
        </button>
      </div>
    </div>
  )
}