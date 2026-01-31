'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase/client'

interface Question {
    id: string
    question_text: string
    question_image_url?: string
    options: {
        a: string
        b: string
        c: string
        d: string
        e: string
    }
    correct_answer: string
    topic: string
    difficulty: string
}

interface SimulationConfig {
    type: 'full' | 'cn' | 'ch' | 'lc' | 'mt'
    duration: number // in minutes
    questionCount: number
}

const SIMULATION_CONFIGS: Record<string, SimulationConfig> = {
    full: { type: 'full', duration: 270, questionCount: 45 }, // 4h30 = 270min (simplified)
    cn: { type: 'cn', duration: 135, questionCount: 45 }, // Ciências da Natureza
    ch: { type: 'ch', duration: 135, questionCount: 45 }, // Ciências Humanas
    lc: { type: 'lc', duration: 135, questionCount: 45 }, // Linguagens e Códigos
    mt: { type: 'mt', duration: 135, questionCount: 45 }, // Matemática
}

export function ENEMSimulator() {
    const [config, setConfig] = useState<SimulationConfig | null>(null)
    const [simulation, setSimulation] = useState<any>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [results, setResults] = useState<any>(null)
    const timerRef = useRef<NodeJS.Timeout>()

    // Timer effect
    useEffect(() => {
        if (!simulation || isPaused || isFinished) return

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    finishSimulation()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [simulation, isPaused, isFinished])

    async function startSimulation(type: keyof typeof SIMULATION_CONFIGS) {
        const simConfig = SIMULATION_CONFIGS[type]
        setConfig(simConfig)

        // Get questions from database
        const { data: questionsData, error } = await supabase
            .from('enem_questions')
            .select('*')
            .eq('subject', 'quimica')
            .eq('is_active', true)
            .limit(simConfig.questionCount)

        if (error || !questionsData) {
            alert('Erro ao carregar questões. Tente novamente.')
            return
        }

        // Shuffle questions
        const shuffled = questionsData.sort(() => Math.random() - 0.5)

        // Create simulation record
        const { user } = await getCurrentUser()
        const { data: sim, error: simError } = await supabase
            .from('enem_simulations')
            .insert({
                user_id: user?.id,
                simulation_type: type,
                started_at: new Date().toISOString(),
                questions_order: shuffled.map((q) => q.id),
                status: 'in_progress',
            })
            .select()
            .single()

        if (simError) {
            alert('Erro ao iniciar simulação.')
            return
        }

        setSimulation(sim)
        setQuestions(shuffled)
        setTimeRemaining(simConfig.duration * 60) // Convert to seconds
        setCurrentQuestion(0)
        setAnswers({})
        setIsPaused(false)
    }

    async function finishSimulation() {
        if (!simulation || isFinished) return

        setIsFinished(true)
        setIsPaused(true)

        // Calculate scores
        const correctCount = Object.entries(answers).filter(
            ([index, answer]) => answer === questions[parseInt(index)].correct_answer
        ).length

        const percentage = (correctCount / questions.length) * 100

        // Calculate TRI (simplified - in production, use proper TRI algorithm)
        const scoreRaw = correctCount
        const scoreTRI = await calculateTRIScore(questions, answers)

        // Save results
        const { user } = await getCurrentUser()
        await supabase
            .from('enem_simulations')
            .update({
                finished_at: new Date().toISOString(),
                total_time_seconds: (config!.duration * 60) - timeRemaining,
                status: 'completed',
                score_raw: scoreRaw,
                score_tri: scoreTRI,
                percentage: percentage,
                answers: answers,
            })
            .eq('id', simulation.id)

        // Update user progress
        if (user) {
            await supabase.from('user_progress').upsert({
                user_id: user.id,
                module: 'simulation',
                xp: Math.round(percentage * 2), // 200 XP for 100%
            })
        }

        setResults({
            correctCount,
            totalQuestions: questions.length,
            percentage,
            scoreTRI,
            timeSpent: (config!.duration * 60) - timeRemaining,
        })
    }

    if (!config) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">⏱️ Simulado ENEM Realista</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Pratique como se fosse a prova real, com cronômetro e nota TRI
                    </p>
                </div>

                <div className="grid gap-6">
                    {Object.entries(SIMULATION_CONFIGS).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => startSimulation(key as keyof typeof SIMULATION_CONFIGS)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl hover:scale-105 transition-transform shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold mb-2">
                                        {key === 'full' && '🎯 Simulado Completo'}
                                        {key === 'cn' && '🧪 Ciências da Natureza'}
                                        {key === 'ch' && '🌍 Ciências Humanas'}
                                        {key === 'lc' && '📖 Linguagens e Códigos'}
                                        {key === 'mt' && '🔢 Matemática'}
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {cfg.questionCount} questões • {cfg.duration} minutos
                                    </p>
                                </div>
                                <div className="text-6xl">→</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    if (isFinished && results) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-12 text-center">
                    <span className="text-8xl mb-6 block">🎉</span>
                    <h2 className="text-4xl font-bold mb-6">Simulado Concluído!</h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                            <div className="text-5xl font-black text-purple-600">{results.correctCount}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Acertos</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                            <div className="text-5xl font-black text-blue-600">{results.percentage.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Aproveitamento</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                            <div className="text-5xl font-black text-green-600">{results.scoreTRI.toFixed(0)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Nota TRI</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                            <div className="text-5xl font-black text-orange-600">{formatTime(results.timeSpent)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Gasto</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-transform"
                        >
                            📊 Ver Gabarito Detalhado
                        </button>
                        <button
                            onClick={() => setConfig(null)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-transform"
                        >
                            🔄 Novo Simulado
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const question = questions[currentQuestion]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Fixed Timer Bar */}
            <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-xl">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black tabular-nums">{formatTime(timeRemaining)}</span>
                            {timeRemaining < 300 && <span className="text-red-400 animate-pulse">⚠️</span>}
                        </div>
                        <div className="text-sm opacity-75">
                            Questão <strong>{currentQuestion + 1}</strong> de <strong>{questions.length}</strong>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
                        >
                            {isPaused ? '▶️ Continuar' : '⏸️ Pausar'}
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Tem certeza que deseja finalizar o simulado?')) {
                                    finishSimulation()
                                }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
                        >
                            ✓ Finalizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-4xl mx-auto pt-24 pb-8 px-4">
                {question && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-bold">
                                {question.topic} • {question.difficulty}
                            </span>
                            <span className="text-3xl font-black text-gray-300">#{currentQuestion + 1}</span>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p className="text-lg leading-relaxed">{question.question_text}</p>
                            {question.question_image_url && (
                                <img src={question.question_image_url} alt="Questão" className="rounded-lg my-6" />
                            )}
                        </div>

                        <div className="space-y-3">
                            {Object.entries(question.options).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setAnswers({ ...answers, [currentQuestion]: key })}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${answers[currentQuestion] === key
                                            ? 'bg-purple-600 text-white border-purple-600 scale-105'
                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-400'
                                        }`}
                                >
                                    <span className="font-bold mr-3">{key.toUpperCase()})</span>
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between gap-4">
                    <button
                        disabled={currentQuestion === 0}
                        onClick={() => setCurrentQuestion((prev) => prev - 1)}
                        className="px-8 py-4 bg-gray-300 dark:bg-gray-700 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        ← Anterior
                    </button>

                    <div className="flex-1 flex gap-2 overflow-x-auto py-2">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQuestion(i)}
                                className={`min-w-[3rem] h-12 rounded-lg font-bold transition-all ${i === currentQuestion
                                        ? 'bg-purple-600 text-white scale-110'
                                        : answers[i]
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={currentQuestion === questions.length - 1}
                        onClick={() => setCurrentQuestion((prev) => prev + 1)}
                        className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                        Próxima →
                    </button>
                </div>
            </div>
        </div>
    )
}

// ==================== HELPER FUNCTIONS ====================

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

async function calculateTRIScore(questions: Question[], answers: Record<number, string>): Promise<number> {
    // Simplified TRI calculation
    let score = 0
    let maxScore = 0

    questions.forEach((q, i) => {
        const weight = q.difficulty === 'hard' ? 1.5 : q.difficulty === 'medium' ? 1.2 : 1.0
        maxScore += 100 * weight

        if (answers[i] === q.correct_answer) {
            score += 100 * weight
        }
    })

    // Normalize to 0-1000 scale
    return maxScore > 0 ? (score / maxScore) * 1000 : 0
}
