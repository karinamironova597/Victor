import { supabase } from './supabase'

export type TestQuestion = {
  id: string
  question_text_ru: string
  question_text_kk: string | null
  question_text_en: string | null
  options: Array<{
    text_ru: string
    text_kk?: string
    text_en?: string
    is_correct: boolean
  }>
  category: string
  difficulty: string
}

export type TestResult = {
  id?: string
  application_id: string
  language: string
  score: number
  total_questions: number
  answers: Array<{
    question_id: string
    selected_answer: number
    is_correct: boolean
  }>
  completed_at?: string
}

// Получить случайные вопросы
export async function getRandomQuestions(count: number = 20): Promise<TestQuestion[]> {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .limit(1000)
  
  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }
  
  // Перемешиваем и берём нужное количество
  const shuffled = (data || []).sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Сохранить результат теста
export async function saveTestResult(result: TestResult) {
  const { data, error } = await supabase
    .from('test_results')
    .insert({
      application_id: result.application_id,
      language: result.language,
      score: result.score,
      total_questions: result.total_questions,
      answers: result.answers
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving test result:', error)
    return null
  }
  
  return data
}

// Получить результаты по заявке
export async function getTestResults(applicationId: string) {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('application_id', applicationId)
    .order('completed_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching test results:', error)
    return []
  }
  
  return data
}
