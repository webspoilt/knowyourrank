'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Link2,
  Calculator,
  TrendingUp,
  AlertCircle,
  FileText,
  Target,
  Award,
  CheckCircle2,
  XCircle,
  Users,
  Trophy,
  ChevronDown,
  ChevronRight,
  Loader2,
  Download,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
  Info,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { MARKING_SCHEMES } from '@/lib/constants'
import type { Question, ExamResult } from '@/lib/types'

// Indian States
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'
]

const CATEGORIES = ['UR', 'OBC', 'EWS', 'SC', 'ST']
const HORIZONTAL_CATEGORIES = ['None', 'EX-SM', 'OH', 'VH', 'HH', 'Other PWD']
const GENDERS = ['Male', 'Female']
const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Odia', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Assamese']

// Sample questions for demo
const sampleQuestions: Question[] = Array.from({ length: 100 }, (_, i) => {
  const topics = ['Math', 'Reasoning', 'English', 'GK', 'Computer', 'Science']
  const difficulties = ['Easy', 'Medium', 'Hard']
  const options = ['A', 'B', 'C', 'D']
  const correctAnswer = options[Math.floor(Math.random() * options.length)]
  const userAnswer = Math.random() > 0.15 ? options[Math.floor(Math.random() * options.length)] : null
  
  return {
    id: `q-${i + 1}`,
    questionNumber: i + 1,
    questionText: `Question ${i + 1}`,
    options: options.map(opt => ({ id: opt, label: opt, text: `Option ${opt}` })),
    correctAnswer,
    userAnswer,
    isCorrect: userAnswer === correctAnswer,
    topic: topics[Math.floor(Math.random() * topics.length)],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    marks: 1,
    negativeMarks: 0.25,
  }
})

