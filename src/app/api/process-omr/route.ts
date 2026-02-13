import { NextRequest, NextResponse } from 'next/server'
import { MARKING_SCHEMES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const markingScheme = formData.get('markingScheme') as string
    const totalQuestions = parseInt(formData.get('totalQuestions') as string) || 15

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload PNG, JPG, or PDF.' },
        { status: 400 }
      )
    }

    // Get marking scheme from constants
    const scheme = MARKING_SCHEMES.find(s => s.id === markingScheme)
    const marks = {
      positive: scheme?.positiveMarks ?? 1,
      negative: scheme?.negativeMarks ?? 0.33
    }

    // Generate simulated OMR data
    const detectedAnswers = generateRandomAnswers(totalQuestions)
    const topics = ['Percentage', 'Profit & Loss', 'SI/CI', 'Time & Work', 'English', 'GK', 'Reasoning', 'Computer', 'Odia Grammar']
    const difficulties = ['Easy', 'Medium', 'Hard']
    const options = ['A', 'B', 'C', 'D']

    const questions = detectedAnswers.map((userAnswer, i) => {
      const topic = topics[Math.floor(Math.random() * topics.length)]
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      const correctAnswer = options[Math.floor(Math.random() * options.length)]

      return {
        id: `q-${i + 1}`,
        questionNumber: i + 1,
        questionText: `Question ${i + 1} - ${topic}`,
        options: options.map(label => ({
          id: label,
          label,
          text: `Option ${label}`
        })),
        correctAnswer,
        userAnswer,
        isCorrect: userAnswer ? userAnswer === correctAnswer : null,
        topic,
        difficulty,
        marks: marks.positive,
        negativeMarks: marks.negative
      }
    })

    // Calculate stats
    let correct = 0, incorrect = 0, skipped = 0, obtainedMarks = 0
    questions.forEach((q) => {
      if (!q.userAnswer) {
        skipped++
      } else if (q.isCorrect) {
        correct++
        obtainedMarks += marks.positive
      } else {
        incorrect++
        obtainedMarks -= marks.negative
      }
    })

    const result = {
      id: Date.now().toString(),
      examName: 'OMR Sheet Analysis',
      examType: 'OMR',
      totalQuestions: questions.length,
      attempted: correct + incorrect,
      correct,
      incorrect,
      skipped,
      totalMarks: questions.length * marks.positive,
      obtainedMarks: Math.round(obtainedMarks * 100) / 100,
      accuracy: Math.round((correct / (correct + incorrect)) * 10000) / 100 || 0,
      questions,
      topicBreakdown: generateTopicBreakdown(questions),
      sillyMistakes: identifySillyMistakes(questions),
      detectedAnswers,
      confidence: 0.85,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: result, detectedAnswers })
  } catch (error) {
    console.error('Process OMR error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process OMR image' },
      { status: 500 }
    )
  }
}

function generateRandomAnswers(count: number): (string | null)[] {
  const options = ['A', 'B', 'C', 'D']
  return Array.from({ length: count }, () => {
    if (Math.random() > 0.15) { // 85% attempted
      return options[Math.floor(Math.random() * options.length)]
    }
    return null
  })
}

function generateTopicBreakdown(questions: any[]) {
  const topicMap = new Map<string, { total: number; correct: number; incorrect: number; skipped: number }>()

  questions.forEach(q => {
    if (!topicMap.has(q.topic)) {
      topicMap.set(q.topic, { total: 0, correct: 0, incorrect: 0, skipped: 0 })
    }
    const stats = topicMap.get(q.topic)!
    stats.total++
    if (!q.userAnswer) stats.skipped++
    else if (q.isCorrect) stats.correct++
    else stats.incorrect++
  })

  return Array.from(topicMap.entries()).map(([topic, stats]) => ({
    topic,
    total: stats.total,
    correct: stats.correct,
    incorrect: stats.incorrect,
    skipped: stats.skipped,
    accuracy: stats.correct + stats.incorrect > 0
      ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 10000) / 100
      : 0
  }))
}

function identifySillyMistakes(questions: any[]) {
  return questions
    .filter(q => q.difficulty === 'Easy' && q.isCorrect === false)
    .map(q => ({
      questionNumber: q.questionNumber,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer || 'Not attempted',
      reason: `This was an easy question in ${q.topic}. Review the basics to avoid losing marks.`
    }))
}
