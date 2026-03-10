'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UploadedFiles = {
  certificates: File[]
  qualifications: File[]
  additional: File[]
}

export default function ValidationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    position: ''
  })
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    certificates: [],
    qualifications: [],
    additional: []
  })
  
  const [agreed, setAgreed] = useState(false)

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ

  const checkEmptyFields = () => {
    const empty = []
    if (!formData.fullName.trim()) empty.push('• ФИО')
    if (!formData.companyName.trim()) empty.push('• Название компании')
    if (!formData.email.trim()) empty.push('• Email')
    else if (!isValidEmail(formData.email.trim())) empty.push('• Email (неверный формат)')
    if (!formData.position.trim()) empty.push('• Должность/Специализация')
    return empty
  }

  const goToStep = (step: number) => {
    if (step > currentStep) {
      if (currentStep === 1) {
        const emptyFields = checkEmptyFields()
        if (emptyFields.length > 0) {
          alert(`Пожалуйста, заполните обязательные поля:\n\n${emptyFields.join('\n')}`)
          return
        }
      }
      if (currentStep === 2 && uploadedFiles.certificates.length === 0) {
        alert('Пожалуйста, загрузите хотя бы один сертификат или диплом')
        return
      }
    }
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileUpload = (files: FileList | null, type: keyof UploadedFiles) => {
    if (!files) return
    const filesArray = Array.from(files)
    const tooBig = filesArray.filter(f => f.size > MAX_FILE_SIZE)
    if (tooBig.length > 0) {
      alert(`Файлы слишком большие (макс. 10 МБ):\n${tooBig.map(f => f.name).join('\n')}`)
      return
    }
    setUploadedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...filesArray]
    }))
  }

  const removeFile = (type: keyof UploadedFiles, fileName: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter(f => f.name !== fileName)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emptyFields = checkEmptyFields()
    if (emptyFields.length > 0) {
      alert(`Пожалуйста, заполните обязательные поля:\n\n${emptyFields.join('\n')}`)
      return
    }

    if (uploadedFiles.certificates.length === 0) {
      alert('Пожалуйста, загрузите хотя бы один сертификат или диплом')
      return
    }
    
    if (!agreed) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных')
      return
    }

    // ⬇️ ЗАЩИТА ОТ ПОВТОРНОЙ ЗАЯВКИ ⬇️
    const { data: existingApps } = await supabase
      .from('applications')
      .select('id, status')
      .eq('email', formData.email)

    const existingApp = existingApps?.[0]

    if (existingApp) {
      const statusText = 
        existingApp.status === 'pending' ? 'На рассмотрении' :
        existingApp.status === 'approved' ? 'Одобрена - проверьте email для прохождения теста' :
        'Отклонена'
      
      alert(`❌ Вы уже подавали заявку!\n\nСтатус: ${statusText}`)
      return
    }
    // ⬆️ КОНЕЦ ЗАЩИТЫ ⬆️

    setLoading(true)

    try {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          user_id: null,
          full_name: formData.fullName,
          company_name: formData.companyName,
          email: formData.email,
          position: formData.position,
          status: 'pending'
        })
        .select()
        .single()

      if (appError) throw appError

      const allFiles = [
        ...uploadedFiles.certificates.map(f => ({ file: f, type: 'certificate' as const })),
        ...uploadedFiles.qualifications.map(f => ({ file: f, type: 'qualification' as const })),
        ...uploadedFiles.additional.map(f => ({ file: f, type: 'additional' as const }))
      ]

      const documentUrls = []

      for (const { file, type } of allFiles) {
        const cleanFileName = file.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${application.id}/${Date.now()}-${cleanFileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(fileName, file)

        if (uploadError) {
          alert(`Ошибка загрузки файла "${file.name}". Попробуйте ещё раз.`)
          throw new Error(`Ошибка загрузки файла: ${file.name}`)
        }

        await supabase.from('application_documents').insert({
          application_id: application.id,
          file_name: file.name,
          file_url: fileName,
          file_type: type,
          file_size: file.size
        })

        const { data: urlData } = supabase.storage
          .from('application-documents')
          .getPublicUrl(fileName)

        documentUrls.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size
        })
      }

      try {
        await fetch('/api/application/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: application.id,
            fullName: formData.fullName,
            companyName: formData.companyName,
            email: formData.email,
            position: formData.position,
            documents: documentUrls,
            createdAt: application.created_at
          })
        })
      } catch (emailError) {
        console.error('Ошибка отправки email:', emailError)
      }

      alert(`Заявка успешно отправлена!\n\nНа ваш email ${formData.email} отправлено уведомление.\n\nНаш специалист рассмотрит вашу заявку в течение 1-2 рабочих дней.`)
      
      router.push('/validation/success?email=' + encodeURIComponent(formData.email))

    } catch (error: any) {
      console.error('Ошибка отправки заявки:', error)
      alert('Произошла ошибка при отправке заявки. Попробуйте позже или свяжитесь с нами.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Валидация специалистов по БиОТ
            </h1>
            <p className="text-lg text-gray-600">
              Независимая оценка квалификации специалистов по безопасности и охране труда
            </p>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
              {[1, 2, 3].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition ${
                      step === currentStep ? 'bg-yellow-400 text-white' :
                      step < currentStep ? 'bg-green-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className={`text-sm font-medium whitespace-nowrap ${step <= currentStep ? 'text-gray-700' : 'text-gray-500'}`}>
                      {step === 1 ? 'Личные данные' : step === 2 ? 'Документы' : 'Отправка'}
                    </span>
                  </div>
                  {idx < 2 && <div className="w-24 h-1 bg-gray-300 mx-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm mr-3">1</span>
                    Личные данные
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Иванов Иван Иванович"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Название компании / ИП <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="ТОО 'Ваша компания'"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">На этот email придёт подтверждение заявки</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Должность / Специализация <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Например: Специалист по охране труда"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
                    >
                      Далее →
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm mr-3">2</span>
                    Загрузка документов
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Сертификаты и дипломы <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files, 'certificates')}
                        className="hidden"
                        id="certificates"
                      />
                      <label htmlFor="certificates" className="cursor-pointer">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 font-medium">Нажмите для загрузки</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG</p>
                      </label>
                    </div>
                    {uploadedFiles.certificates.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.certificates.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('certificates', file.name)}
                              className="text-red-500 hover:text-red-700"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                      ← Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition"
                    >
                      Далее →
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm mr-3">3</span>
                    Проверка и отправка
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Ваши данные:</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">ФИО:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Компания:</span> {formData.companyName}</p>
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Специализация:</span> {formData.position}</p>
                      <p><span className="font-medium">Документы:</span> {
                        uploadedFiles.certificates.length + 
                        uploadedFiles.qualifications.length + 
                        uploadedFiles.additional.length
                      } файл(ов)</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 mr-3 w-5 h-5"
                      />
                      <span className="text-sm text-gray-700">
                        Я согласен на обработку персональных данных
                      </span>
                    </label>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                      disabled={loading}
                    >
                      ← Назад
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center disabled:opacity-50"
                    >
                      {loading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}