import { MarkingScheme, Question, TopicBreakdown, ExamResult, AIInsight } from './types';
import { MARKING_SCHEMES } from './constants';

// Calculate score based on marking scheme
export function calculateScore(
  questions: Question[],
  schemeId: string
): { totalMarks: number; correct: number; incorrect: number; skipped: number } {
  const scheme = MARKING_SCHEMES.find(s => s.id === schemeId) || MARKING_SCHEMES[0];
  
  let totalMarks = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  questions.forEach(q => {
    if (!q.userAnswer || q.userAnswer === 'skipped') {
      skipped++;
    } else if (q.isCorrect) {
      correct++;
      totalMarks += scheme.positiveMarks;
    } else {
      incorrect++;
      totalMarks -= scheme.negativeMarks;
    }
  });

  return { totalMarks: Math.round(totalMarks * 100) / 100, correct, incorrect, skipped };
}

// Calculate accuracy
export function calculateAccuracy(correct: number, attempted: number): number {
  if (attempted === 0) return 0;
  return Math.round((correct / attempted) * 10000) / 100;
}

// Calculate percentile
export function calculatePercentile(score: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const belowCount = sortedScores.filter(s => s < score).length;
  return Math.round((belowCount / sortedScores.length) * 10000) / 100;
}

// Generate topic breakdown
export function generateTopicBreakdown(questions: Question[]): TopicBreakdown[] {
  const topicMap = new Map<string, { total: number; correct: number; incorrect: number; skipped: number }>();

  questions.forEach(q => {
    const topic = q.topic || 'Uncategorized';
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { total: 0, correct: 0, incorrect: 0, skipped: 0 });
    }
    const stats = topicMap.get(topic)!;
    stats.total++;
    
    if (!q.userAnswer || q.userAnswer === 'skipped') {
      stats.skipped++;
    } else if (q.isCorrect) {
      stats.correct++;
    } else {
      stats.incorrect++;
    }
  });

  return Array.from(topicMap.entries()).map(([topic, stats]) => ({
    topic,
    total: stats.total,
    correct: stats.correct,
    incorrect: stats.incorrect,
    skipped: stats.skipped,
    accuracy: calculateAccuracy(stats.correct, stats.correct + stats.incorrect),
  }));
}

// Identify silly mistakes (wrong answers on easy questions)
export function identifySillyMistakes(questions: Question[]): Array<{ questionNumber: number; topic: string; correctAnswer: string; userAnswer: string; reason: string }> {
  return questions
    .filter(q => q.difficulty === 'Easy' && q.isCorrect === false)
    .map(q => ({
      questionNumber: q.questionNumber,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer || 'Not attempted',
      reason: `This was an easy question in ${q.topic}. Review the basics to avoid losing marks on similar questions.`,
    }));
}

// Generate AI insights
export function generateAIInsights(topicBreakdown: TopicBreakdown[]): AIInsight[] {
  return topicBreakdown.map(tb => {
    let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    let recommendation: string;
    let resources: string[];

    if (tb.accuracy < 40) {
      priority = 'URGENT';
      recommendation = `Your accuracy in ${tb.topic} is critically low at ${tb.accuracy}%. Focus on understanding core concepts before attempting more questions.`;
      resources = [
        'Revise fundamental formulas and concepts',
        'Practice 20-30 basic questions daily',
        'Watch video tutorials for visual learning',
        'Create summary notes for quick revision',
      ];
    } else if (tb.accuracy < 60) {
      priority = 'HIGH';
      recommendation = `${tb.topic} needs attention with ${tb.accuracy}% accuracy. Identify your weak areas within this topic.`;
      resources = [
        'Analyze your mistakes pattern',
        'Practice mixed difficulty questions',
        'Take topic-specific mock tests',
      ];
    } else if (tb.accuracy < 80) {
      priority = 'MEDIUM';
      recommendation = `You're doing well in ${tb.topic} with ${tb.accuracy}% accuracy. Fine-tune for edge cases.`;
      resources = [
        'Focus on advanced concepts',
        'Time yourself on questions',
        'Review tricky questions from mocks',
      ];
    } else {
      priority = 'LOW';
      recommendation = `Excellent performance in ${tb.topic} at ${tb.accuracy}%. Maintain consistency.`;
      resources = [
        'Occasional revision to stay sharp',
        'Help others to reinforce knowledge',
        'Challenge yourself with harder problems',
      ];
    }

    return {
      topic: tb.topic,
      accuracy: tb.accuracy,
      recommendation,
      priority,
      resources,
    };
  }).sort((a, b) => {
    const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return order[a.priority] - order[b.priority];
  });
}

// Parse HTML content for CBT scraping
export function parseCBTHtml(html: string): Partial<Question>[] {
  const questions: Partial<Question>[] = [];
  
  // Common patterns for exam portals
  const questionPatterns = [
    /Question\s*(\d+)/gi,
    /Q\.?\s*(\d+)/gi,
    /(\d+)\.\s*[A-Za-z]/g,
  ];

  // Look for correct answer indicators
  const correctPatterns = [
    /tick\.png/gi,
    /correct.*?answer/gi,
    /✓/g,
    /green.*?check/gi,
    /right.*?answer/gi,
    /class="correct"/gi,
    /class="right-answer"/gi,
  ];

  // Basic parsing - in production, use cheerio or similar
  const lines = html.split('\n');
  let currentQuestion: Partial<Question> | null = null;
  let questionNumber = 0;

  lines.forEach(line => {
    // Detect question numbers
    questionPatterns.forEach(pattern => {
      const match = pattern.exec(line);
      if (match) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        questionNumber++;
        currentQuestion = {
          questionNumber,
          options: [],
        };
      }
    });

    // Detect options
    const optionMatch = line.match(/([A-D])[\).\s]+(.+)/i);
    if (optionMatch && currentQuestion) {
      if (!currentQuestion.options) {
        currentQuestion.options = [];
      }
      currentQuestion.options.push({
        id: optionMatch[1].toUpperCase(),
        label: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim(),
      });
    }

    // Detect correct answer
    correctPatterns.forEach(pattern => {
      if (pattern.test(line) && currentQuestion) {
        // Mark this as having correct answer indicator
        currentQuestion.hasCorrectIndicator = true;
      }
    });
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}

// Format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
