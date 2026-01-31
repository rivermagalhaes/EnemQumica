'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Recommendation {
    topic: string
    reason: string
    priority: number
    mastery: number
    total_attempts: number
    status: string
}

interface WeakTopic {
    topic: string
    competency: string
    mastery_score: number
    total_attempts: number
    correct_attempts: number
    status: string
    trend: string
}

export function AdaptiveFocus({ userId }: { userId: string }) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAdaptiveData()
    }, [userId])

    async function loadAdaptiveData() {
        setLoading(true)

        try {
            // Get daily recommendations
            const { data: recs, error: recsError } = await supabase.rpc('get_daily_recommendations', {
                p_user_id: userId,
                p_limit: 3,
            })

            if (recsError) throw recsError

            // Get weak topics
            const { data: weak, error: weakError } = await supabase.rpc('get_weak_topics', {
                p_user_id: userId,
                p_limit: 5,
            })

            if (weakError) throw weakError

            setRecommendations(recs || [])
            setWeakTopics(weak || [])
        } catch (error) {
            console.error('Error loading adaptive data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Seu Foco Hoje */}
            {recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🎯</span>
                        <h2 className="text-2xl font-bold">Seu Foco Hoje</h2>
                    </div>
                    <p className="text-sm opacity-90 mb-6">
                        Baseado no seu desempenho, recomendamos praticar estes assuntos:
                    </p>

                    <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <div
                                key={i}
                                className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{rec.topic}</h3>
                                        <p className="text-sm opacity-90">{rec.reason}</p>
                                        <p className="text-xs opacity-75 mt-2">
                                            {rec.total_attempts} tentativas • Prioridade: {rec.priority}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-xs opacity-75">Domínio</div>
                                        <div className="text-3xl font-black">{Math.round(rec.mastery * 100)}%</div>
                                        <div className="w-20 bg-white/30 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-white rounded-full h-2 transition-all duration-500"
                                                style={{ width: `${rec.mastery * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-lg">
                                    📚 Praticar Agora →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Assuntos em Risco */}
            {weakTopics.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">⚠️</span>
                        <div>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Assuntos em Risco</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Estes assuntos precisam de mais atenção
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {weakTopics.map((topic, i) => {
                            const percentage = Math.round(topic.mastery_score * 100)
                            const statusColors = {
                                critical: 'bg-red-500',
                                needs_review: 'bg-orange-500',
                                improving: 'bg-yellow-500',
                            }
                            const statusLabels = {
                                critical: '🔴 Crítico',
                                needs_review: '🟠 Precisa Revisar',
                                improving: '🟡 Melhorando',
                            }

                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">{topic.topic}</h3>
                                            <span className="text-xs px-2 py-1 bg-red-600 text-white rounded">
                                                {statusLabels[topic.status as keyof typeof statusLabels]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {topic.correct_attempts} de {topic.total_attempts} acertos ({percentage}%)
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Competência: {topic.competency} •{' '}
                                            {topic.trend === 'forgotten'
                                                ? '📅 Esquecido (revisar urgente!)'
                                                : topic.trend === 'below_avg'
                                                    ? '📉 Abaixo da sua média'
                                                    : '📊 Estável'}
                                        </p>
                                    </div>

                                    <div className="ml-4 w-32">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                            <div
                                                className={`h-4 rounded-full transition-all duration-500 ${statusColors[topic.status as keyof typeof statusColors]
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-center text-sm font-bold mt-1">{percentage}%</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                            💡 <strong>Dica:</strong> Foque em dominar um assunto por vez. Comece pelos críticos e
                            pratique até atingir 70% de domínio antes de passar para o próximo!
                        </p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {recommendations.length === 0 && weakTopics.length === 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 text-center border-2 border-blue-200 dark:border-blue-800">
                    <span className="text-6xl mb-4 block">🎓</span>
                    <h3 className="text-2xl font-bold mb-2">Comece a Estudar!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Responda alguns quizzes para recebermos recomendações personalizadas baseadas no seu
                        desempenho.
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg">
                        Fazer Primeiro Quiz 🚀
                    </button>
                </div>
            )}
        </div>
    )
}
