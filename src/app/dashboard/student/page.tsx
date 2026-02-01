'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, getUserProgress, supabase } from '@/lib/supabase/client'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { StatCard } from '@/components/dashboard/StatCard'
import { AdaptiveFocus } from '@/components/dashboard/AdaptiveFocus'

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        totalXP: 0,
        level: 1,
        completedLessons: 0,
        simulatorSessions: 0,
        avgQuizScore: 0,
        studyStreak: 0,
    })
    const [progressData, setProgressData] = useState<any[]>([])
    const [achievements, setAchievements] = useState<string[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        const { user: currentUser } = await getCurrentUser()
        if (!currentUser) return

        setUser(currentUser)

        // Get user progress
        const { data: progress } = await getUserProgress(currentUser.id)

        // Calculate total XP from all modules
        const totalXP = progress?.reduce((sum: number, p: any) => sum + p.xp, 0) || 0

        // Get all achievements
        const allAchievements = progress
            ?.flatMap((p: any) => p.achievements || [])
            .filter((a: string, i: number, arr: string[]) => arr.indexOf(a) === i) || []

        // Get simulator sessions count
        const { count: sessionsCount } = await supabase
            .from('simulator_sessions')
            .select('id', { count: 'exact' })
            .eq('user_id', currentUser.id)
            .eq('completed', true)

        // Get quiz average
        const { data: quizzes } = await supabase
            .from('quiz_attempts')
            .select(' score')
            .eq('user_id', currentUser.id)

        const avgScore = quizzes?.length
            ? quizzes.reduce((sum: number, q: any) => sum + q.score, 0) / quizzes.length
            : 0

        // Get progress over time for chart
        const { data: sessions } = await supabase
            .from('simulator_sessions')
            .select('created_at, xp_earned')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true })
            .limit(30)

        // Get recent activity
        const { data: recentSessions } = await supabase
            .from('simulator_sessions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5)

        setStats({
            totalXP,
            level: Math.floor(totalXP / 100) + 1,
            completedLessons: progress?.reduce((sum: number, p: any) => sum + (p.completed_lessons?.length || 0), 0) || 0,
            simulatorSessions: sessionsCount || 0,
            avgQuizScore: Math.round(avgScore),
            studyStreak: 7, // TODO: calculate from activity dates
        })

        setProgressData(sessions || [])
        setAchievements(allAchievements)
        setRecentActivity(recentSessions || [])
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-purple mx-auto mb-4"></div>
                    <p>Carregando seu painel...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Olá, {user.user_metadata?.full_name || 'Estudante'}! 👋</h1>
                <p className="text-gray-600 dark:text-gray-400">Bem-vindo ao seu painel de estudos</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="XP Total" value={stats.totalXP} icon="⭐" color="yellow" />
                <StatCard title="Nível" value={stats.level} icon="🎖️" color="purple" />
                <StatCard title="Experimentos" value={stats.simulatorSessions} icon="🧪" color="blue" />
                <StatCard title="Lições Completas" value={stats.completedLessons} icon="📚" color="green" />
                <StatCard title="Média em Quizzes" value={`${stats.avgQuizScore}%`} icon="✅" color="teal" />
                <StatCard title="Sequência de Estudos" value={`${stats.studyStreak} dias`} icon="🔥" color="orange" />
            </div>

            {/* Progress Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">📈 Progresso nos Últimos 30 Dias</h2>
                <ProgressChart data={progressData} />
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Achievements */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">🏆 Conquistas</h2>
                    <div className="space-y-3">
                        {achievements.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Nenhuma conquista ainda. Continue estudando!</p>
                        ) : (
                            achievements.map((achievement, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-400"
                                >
                                    <span className="text-3xl">🏆</span>
                                    <div>
                                        <p className="font-bold">{achievement}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Desbloqueada!</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">📝 Atividade Recente</h2>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Nenhuma atividade ainda. Comece a estudar!</p>
                        ) : (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{getSimulatorName(activity.simulator_type)}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <span className="text-yellow-500 font-bold">+{activity.xp_earned} XP</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function getSimulatorName(type: string): string {
    const names: Record<string, string> = {
        thermo: '🔥 Termoquímica',
        kinetics: '⚡ Cinética Química',
        solutions: '💧 Soluções',
        gases: '🎈 Gases',
        molecule_builder: '🧬 Construtor de Moléculas',
        memory_game: '🎮 Memory Game',
        detective: '🔍 Detetive Químico',
    }
    return names[type] || type
}
