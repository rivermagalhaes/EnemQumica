import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

export const supabase = createClientComponentClient<Database>()

// ==================== AUTH FUNCTIONS ====================

export async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'teacher' = 'student'
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: role,
            },
        },
    })

    if (error) return { data: null, error }

    // Create user profile
    if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
        })

        if (profileError) return { data: null, error: profileError }
    }

    return { data, error: null }
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })
    return { data, error }
}

export async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    return { user, error }
}

// ==================== PROGRESS FUNCTIONS ====================

export async function getUserProgress(userId: string) {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

    return { data, error }
}

export async function updateProgress(
    userId: string,
    module: string,
    xpToAdd: number,
    achievement?: string
) {
    // Get current progress
    const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module', module)
        .single()

    if (existing) {
        // Update existing
        const newXP = existing.xp + xpToAdd
        const newLevel = Math.floor(newXP / 100) + 1
        const newAchievements = achievement
            ? [...existing.achievements, achievement]
            : existing.achievements

        const { data, error } = await supabase
            .from('user_progress')
            .update({
                xp: newXP,
                level: newLevel,
                achievements: newAchievements,
                last_activity: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single()

        return { data, error }
    } else {
        // Create new
        const { data, error } = await supabase
            .from('user_progress')
            .insert({
                user_id: userId,
                module,
                xp: xpToAdd,
                level: 1,
                achievements: achievement ? [achievement] : [],
            })
            .select()
            .single()

        return { data, error }
    }
}

// ==================== SIMULATOR FUNCTIONS ====================

export async function recordSimulatorSession(
    userId: string,
    simulatorType: string,
    parameters: any,
    results: any,
    xpEarned: number,
    duration: number
) {
    const { data, error } = await supabase
        .from('simulator_sessions')
        .insert({
            user_id: userId,
            simulator_type: simulatorType,
            parameters,
            results,
            xp_earned: xpEarned,
            duration_seconds: duration,
            completed: true,
        })
        .select()
        .single()

    // Update user progress
    if (!error && xpEarned > 0) {
        const module = getModuleForSimulator(simulatorType)
        await updateProgress(userId, module, xpEarned)
    }

    return { data, error }
}

function getModuleForSimulator(type: string): string {
    if (['thermo', 'kinetics', 'solutions', 'gases'].includes(type)) {
        return 'physichem'
    }
    if (['molecule_builder', 'memory_game', 'detective'].includes(type)) {
        return 'organica'
    }
    return 'quimica_geral'
}

// ==================== QUIZ FUNCTIONS ====================

export async function recordQuizAttempt(
    userId: string,
    quizId: string,
    module: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    timeSpent: number,
    answers: any
) {
    const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
            user_id: userId,
            quiz_id: quizId,
            module,
            score,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            time_spent_seconds: timeSpent,
            answers,
        })
        .select()
        .single()

    // Award XP based on score
    const xpEarned = Math.round(score * 0.5) // 50 XP for 100%
    if (xpEarned > 0) {
        await updateProgress(userId, module, xpEarned)
    }

    return { data, error }
}

// ==================== TEACHER FUNCTIONS ====================

export async function createClass(
    teacherId: string,
    className: string,
    school?: string,
    grade?: number
) {
    // Generate unique class code
    const classCode = generateClassCode()

    const { data, error } = await supabase
        .from('teacher_classes')
        .insert({
            teacher_id: teacherId,
            class_name: className,
            class_code: classCode,
            school,
            grade,
        })
        .select()
        .single()

    return { data, error }
}

export async function joinClass(studentId: string, classCode: string) {
    // Find class by code
    const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('id')
        .eq('class_code', classCode)
        .single()

    if (classError || !classData) {
        return { data: null, error: classError || new Error('Class not found') }
    }

    // Enroll student
    const { data, error } = await supabase
        .from('class_enrollments')
        .insert({
            class_id: classData.id,
            student_id: studentId,
        })
        .select()
        .single()

    return { data, error }
}

export async function getClassStudents(classId: string) {
    const { data, error } = await supabase
        .from('class_enrollments')
        .select(
            `
      *,
      student:users(
        id,
        full_name,
        email,
        progress:user_progress(*)
      )
    `
        )
        .eq('class_id', classId)

    return { data, error }
}

// ==================== HELPER FUNCTIONS ====================

function generateClassCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// ==================== ENEM CONTENT ====================

export async function getENEMQuestions(filters?: {
    year?: number
    topic?: string
    difficulty?: string
    limit?: number
}) {
    let query = supabase
        .from('enem_questions')
        .select('*')
        .eq('is_active', true)

    if (filters?.year) {
        query = query.eq('year', filters.year)
    }
    if (filters?.topic) {
        query = query.eq('topic', filters.topic)
    }
    if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
    }

    query = query.limit(filters?.limit || 10)

    const { data, error } = await query

    return { data, error }
}

export async function getENEMNews(limit: number = 5) {
    const { data, error } = await supabase
        .from('enem_news')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(limit)

    return { data, error }
}

export async function getDailyChallenge() {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .single()

    return { data, error }
}
