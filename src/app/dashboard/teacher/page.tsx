'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, getClassStudents, supabase } from '@/lib/supabase/client'
import { StatCard } from '@/components/dashboard/StatCard'

export default function TeacherDashboard() {
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [classStats, setClassStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        avgXP: 0,
        avgQuizScore: 0,
    })

    useEffect(() => {
        loadTeacherDashboard()
    }, [])

    useEffect(() => {
        if (selectedClass) {
            loadClassData()
        }
    }, [selectedClass])

    async function loadTeacherDashboard() {
        const { user: currentUser } = await getCurrentUser()
        if (!currentUser) return

        setUser(currentUser)

        // Get teacher's classes
        const { data: classesData } = await supabase
            .from('teacher_classes')
            .select('*')
            .eq('teacher_id', currentUser.id)
            .order('created_at', { ascending: false })

        setClasses(classesData || [])
        if (classesData && classesData.length > 0) {
            setSelectedClass(classesData[0])
        }
    }

    async function loadClassData() {
        if (!selectedClass) return

        // Get students in this class
        const { data: enrollments } = await getClassStudents(selectedClass.id)

        const studentsData = enrollments?.map((e: any) => ({
            ...e.student,
            enrolledAt: e.enrolled_at,
            progress: e.student.progress || [],
        })) || []

        // Calculate stats
        const totalXPs = studentsData.map((s: any) =>
            s.progress.reduce((sum: number, p: any) => sum + p.xp, 0)
        )

        const avgXP = totalXPs.length ? totalXPs.reduce((sum: number, xp: number) => sum + xp, 0) / totalXPs.length : 0

        // Active students (activity in last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const activeCount = studentsData.filter((s: any) =>
            s.progress.some((p: any) => new Date(p.last_activity) > weekAgo)
        ).length

        setStudents(studentsData)
        setClassStats({
            totalStudents: studentsData.length,
            activeStudents: activeCount,
            avgXP: Math.round(avgXP),
            avgQuizScore: 0, // TODO: calculate from quiz attempts
        })
    }

    async function handleCreateClass() {
        const className = prompt('Nome da turma:')
        if (!className) return

        const { createClass } = await import('@/lib/supabase/client')
        await createClass(user.id, className)
        loadTeacherDashboard()
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-purple mx-auto mb-4"></div>
                    <p>Carregando painel do professor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Painel do Professor 👨‍🏫</h1>
                    <p className="text-gray-600 dark:text-gray-400">Acompanhe o desempenho das suas turmas</p>
                </div>
                <button
                    onClick={handleCreateClass}
                    className="px-6 py-3 bg-gradient-to-r from-lab-blue to-lab-cyan text-white font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    + Nova Turma
                </button>
            </div>

            {/* Class Selector */}
            {classes.length > 0 ? (
                <div className="mb-8">
                    <label className="block text-sm font-bold mb-2">Selecione a Turma:</label>
                    <select
                        className="w-full max-w-md px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 font-semibold"
                        value={selectedClass?.id || ''}
                        onChange={(e) => {
                            const cls = classes.find((c) => c.id === e.target.value)
                            setSelectedClass(cls)
                        }}
                    >
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.class_name} - Código: {cls.class_code} ({cls.student_count} alunos)
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center mb-8">
                    <p className="text-lg mb-4">Você ainda não tem turmas cadastradas.</p>
                    <button
                        onClick={handleCreateClass}
                        className="px-6 py-3 bg-gradient-to-r from-lab-blue to-lab-cyan text-white font-bold rounded-xl"
                    >
                        Criar Primeira Turma
                    </button>
                </div>
            )}

            {selectedClass && (
                <>
                    {/* Class Code Display */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 mb-8">
                        <p className="text-sm font-semibold mb-2">Código da Turma (para alunos entrarem):</p>
                        <p className="text-4xl font-black text-purple-600 dark:text-purple-400 tracking-widest">
                            {selectedClass.class_code}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total de Alunos" value={classStats.totalStudents} icon="👥" color="blue" />
                        <StatCard title="Alunos Ativos" value={classStats.activeStudents} icon="🟢" color="green" />
                        <StatCard title="XP Médio" value={classStats.avgXP} icon="⭐" color="yellow" />
                        <StatCard title="Média em Quizzes" value={`${classStats.avgQuizScore}%`} icon="📊" color="purple" />
                    </div>

                    {/* Top 5 Students */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4">🏆 Top 5 Alunos</h2>
                        <div className="space-y-3">
                            {students
                                .sort((a, b) => {
                                    const aXP = a.progress.reduce((sum: number, p: any) => sum + p.xp, 0)
                                    const bXP = b.progress.reduce((sum: number, p: any) => sum + p.xp, 0)
                                    return bXP - aXP
                                })
                                .slice(0, 5)
                                .map((student, i) => {
                                    const totalXP = student.progress.reduce((sum: number, p: any) => sum + p.xp, 0)
                                    const medals = ['🥇', '🥈', '🥉', '🎖️', '🎖️']

                                    return (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{medals[i]}</span>
                                                <div>
                                                    <p className="font-bold text-lg">{student.full_name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-yellow-500 font-bold text-xl">{totalXP} XP</span>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* All Students Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">📋 Todos os Alunos</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                        <th className="text-left p-3 font-bold">Aluno</th>
                                        <th className="text-left p-3 font-bold">Email</th>
                                        <th className="text-center p-3 font-bold">XP Total</th>
                                        <th className="text-center p-3 font-bold">Nível</th>
                                        <th className="text-center p-3 font-bold">Última Atividade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => {
                                        const totalXP = student.progress.reduce((sum: number, p: any) => sum + p.xp, 0)
                                        const level = Math.floor(totalXP / 100) + 1
                                        const lastActivity = student.progress.length > 0
                                            ? new Date(
                                                Math.max(...student.progress.map((p: any) => new Date(p.last_activity).getTime()))
                                            ).toLocaleDateString('pt-BR')
                                            : 'Nunca'

                                        return (
                                            <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700">
                                                <td className="p-3 font-semibold">{student.full_name}</td>
                                                <td className="p-3 text-gray-600 dark:text-gray-400">{student.email}</td>
                                                <td className="p-3 text-center font-bold text-yellow-500">{totalXP}</td>
                                                <td className="p-3 text-center font-bold text-purple-500">{level}</td>
                                                <td className="p-3 text-center text-gray-600 dark:text-gray-400">{lastActivity}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
