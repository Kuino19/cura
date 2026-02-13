'use client'

import { useState, useEffect } from 'react'
import { Countdown } from '@/components/Countdown'
import { LiveStats } from '@/components/LiveStats'
import { Questionnaire } from '@/components/Questionnaire'
import { Background } from '@/components/Background'
import { motion } from 'framer-motion'
import { Heart, Search, Lock } from 'lucide-react'
import { getMatches } from '@/app/actions'
// import type { Question } from '@prisma/client'

type Question = {
    id: string;
    text: string;
    type: string;
    category: string;
}

export function HomePage({ questions }: { questions: Question[] }) {
    const [isRevealDay, setIsRevealDay] = useState(false)
    const [showQuestionnaire, setShowQuestionnaire] = useState(false)

    console.log('HomePage Render:', { isRevealDay, showQuestionnaire, questionCount: questions?.length })

    // Reveal State
    const [phoneNumber, setPhoneNumber] = useState('')
    const [matches, setMatches] = useState<any[]>([])
    const [loadingMatches, setLoadingMatches] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        // Check if it's Feb 14th or later
        const checkDate = () => {
            const now = new Date()
            // Month is 0-indexed (Feb = 1)
            if (now.getMonth() === 1 && now.getDate() >= 14 && now.getFullYear() >= 2026) {
                setIsRevealDay(true)
            }
        }
        checkDate()
    }, [])

    // Debug toggle for testing
    const toggleDebugDate = () => setIsRevealDay(!isRevealDay)

    const handleCheckMatches = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingMatches(true)
        const results = await getMatches(phoneNumber)
        setMatches(results || [])
        setHasSearched(true)
        setLoadingMatches(false)
    }

    return (
        <main className="min-h-screen bg-brand-black text-white selection:bg-brand-pink selection:text-white overflow-hidden relative font-sans">
            <Background />

            {/* Navbar / Header */}
            <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>
                    <Heart className="w-6 h-6 text-brand-pink fill-brand-pink animate-pulse" />
                    <span className="font-serif tracking-widest text-brand-rose">CURA</span>
                </div>
                <button
                    onClick={toggleDebugDate}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-1 rounded-full"
                >
                    [DEBUG: Toggle Feb 14]
                </button>
            </nav>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">

                {isRevealDay ? (
                    // REVEAL MODE
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-4xl"
                    >
                        <div className="text-center mb-16">
                            <h1 className="text-6xl md:text-9xl font-serif italic font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-rose to-brand-pink animate-gradient bg-300%">
                                It's Time.
                            </h1>
                            <p className="text-xl md:text-2xl text-white/60 font-serif italic">
                                The wait is over. Meet your match.
                            </p>
                        </div>

                        {!hasSearched ? (
                            <form onSubmit={handleCheckMatches} className="max-w-md mx-auto relative group">
                                <div className="absolute inset-0 bg-brand-pink/20 blur-xl rounded-full group-hover:bg-brand-pink/30 transition-all duration-500" />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter your phone (+234...)"
                                    className="relative w-full bg-white/5 border border-white/10 rounded-full py-5 pl-8 pr-16 text-xl focus:outline-none focus:border-brand-pink focus:bg-white/10 transition-all placeholder:text-white/20 backdrop-blur-md"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loadingMatches}
                                    className="absolute right-3 top-3 bottom-3 aspect-square bg-brand-pink hover:bg-pink-600 rounded-full flex items-center justify-center transition-all disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg shadow-brand-pink/20"
                                >
                                    {loadingMatches ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                    <h2 className="text-3xl font-serif italic text-brand-rose">Your Matches</h2>
                                    <button onClick={() => setHasSearched(false)} className="text-sm text-white/40 hover:text-white transition-colors uppercase tracking-widest text-[10px]">Search again</button>
                                </div>

                                {matches.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {matches.map(({ user, score }, i) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl flex items-center justify-between overflow-hidden hover:border-brand-pink/50 transition-colors"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/0 via-brand-pink/5 to-brand-pink/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                                <div className="relative z-10">
                                                    <h3 className="text-2xl font-serif text-white mb-1">{user.name}</h3>
                                                    <p className="text-sm text-white/40 uppercase tracking-widest">{user.gender}</p>
                                                </div>
                                                <div className="relative z-10 text-right">
                                                    <div className="text-4xl font-bold text-brand-pink">{Math.round(score)}%</div>
                                                    <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1 mb-2">Compatibility</div>
                                                    <a
                                                        href={`https://wa.me/${user.phoneNumber?.replace(/\+/g, '')}?text=${encodeURIComponent("Hey! We matched on Cura.")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-[#128C7E] transition-colors"
                                                    >
                                                        <span className="w-3 h-3 fill-current">
                                                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                        </span>
                                                        Chat
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-16 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                        <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                        <p className="text-white/40 font-serif text-xl italic">No matches found.</p>
                                        <p className="text-sm text-white/20 mt-2">Check your number or maybe you were too picky?</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    // HYPE MODE
                    <>
                        {!showQuestionnaire ? (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-5xl"
                            >
                                <div className="mb-12 scale-110">
                                    <Countdown />
                                </div>

                                <h1 className="text-6xl md:text-9xl font-serif italic font-black mb-8 leading-[0.9] tracking-tight">
                                    Find your <span className="text-brand-pink relative inline-block">
                                        type
                                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-pink opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                                        </svg>
                                    </span><br />
                                    before <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-rose to-white">Valentine's</span>.
                                </h1>

                                <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl font-light leading-relaxed">
                                    Three layers of questions. One true match.<br />
                                    <span className="text-brand-pink/80">Revealing February 14th.</span>
                                </p>

                                <button
                                    onClick={() => setShowQuestionnaire(true)}
                                    className="group relative px-12 py-5 bg-white text-brand-black font-bold rounded-full text-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-brand-rose opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative z-10 flex items-center gap-3">
                                        Start The Test <Heart className="w-5 h-5 fill-brand-black" />
                                    </span>
                                </button>

                                <div className="mt-16">
                                    <LiveStats />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.5 }}
                                className="w-full flex justify-center"
                            >
                                <Questionnaire questions={questions} />
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}
