// Exam Analytics Platform Types

export interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  options: Option[];
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  negativeMarks: number;
  explanation?: string;
}

export interface Option {
  id: string;
  label: string;
  text: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  examType: 'CBT' | 'OMR';
  url?: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  totalMarks: number;
  obtainedMarks: number;
  accuracy: number;
  percentile?: number;
  stateRank?: number;
  categoryRank?: number;
  questions: Question[];
  topicBreakdown: TopicBreakdown[];
  sillyMistakes: SillyMistake[];
  createdAt: Date;
}

export interface TopicBreakdown {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  avgTime?: number;
}

export interface SillyMistake {
  questionNumber: number;
  topic: string;
  correctAnswer: string;
  userAnswer: string;
  reason: string;
}

export interface MarkingScheme {
  id: string;
  name: string;
  positiveMarks: number;
  negativeMarks: number;
  description: string;
}

export interface RankingData {
  score: number;
  totalParticipants: number;
  stateRank: number;
  categoryRank: number;
  percentile: number;
  shiftDifficulty: number;
}

export interface AIInsight {
  topic: string;
  accuracy: number;
  recommendation: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  resources: string[];
}

export interface PDFReport {
  id: string;
  examResultId: string;
  generatedAt: Date;
  insights: AIInsight[];
  nextFocus: string[];
  sillyMistakesCount: number;
  downloadUrl: string;
}

// API Request/Response Types
export interface ScrapeCBTRequest {
  url: string;
  markingScheme: string;
}

export interface ScrapeCBTResponse {
  success: boolean;
  data?: ExamResult;
  error?: string;
}

export interface ProcessOMRRequest {
  imageData: string;
  totalQuestions: number;
  answerKey?: string;
  markingScheme: string;
}

export interface ProcessOMRResponse {
  success: boolean;
  data?: ExamResult;
  detectedAnswers?: string[];
  error?: string;
}

export interface AnalyzePaperRequest {
  imageData: string;
}

export interface AnalyzePaperResponse {
  success: boolean;
  questions?: Question[];
  topics?: TopicBreakdown[];
  error?: string;
}

export interface GenerateReportRequest {
  examResultId: string;
}

export interface GenerateReportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}
