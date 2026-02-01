interface StatCardProps {
    title: string
    value: string | number
    icon: string
    color?: 'yellow' | 'purple' | 'blue' | 'green' | 'teal' | 'orange'
}

export function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        yellow: 'from-yellow-400 to-orange-400',
        purple: 'from-purple-400 to-pink-400',
        blue: 'from-blue-400 to-cyan-400',
        green: 'from-green-400 to-emerald-400',
        teal: 'from-teal-400 to-cyan-400',
        orange: 'from-orange-400 to-red-400',
    }

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
            {/* Gradient background */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {title}
                    </p>
                    <span className="text-3xl">{icon}</span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent">
                    {value}
                </p>
            </div>
        </div>
    )
}
