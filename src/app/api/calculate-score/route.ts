import { NextRequest, NextResponse } from 'next/server'
import { MARKING_SCHEMES } from '@/lib/constants'

interface CalculateRequest {
  questions: Array<{
    id: string
    questionNumber: number
    correctAnswer: string
    userAnswer: string | null
    isCorrect: boolean | null
    marks?: number
    negativeMarks?: number
  }>
  markingScheme: string
  customPositive?: number
  customNegative?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json()
    const { questions, markingScheme, customPositive, customNegative } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ success: false, error: 'Questions array is required' }, { status: 400 })
    }

    // Get marking scheme from constants
    const scheme = MARKING_SCHEMES.find(s => s.id === markingScheme)
    const positiveMarks = scheme?.positiveMarks ?? customPositive ?? 1
    const negativeMarks = scheme?.negativeMarks ?? customNegative ?? 0
    const schemeName = scheme?.name ?? 'Custom'

    // Calculate scores
    let correct = 0
    let incorrect = 0
    let skipped = 0
    let obtainedMarks = 0

    const processedQuestions = questions.map(q => {
      const result = {
        ...q,
        marks: positiveMarks,
        negativeMarks: negativeMarks
      }

      if (!q.userAnswer || q.userAnswer === 'skipped') {
        skipped++
        result.isCorrect = null
      } else if (q.isCorrect || q.userAnswer === q.correctAnswer) {
        correct++
        obtainedMarks += positiveMarks
        result.isCorrect = true
      } else {
        incorrect++
        obtainedMarks -= negativeMarks
        result.isCorrect = false
      }

      return result
    })

    const totalQuestions = questions.length
    const attempted = correct + incorrect
    const totalMarks = totalQuestions * positiveMarks
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 10000) / 100 : 0

    // Generate topic breakdown
    const topicMap = new Map<string, { total: number; correct: number; incorrect: number; skipped: number }>()
    
    processedQuestions.forEach(q => {
      const topic = (q as any).topic || 'General'
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { total: 0, correct: 0, incorrect: 0, skipped: 0 })
      }
      const stats = topicMap.get(topic)!
      stats.total++
      if (q.isCorrect === null) stats.skipped++
      else if (q.isCorrect) stats.correct++
      else stats.incorrect++
    })

    const topicBreakdown = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      incorrect: stats.incorrect,
      skipped: stats.skipped,
      accuracy: stats.correct + stats.incorrect > 0
        ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 10000) / 100
        : 0
    }))

    // Identify silly mistakes
    const sillyMistakes = processedQuestions
      .filter(q => (q as any).difficulty === 'Easy' && q.isCorrect === false)
      .map(q => ({
        questionNumber: q.questionNumber,
        topic: (q as any).topic || 'General',
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer || 'Not attempted',
        reason: `This was an easy question in ${(q as any).topic || 'General'}. Review the basics to avoid losing marks on similar questions.`
      }))

    return NextResponse.json({
      success: true,
      result: {
        markingScheme: schemeName,
        positiveMarks,
        negativeMarks,
        totalQuestions,
        attempted,
        correct,
        incorrect,
        skipped,
        totalMarks,
        obtainedMarks: Math.round(obtainedMarks * 100) / 100,
        accuracy,
        topicBreakdown,
        sillyMistakes,
        questions: processedQuestions
      }
    })
  } catch (error) {
    console.error('Calculate score error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate score' },
      { status: 500 }
    )
  }
}

// GET endpoint to list available marking schemes
export async function GET() {
  return NextResponse.json({
    success: true,
    markingSchemes: MARKING_SCHEMES.map((scheme) => ({
      id: scheme.id,
      name: scheme.name,
      positiveMarks: scheme.positiveMarks,
      negativeMarks: scheme.negativeMarks,
      description: scheme.description
    }))
  })
}
