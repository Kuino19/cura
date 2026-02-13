'use client'

import { useState, useEffect } from 'react'

export function Countdown() {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!mounted) return null


    function getTimeRemaining() {
        // Target: Feb 14, 2026
        const targetDate = new Date('2026-02-14T00:00:00').getTime()
        const now = new Date().getTime()
        const distance = targetDate - now

        if (distance < 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
        }
    }

    return (
        <div className="flex gap-4 text-center font-mono">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                    <span className="text-4xl font-bold">{value.toString().padStart(2, '0')}</span>
                    <span className="text-xs uppercase opacity-70">{unit}</span>
                </div>
            ))}
        </div>
    )
}