export default function Home() {
  // Form state
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url')
  const [answerKeyUrl, setAnswerKeyUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedHorizontalCategory, setSelectedHorizontalCategory] = useState('None')
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [selectedScheme, setSelectedScheme] = useState('ssc-cgl')
  const [customPositive, setCustomPositive] = useState(1)
  const [customNegative, setCustomNegative] = useState(0.25)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showExamList, setShowExamList] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate score based on marking scheme
  const calculateResult = useCallback(() => {
    const scheme = MARKING_SCHEMES.find(s => s.id === selectedScheme)
    const positive = scheme?.positiveMarks ?? customPositive
    const negative = scheme?.negativeMarks ?? customNegative
    
    let correct = 0, incorrect = 0, skipped = 0, obtainedMarks = 0
    
    sampleQuestions.forEach(q => {
      if (!q.userAnswer) {
        skipped++
      } else if (q.isCorrect) {
        correct++
        obtainedMarks += positive
      } else {
        incorrect++
        obtainedMarks -= negative
      }
    })
    
    const totalQuestions = sampleQuestions.length
    const attempted = correct + incorrect
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 10000) / 100 : 0
    
    // Generate topic breakdown
    const topicMap = new Map<string, { total: number; correct: number; incorrect: number; skipped: number }>()
    sampleQuestions.forEach(q => {
      if (!topicMap.has(q.topic)) {
        topicMap.set(q.topic, { total: 0, correct: 0, incorrect: 0, skipped: 0 })
      }
      const stats = topicMap.get(q.topic)!
      stats.total++
      if (!q.userAnswer) stats.skipped++
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
    const sillyMistakes = sampleQuestions
      .filter(q => q.difficulty === 'Easy' && q.isCorrect === false)
      .map(q => ({
        questionNumber: q.questionNumber,
        topic: q.topic,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer || 'Not attempted',
        reason: `This was an easy question in ${q.topic}. Review the basics.`
      }))
    
    const result: ExamResult = {
      id: Date.now().toString(),
      examName: 'Score Analysis',
      examType: 'CBT',
      url: answerKeyUrl || undefined,
      totalQuestions,
      attempted,
      correct,
      incorrect,
      skipped,
      totalMarks: totalQuestions * positive,
      obtainedMarks: Math.round(obtainedMarks * 100) / 100,
      accuracy,
      questions: sampleQuestions,
      topicBreakdown,
      sillyMistakes,
      createdAt: new Date(),
    }
    
    return result
  }, [selectedScheme, customPositive, customNegative, answerKeyUrl])

  // Handle form submit
  const handleSubmit = async () => {
    if (activeTab === 'url' && !answerKeyUrl.trim()) {
      alert('Please enter Answer Key URL')
      return
    }
    if (activeTab === 'file' && !uploadedFile) {
      alert('Please upload a file')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = calculateResult()
      setExamResult(result)
      setShowResults(true)
    } catch (error) {
      alert('Error processing request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  // Reset form
  const handleReset = () => {
    setAnswerKeyUrl('')
    setUploadedFile(null)
    setShowResults(false)
    setExamResult(null)
  }

  // Pie chart data
  const pieData = examResult ? [
    { name: 'Correct', value: examResult.correct, color: '#22c55e' },
    { name: 'Incorrect', value: examResult.incorrect, color: '#ef4444' },
    { name: 'Skipped', value: examResult.skipped, color: '#f59e0b' },
  ] : []

  // Popular exams list
  const popularExams = [
    { name: 'SSC CGL 2025', scheme: 'ssc-cgl', badge: 'Popular' },
    { name: 'SSC CHSL 2025', scheme: 'ssc-chsl', badge: 'New' },
    { name: 'RRB NTPC 2025', scheme: 'rrb-ntpc', badge: '' },
    { name: 'RRB Group D 2025', scheme: 'rrb-group-d', badge: 'New' },
    { name: 'IBPS PO 2025', scheme: 'ibps-po', badge: '' },
    { name: 'UPSC Prelims 2025', scheme: 'upsc-prelims', badge: '' },
    { name: 'UGC NET 2025', scheme: 'ugc-net', badge: 'No Negative' },
    { name: 'OSSSC RI 2025', scheme: 'osssc-ri', badge: 'Odisha' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-yellow-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1">
            <span className="bg-white px-2 py-1 rounded font-bold text-lg">
              <span className="text-red-600">KNOW</span>
              <span className="text-gray-900">YOUR</span>
              <span className="text-indigo-600">RANK</span>
            </span>
            <span className="text-xs text-gray-700 ml-1 hidden sm:inline">.in</span>
          </a>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800 hidden md:inline">
              Score Calculator & Rank Predictor
            </span>
            <button
              className="md:hidden p-2 rounded hover:bg-yellow-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {!showResults ? (
            /* Calculator Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Popular Exams Quick Access */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-center mb-3 font-medium">
                  🥇 Quick Access - Popular Exam Calculators 🥇
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {popularExams.slice(0, 4).map((exam, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedScheme(exam.scheme)}
                      className="bg-white/20 hover:bg-white/30 rounded px-3 py-2 text-sm text-center transition-all"
                    >
                      {exam.name}
                      {exam.badge && (
                        <span className="ml-1 text-xs bg-red-500 px-1 rounded">
                          {exam.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowExamList(!showExamList)}
                  className="w-full mt-3 text-sm text-white/80 hover:text-white flex items-center justify-center gap-1"
                >
                  {showExamList ? 'Hide' : 'Show'} All Exams
                  <ChevronDown className={`w-4 h-4 transition-transform ${showExamList ? 'rotate-180' : ''}`} />
                </button>
                
                {showExamList && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {popularExams.slice(4).map((exam, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedScheme(exam.scheme)}
                        className="bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-sm text-center transition-all"
                      >
                        {exam.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Calculator Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gray-100 border-b pb-3">
                  <CardTitle className="text-lg text-center">
                    📝 Submit Your Answer Key To Check Marks & Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Help Link */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-center text-sm">
                    <a href="#" className="text-blue-600 hover:underline">
                      📺 How To Check Marks & Score? (Video Tutorial)
                    </a>
                  </div>

                  {/* URL / File Tabs */}
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <div className="flex border-b border-gray-200 mb-3">
                      <button
                        onClick={() => setActiveTab('url')}
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'url'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Link2 className="w-4 h-4 inline mr-1" />
                        By URL
                      </button>
                      <button
                        onClick={() => setActiveTab('file')}
                        className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'file'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-1" />
                        By File
                      </button>
                    </div>

                    {activeTab === 'url' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer Key URL <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="url"
                          placeholder="https://exam.example.com/answer-key..."
                          value={answerKeyUrl}
                          onChange={(e) => setAnswerKeyUrl(e.target.value)}
                          className="h-11"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Paste your TCS iON, Digialm, or other exam portal URL
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Downloaded File <span className="text-red-500">*</span>
                        </label>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".html,.htm,.pdf"
                          onChange={handleFileChange}
                          className="h-11 cursor-pointer"
                        />
                        {uploadedFile && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Selected: {uploadedFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Choose</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Horizontal Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horizontal Category
                      </label>
                      <select
                        value={selectedHorizontalCategory}
                        onChange={(e) => setSelectedHorizontalCategory(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {HORIZONTAL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Choose</option>
                        {GENDERS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Choose State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Paper Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paper Language
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>

                    {/* Marking Scheme */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exam / Marking Scheme
                      </label>
                      <select
                        value={selectedScheme}
                        onChange={(e) => setSelectedScheme(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <optgroup label="Odisha Exams">
                          {MARKING_SCHEMES.filter(s => ['osssc-ri', 'ossc-cgl', 'opsc-aso'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (+{s.positiveMarks}/-{s.negativeMarks})</option>
                          ))}
                        </optgroup>
                        <optgroup label="SSC Exams">
                          {MARKING_SCHEMES.filter(s => ['ssc-cgl', 'ssc-chsl', 'ssc-mts', 'ssc-gd'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (+{s.positiveMarks}/-{s.negativeMarks})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Banking Exams">
                          {MARKING_SCHEMES.filter(s => ['ibps-po', 'ibps-clerk', 'sbi-po', 'sbi-clerk'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (+{s.positiveMarks}/-{s.negativeMarks})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Railway Exams">
                          {MARKING_SCHEMES.filter(s => ['rrb-ntpc', 'rrb-group-d', 'rrb-je'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (+{s.positiveMarks}/-{s.negativeMarks})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Teaching Exams">
                          {MARKING_SCHEMES.filter(s => ['ugc-net', 'ctet', 'otet'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} {s.negativeMarks === 0 ? '(No Negative)' : ''}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Other Exams">
                          {MARKING_SCHEMES.filter(s => ['upsc-prelims', 'gate', 'cat', 'neet', 'jee-main', 'nda'].includes(s.id)).map(s => (
                            <option key={s.id} value={s.id}>{s.name} (+{s.positiveMarks}/-{s.negativeMarks})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Custom">
                          <option value="custom">Custom - Set Your Own</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Custom Marking Scheme */}
                  {selectedScheme === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-100 p-3 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Positive Marks
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={customPositive}
                          onChange={(e) => setCustomPositive(parseFloat(e.target.value) || 0)}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Negative Marks
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={customNegative}
                          onChange={(e) => setCustomNegative(parseFloat(e.target.value) || 0)}
                          className="h-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        Calculate Marks & Check Rank
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Section */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600" />
                  How It Works
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <p>Paste your exam answer key URL or upload the downloaded HTML file</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <p>Select your category, state, and exam type for accurate ranking</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <p>Get instant marks, accuracy analysis, and predicted rank</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results View */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Back Button */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Calculate Another
              </Button>

              {/* Score Card */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white text-center">
                  <h2 className="text-xl font-bold">Your Score Analysis</h2>
                  <p className="text-white/80 text-sm">{examResult?.examType} Exam</p>
                </div>
                <CardContent className="p-6">
                  {/* Main Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{examResult?.correct}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">{examResult?.incorrect}</div>
                      <div className="text-sm text-gray-600">Incorrect</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">{examResult?.skipped}</div>
                      <div className="text-sm text-gray-600">Skipped</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-indigo-600">{examResult?.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="bg-gray-100 rounded-lg p-6 text-center mb-6">
                    <div className="text-5xl font-bold text-gray-800 mb-2">
                      {examResult?.obtainedMarks} / {examResult?.totalMarks}
                    </div>
                    <div className="text-gray-600">Total Marks</div>
                    <div className="mt-4">
                      <Progress 
                        value={(examResult?.obtainedMarks || 0) / (examResult?.totalMarks || 1) * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>

                  {/* Predicted Rank */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-purple-800">Predicted Rank</h3>
                        <p className="text-sm text-purple-600">Based on {Math.floor(Math.random() * 50000) + 10000} submissions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          #{Math.floor(Math.random() * 500) + 100}
                        </div>
                        <div className="text-sm text-purple-500">
                          Top {Math.round((1 - (examResult?.accuracy || 0) / 100) * 10 + 5)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-4">Question Distribution</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        {pieData.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 text-sm">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                            {item.name}: {item.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Topic Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-4">Topic-wise Accuracy</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={examResult?.topicBreakdown.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Silly Mistakes Alert */}
                  {examResult && examResult.sillyMistakes.length > 0 && (
                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Silly Mistakes ({examResult.sillyMistakes.length})
                      </h3>
                      <p className="text-sm text-orange-600 mb-2">
                        You got {examResult.sillyMistakes.length} easy questions wrong. Review these to improve!
                      </p>
                      <div className="text-sm text-orange-700">
                        Topics: {[...new Set(examResult.sillyMistakes.map(m => m.topic))].join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <Button
                    className="w-full mt-6 h-12 bg-gradient-to-r from-indigo-600 to-purple-600"
                    onClick={() => alert('Downloading PDF Report...')}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Detailed Report (PDF)
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-purple-600 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1 text-white/80">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Popular Exams</h4>
              <ul className="space-y-1 text-white/80">
                <li><a href="#" className="hover:text-white">SSC CGL</a></li>
                <li><a href="#" className="hover:text-white">RRB NTPC</a></li>
                <li><a href="#" className="hover:text-white">IBPS PO</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-semibold mb-2">About KnowYourRank.in</h4>
              <p className="text-white/80 text-sm">
                India's most trusted exam score calculator and rank predictor. 
                Get instant analysis of your CBT exam performance with AI-powered insights.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-4 pt-4 text-center text-white/60 text-sm">
            © 2024 KnowYourRank.in — All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  )
}
