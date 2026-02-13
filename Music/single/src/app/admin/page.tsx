'use client'

import { useEffect, useState } from 'react'
import { getAdminStats } from '@/app/actions'
import { motion } from 'framer-motion'
import { Users, Heart, BarChart3, RefreshCw } from 'lucide-react'
import { Background } from '@/components/Background'

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        setLoading(true)
        const data = await getAdminStats()
        setStats(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!stats) return <div className="text-white text-center p-10">Failed to load stats</div>

    const genderMax = Math.max(...stats.genderBreakdown.map((g: any) => g.count), 1)

    return (
        <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-rose selection:text-brand-black">
            <Background />

            <div className="relative z-10 max-w-6xl mx-auto p-8">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-serif italic text-white flex items-center gap-3">
                            <Heart className="text-brand-pink fill-brand-pink" /> Admin Dashboard
                        </h1>
                        <p className="text-white/40 mt-2">Live matching statistics</p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        title="Total Signups"
                        value={stats.totalUsers}
                        icon={<Users className="w-6 h-6 text-brand-pink" />}
                    />
                    <StatCard
                        title="Matches Generated"
                        value={stats.totalMatches}
                        icon={<Heart className="w-6 h-6 text-brand-rose" />}
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${Math.round((stats.completedUsers / stats.totalUsers) * 100) || 0}%`}
                        icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
                    />
                </div>

                {/* Gender Breakdown */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-serif italic mb-8">Gender Breakdown</h2>
                    <div className="space-y-6">
                        {stats.genderBreakdown.map((item: any) => (
                            <div key={item.gender} className="relative">
                                <div className="flex justify-between text-sm mb-2 uppercase tracking-widest text-white/60">
                                    <span>{item.gender}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / genderMax) * 100}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${item.gender === 'Female' ? 'bg-brand-pink' :
                                                item.gender === 'Male' ? 'bg-blue-500' : 'bg-purple-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:border-white/20 transition-colors group">
            <div className="flex justify-between items-start mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-xs uppercase tracking-widest">{title}</span>
                {icon}
            </div>
            <div className="text-5xl font-serif font-bold">{value}</div>
        </div>
    )
}
