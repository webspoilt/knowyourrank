import { NextRequest, NextResponse } from 'next/server'


interface ReportRequest {
  examResultId: string
  examResult: {
    id: string
    examName: string
    examType: string
    totalQuestions: number
    correct: number
    incorrect: number
    skipped: number
    totalMarks: number
    obtainedMarks: number
    accuracy: number
    questions: any[]
    topicBreakdown: any[]
    sillyMistakes: any[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportRequest = await request.json()
    const { examResult } = body

    if (!examResult) {
      return NextResponse.json({ success: false, error: 'Exam result is required' }, { status: 400 })
    }

    // Generate insights from topic breakdown
    const insights = generateDefaultInsights(examResult.topicBreakdown)

    // Generate PDF content (HTML for conversion)
    const reportHtml = generateReportHtml(examResult, insights)

    // No need to save to disk on Vercel - return content directly
    const reportId = Date.now().toString()

    // Generate next focus recommendations
    const nextFocus = insights
      .filter((i: any) => i.priority === 'URGENT' || i.priority === 'HIGH')
      .slice(0, 3)
      .map((i: any) => i.recommendation)

    return NextResponse.json({
      success: true,
      reportHtml,
      reportId,
      insights,
      nextFocus,
      sillyMistakesCount: examResult.sillyMistakes.length
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateDefaultInsights(topicBreakdown: any[]) {
  return topicBreakdown.map(tb => {
    let priority = 'LOW'
    let recommendation = ''

    if (tb.accuracy < 40) {
      priority = 'URGENT'
      recommendation = `Your ${tb.topic} accuracy is critically low at ${tb.accuracy}%. Focus on fundamentals and practice more questions.`
    } else if (tb.accuracy < 60) {
      priority = 'HIGH'
      recommendation = `${tb.topic} needs improvement with ${tb.accuracy}% accuracy. Review concepts and practice regularly.`
    } else if (tb.accuracy < 80) {
      priority = 'MEDIUM'
      recommendation = `Good progress in ${tb.topic} at ${tb.accuracy}%. Continue practicing to improve further.`
    } else {
      priority = 'LOW'
      recommendation = `Excellent in ${tb.topic} at ${tb.accuracy}%. Maintain consistency.`
    }

    return {
      topic: tb.topic,
      accuracy: tb.accuracy,
      priority,
      recommendation,
      focusAreas: []
    }
  })
}

function generateReportHtml(examResult: any, insights: any[]) {
  const { totalQuestions, correct, incorrect, skipped, accuracy, obtainedMarks, totalMarks, topicBreakdown, sillyMistakes } = examResult

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Analysis Report - KnowYourRank</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #fff;
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .logo {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .subtitle {
      color: #94a3b8;
      font-size: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .stat-value.green { color: #22c55e; }
    .stat-value.red { color: #ef4444; }
    .stat-value.yellow { color: #f59e0b; }
    .stat-value.purple { color: #8b5cf6; }
    
    .stat-label {
      color: #94a3b8;
      font-size: 14px;
    }
    
    .section {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .insight-card {
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      border-left: 4px solid;
    }
    
    .insight-card.urgent { border-left-color: #ef4444; background: rgba(239,68,68,0.1); }
    .insight-card.high { border-left-color: #f97316; background: rgba(249,115,22,0.1); }
    .insight-card.medium { border-left-color: #f59e0b; background: rgba(245,158,11,0.1); }
    .insight-card.low { border-left-color: #22c55e; background: rgba(34,197,94,0.1); }
    
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .insight-topic {
      font-weight: 600;
      font-size: 16px;
    }
    
    .insight-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .badge-urgent { background: #ef4444; }
    .badge-high { background: #f97316; }
    .badge-medium { background: #f59e0b; }
    .badge-low { background: #22c55e; }
    
    .insight-text {
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .topic-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .topic-table th, .topic-table td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .topic-table th {
      color: #94a3b8;
      font-weight: 500;
      font-size: 14px;
    }
    
    .accuracy-bar {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      height: 8px;
      overflow: hidden;
    }
    
    .accuracy-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s;
    }
    
    .silly-mistake {
      background: rgba(249,115,22,0.1);
      border: 1px solid rgba(249,115,22,0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .silly-mistake-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      color: #64748b;
      font-size: 14px;
    }
    
    @media print {
      body { background: #1e1b4b; }
      .section { break-inside: avoid; }
    }
    
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎯 KnowYourRank</div>
      <div class="subtitle">AI-Powered Exam Analysis Report</div>
      <div class="subtitle" style="margin-top: 8px;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value purple">${obtainedMarks}/${totalMarks}</div>
        <div class="stat-label">Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value green">${accuracy}%</div>
        <div class="stat-label">Accuracy</div>
      </div>
      <div class="stat-card">
        <div class="stat-value green">${correct}</div>
        <div class="stat-label">Correct</div>
      </div>
      <div class="stat-card">
        <div class="stat-value red">${incorrect}</div>
        <div class="stat-label">Incorrect</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🎯 Insights & Recommendations</h2>
      ${insights.map((insight: any) => `
        <div class="insight-card ${insight.priority.toLowerCase()}">
          <div class="insight-header">
            <span class="insight-topic">${insight.topic}</span>
            <span class="insight-badge badge-${insight.priority.toLowerCase()}">${insight.priority}</span>
          </div>
          <p class="insight-text">${insight.recommendation}</p>
          ${insight.focusAreas && insight.focusAreas.length > 0 ? `
            <div style="margin-top: 12px;">
              <strong style="color: #94a3b8; font-size: 12px;">Focus Areas:</strong>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                ${insight.focusAreas.map((area: string) => `<span style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px;">${area}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2 class="section-title">📊 Topic-wise Breakdown</h2>
      <table class="topic-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Questions</th>
            <th>Correct</th>
            <th>Accuracy</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          ${topicBreakdown.map((tb: any) => `
            <tr>
              <td style="font-weight: 500;">${tb.topic}</td>
              <td>${tb.total}</td>
              <td>${tb.correct}</td>
              <td>${tb.accuracy}%</td>
              <td style="width: 150px;">
                <div class="accuracy-bar">
                  <div class="accuracy-fill" style="width: ${tb.accuracy}%; background: ${tb.accuracy >= 70 ? '#22c55e' : tb.accuracy >= 50 ? '#f59e0b' : '#ef4444'};"></div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${sillyMistakes && sillyMistakes.length > 0 ? `
      <div class="section">
        <h2 class="section-title">⚠️ Silly Mistakes Tracker</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;">These were easy questions that you got wrong. Review these to avoid losing marks on similar questions.</p>
        ${sillyMistakes.map((mistake: any) => `
          <div class="silly-mistake">
            <div class="silly-mistake-header">
              <strong>Q.${mistake.questionNumber}</strong>
              <span style="background: rgba(249,115,22,0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px;">${mistake.topic}</span>
            </div>
            <p style="color: #cbd5e1; font-size: 14px;">Your Answer: <span style="color: #ef4444;">${mistake.userAnswer}</span> | Correct: <span style="color: #22c55e;">${mistake.correctAnswer}</span></p>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">${mistake.reason}</p>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="section">
      <h2 class="section-title">📚 Next Focus</h2>
      <ul style="list-style: none; padding: 0;">
        ${insights
      .filter((i: any) => i.priority === 'URGENT' || i.priority === 'HIGH')
      .slice(0, 3)
      .map((i: any) => `
            <li style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;">
              <span style="color: ${i.priority === 'URGENT' ? '#ef4444' : '#f97316'}; font-size: 20px;">→</span>
              <div>
                <strong style="color: #fff;">${i.topic}</strong>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${i.recommendation}</p>
              </div>
            </li>
          `).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>Generated by KnowYourRank.in — Exam Analytics Platform</p>
      <p style="margin-top: 8px;">Keep practicing, stay focused! 🚀</p>
    </div>
  </div>
</body>
</html>`
}
