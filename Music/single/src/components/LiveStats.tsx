'use client'

import { useState, useEffect } from 'react'
import { Users, User, UserCheck } from 'lucide-react'
import { getAdminStats } from '@/app/actions'

export function LiveStats() {
    const [stats, setStats] = useState({
        total: 0,
        men: 0,
        women: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats()
                const men = data.genderBreakdown.find(g => g.gender === 'Male')?.count || 0
                const women = data.genderBreakdown.find(g => g.gender === 'Female')?.count || 0

                setStats({
                    total: data.totalUsers,
                    men: Number(men),
                    women: Number(women)
                })
            } catch (err) {
                console.error("Failed to fetch stats", err)
            }
        }

        fetchStats()
        // Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    const statItems = [
        { label: 'Registered Users', value: stats.total.toString(), icon: Users, color: 'text-white' },
        { label: 'Men Waiting', value: stats.men.toString(), icon: User, color: 'text-blue-400' },
        { label: 'Women Waiting', value: stats.women.toString(), icon: UserCheck, color: 'text-brand-pink' },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {statItems.map((stat, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                    <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                    <h3 className="text-4xl font-serif font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm opacity-60 uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </div>
    )
}
