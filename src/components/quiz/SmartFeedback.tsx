'use client'

interface SmartFeedbackProps {
    questionId: string
    questionText: string
    userAnswer: string
    correctAnswer: string
    explanation?: {
        why_correct: string
        common_mistakes: Array<{
            option: string
            why_wrong: string
            trap: string
        }>
        key_concept: string
        related_topics?: string[]
        video_url?: string
    }
    onReview?: () => void
}

export function SmartFeedback({
    questionId,
    questionText,
    userAnswer,
    correctAnswer,
    explanation,
    onReview,
}: SmartFeedbackProps) {
    const isCorrect = userAnswer === correctAnswer
    const errorType = classifyError(userAnswer, correctAnswer, explanation)
    const userMistake = explanation?.common_mistakes?.find((m) => m.option === userAnswer)

    return (
        <div
            className={`rounded-2xl p-6 shadow-xl border-4 ${isCorrect
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600'
                    : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-400 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-600'
                }`}
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl">{isCorrect ? '✅' : '❌'}</div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">
                        {isCorrect ? 'Parabéns! Você acertou! 🎉' : 'Ops! Vamos entender o erro'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        {isCorrect ? (
                            <>
                                Sua resposta <strong className="text-green-600">"{userAnswer}"</strong> está
                                correta!
                            </>
                        ) : (
                            <>
                                Você marcou <strong className="text-red-600">"{userAnswer}"</strong> mas a
                                resposta é <strong className="text-green-600">"{correctAnswer}"</strong>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Explanation */}
            {explanation && (
                <div className="space-y-4">
                    {/* Why Correct */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">📖</span>
                            <span>Explicação da Resposta Correta</span>
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {explanation.why_correct}
                        </p>
                    </div>

                    {/* Error Analysis (if wrong) */}
                    {!isCorrect && userMistake && (
                        <>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-5 rounded-r-xl">
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                                    <span className="text-2xl">🎯</span>
                                    <span>Você caiu na pegadinha do ENEM!</span>
                                </h4>
                                <p className="text-yellow-900 dark:text-yellow-200 mb-3">{userMistake.trap}</p>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    <strong>Por que está errado:</strong> {userMistake.why_wrong}
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border-2 border-blue-300 dark:border-blue-700">
                                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">💡</span>
                                    <span>Tipo de Erro: {getErrorLabel(errorType)}</span>
                                </h4>
                                <p className="text-blue-900 dark:text-blue-200">{getErrorAdvice(errorType)}</p>
                            </div>
                        </>
                    )}

                    {/* Key Concept */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border-2 border-purple-300 dark:border-purple-700">
                        <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🔑</span>
                            <span>Conceito-Chave para Memorizar</span>
                        </h4>
                        <p className="text-purple-900 dark:text-purple-200 leading-relaxed">
                            {explanation.key_concept}
                        </p>
                    </div>

                    {/* Related Topics */}
                    {explanation.related_topics && explanation.related_topics.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                                📚 Assuntos Relacionados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {explanation.related_topics.map((topic, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-600"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onReview}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
                        >
                            📚 Revisar Assunto Completo
                        </button>
                        {explanation.video_url && (
                            <button
                                onClick={() => window.open(explanation.video_url, '_blank')}
                                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
                            >
                                🎥 Assistir Videoaula
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* No Explanation Available */}
            {!explanation && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        {isCorrect
                            ? '✨ Ótimo trabalho! Continue praticando para dominar este assunto.'
                            : '📝 Explicação detalhada em breve. Revise seus estudos sobre este tema.'}
                    </p>
                </div>
            )}
        </div>
    )
}

// ==================== HELPER FUNCTIONS ====================

function classifyError(
    userAnswer: string,
    correctAnswer: string,
    explanation?: SmartFeedbackProps['explanation']
): 'concept' | 'interpretation' | 'calculation' | 'carelessness' {
    if (!explanation) return 'carelessness'

    const mistake = explanation.common_mistakes?.find((m) => m.option === userAnswer)
    if (!mistake) return 'carelessness'

    const trapLower = mistake.trap.toLowerCase()

    if (trapLower.includes('conceito') || trapLower.includes('teoria')) return 'concept'
    if (trapLower.includes('interpretação') || trapLower.includes('enunciado')) return 'interpretation'
    if (trapLower.includes('cálculo') || trapLower.includes('conta')) return 'calculation'

    return 'carelessness'
}

function getErrorLabel(type: 'concept' | 'interpretation' | 'calculation' | 'carelessness'): string {
    const labels = {
        concept: '❌ Erro Conceitual',
        interpretation: '📖 Erro de Interpretação',
        calculation: '🔢 Erro de Cálculo',
        carelessness: '⚡ Desatenção',
    }
    return labels[type]
}

function getErrorAdvice(type: 'concept' | 'interpretation' | 'calculation' | 'carelessness'): string {
    const advice = {
        concept:
            'Este é um erro conceitual. Você precisa revisar a teoria e os conceitos fundamentais deste assunto. Não adianta fazer muitas questões sem entender a base!',
        interpretation:
            'Erro de interpretação do enunciado. Leia com MAIS ATENÇÃO! Sublinhe palavras-chave como "NÃO", "EXCETO", "INCORRETO". O ENEM adora colocar pegadinhas na leitura.',
        calculation:
            'Erro nos cálculos. Você sabe fazer, mas errou na execução. Refaça os cálculos com calma, anotando cada passo. Verifique unidades e sinais!',
        carelessness:
            'Você sabe este assunto! Foi desatenção ou pressa. Respire fundo, leia duas vezes e marque sua resposta com certeza. Às vezes menos pressa = mais acertos.',
    }
    return advice[type]
}
