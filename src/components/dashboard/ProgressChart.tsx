'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProgressChartProps {
    data: Array<{ created_at: string; xp_earned: number }>
}

export function ProgressChart({ data }: ProgressChartProps) {
    const chartData = data.map((session) => ({
        date: new Date(session.created_at).toLocaleDateString('pt-BR', {
            month: 'short',
            day: 'numeric',
        }),
        xp: session.xp_earned || 0,
    }))

    // Cumulative XP
    let cumulativeXP = 0
    const cumulativeData = chartData.map((item) => {
        cumulativeXP += item.xp
        return {
            ...item,
            cumulative: cumulativeXP,
        }
    })

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
