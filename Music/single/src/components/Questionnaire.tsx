'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, User, Mail, Phone, Heart } from 'lucide-react'
import { submitQuestionnaire } from '@/app/actions'
import { ShareCard } from '@/components/ShareCard'

type Question = {
    id: string
    text: string
    type: string
    category: string
}

type Answer = {
    questionId: string
    myAttribute: string
    desiredAttribute: string
    importance: string
}

// Helper to get options for a question type
function getOptionsForType(type: string, userGender: string, phase: string) {
    // Determine target gender for options
    // If phase is 'about-me', use user's gender.
    // If phase is 'match-appearance', use opposite gender (assuming simple logic for now).
    let targetGender = userGender;
    if (phase === 'match-appearance' || phase === 'match-personality') {
        targetGender = userGender === 'Male' ? 'Female' : 'Male';
    }

    // Basic / New Options
    if (type === 'Age') return ['18-21', '22-25', '26-29', '30-35', '36+']
    if (type === 'Height') return ['Short', 'Average', 'Tall', 'Very Tall']
    if (type === 'Complexion') return ['Fair', 'Dark', 'Chocolate']

    if (type === 'BodyType') {
        if (targetGender === 'Male') {
            return ['Slim', 'Athletic', 'Muscular', 'Average', 'Plus Size']
        } else {
            // Female
            return ['Petite', 'Slim', 'Curvy', 'Athletic', 'Average', 'Plus Size']
        }
    }

    if (type === 'Style') return ['Casual/Comfy', 'Streetwear', 'Formal/Classy', 'Alternative']

    // Personality / Lifestyle
    if (type === 'Introvert/Extrovert') return ['Introvert', 'Extrovert']
    if (type === 'Morning/Night') return ['Morning Person', 'Night Owl']
    if (type === 'Spender/Saver') return ['Spender', 'Saver']
    if (type === 'Planner/Spontaneous') return ['Planner', 'Spontaneous']
    if (type === 'Indoor/Outdoor') return ['Indoors', 'Outdoors']
    if (type === 'Logic/Emotion') return ['Logic/Head', 'Emotion/Heart']
    if (type === 'Touch/Time') return ['Physical Touch', 'Quality Time']
    if (type === 'Text/Call') return ['Text All Day', 'Call at Night']

    // Fallback
    const parts = type.split('/')
    if (parts.length === 2) return [parts[0], parts[1]]

    return ['Option A', 'Option B']
}

export function Questionnaire({ questions }: { questions: Question[] }) {
    const [phase, setPhase] = useState<'register' | 'about-me' | 'match-personality' | 'match-appearance' | 'done'>('register')

    const [currentIndex, setCurrentIndex] = useState(0)

    const [userData, setUserData] = useState({
        name: '',
        phoneNumber: '',
        gender: ''
    })

    console.log('Questionnaire Render:', { phase, questionCount: questions?.length })

    const [answers, setAnswers] = useState<Record<string, Answer>>({})

    const getQuestionsForPhase = (p: string) => {
        if (p === 'about-me') return questions
        if (p === 'match-personality') return questions.filter(q => q.category === 'personality')
        if (p === 'match-appearance') return questions.filter(q => q.category === 'appearance' || q.category === 'basic')
        return []
    }

    const currentPhaseQuestions = getQuestionsForPhase(phase)
    const currentQuestion = currentPhaseQuestions[currentIndex]

    const getDynamicQuestionText = (q: Question) => {
        if (phase === 'about-me') {
            if (q.category === 'appearance' || q.category === 'basic') {
                return `What is your ${q.text}?`
            }
            return q.text // Personality q's are already phrased as "Are you...?" usually, or just "Morning or Night?"
        } else {
            // Match phase
            if (q.category === 'appearance' || q.category === 'basic') {
                return `Their ${q.text}?`
            }
            // Personality
            return `Their ${q.text.split('?')[0]}?` || q.text
        }
    }

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()
        if (userData.name && userData.phoneNumber && userData.gender) {
            setPhase('about-me')
            setCurrentIndex(0)
        }
    }

    const selectOption = (option: string) => {
        if (!currentQuestion) return

        setAnswers(prev => {
            const existing = prev[currentQuestion.id] || {
                questionId: currentQuestion.id,
                myAttribute: '',
                desiredAttribute: '',
                importance: 'Important'
            }

            if (phase === 'about-me') {
                return { ...prev, [currentQuestion.id]: { ...existing, myAttribute: option } }
            } else {
                return { ...prev, [currentQuestion.id]: { ...existing, desiredAttribute: option } }
            }
        })
    }

    const [showTransition, setShowTransition] = useState(false)

    const handleNext = async () => {
        if (currentIndex < currentPhaseQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            // End of phase
            if (phase === 'about-me') {
                setShowTransition(true)
            } else if (phase === 'match-personality') {
                setPhase('match-appearance')
                setCurrentIndex(0)
            } else if (phase === 'match-appearance') {
                // Submit
                await submitQuestionnaire({
                    ...userData,
                    answers: Object.values(answers)
                })
                setPhase('done')
            }
        }
    }

    const confirmTransition = () => {
        setShowTransition(false)
        setPhase('match-personality')
        setCurrentIndex(0)
    }

    const getCurrentAnswer = () => {
        if (!currentQuestion) return ''
        const ans = answers[currentQuestion.id]
        if (!ans) return ''
        return phase === 'about-me' ? ans.myAttribute : ans.desiredAttribute
    }

    if (showTransition) {
        return (
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                        <Heart className="w-8 h-8 text-brand-pink fill-brand-pink" />
                    </div>
                </div>
                <h2 className="text-3xl font-serif italic text-white mb-4">Now, let's talk about them.</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                    You've told us who you are.<br />
                    Now tell us who you're looking for.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8">
                    <p className="text-sm text-brand-pink font-medium">✨ You are picking qualities for your preferred match.</p>
                </div>
                <button
                    onClick={confirmTransition}
                    className="w-full bg-white text-brand-black font-bold py-4 rounded-xl transition-all hover:bg-brand-rose hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
                >
                    Continue
                </button>
            </div>
        )
    }

    if (phase === 'done') {
        return (
            <div className="w-full flex justify-center">
                <ShareCard name={userData.name} gender={userData.gender} />
            </div>
        )
    }

    // ... Register Form (unchanged render, just kept in same component) ...
    // Skipping lines 136-192 for brevity in replacement if possible, but simplest to keep structure

    if (phase === 'register') {
        return (
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-serif italic mb-8 text-center text-white">Join the Waitlist</h2>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Identity</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-4 w-5 h-5 text-white/30 group-focus-within:text-brand-pink transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 px-4 focus:outline-none focus:border-brand-pink focus:bg-black/40 transition-all placeholder:text-white/20"
                                placeholder="Your Name"
                                value={userData.name}
                                onChange={e => setUserData({ ...userData, name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Contact</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-4 w-5 h-5 text-white/30 group-focus-within:text-brand-pink transition-colors" />
                            <input
                                type="tel"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 px-4 focus:outline-none focus:border-brand-pink focus:bg-black/40 transition-all placeholder:text-white/20"
                                placeholder="+234 80 1234 5678"
                                value={userData.phoneNumber}
                                onChange={e => setUserData({ ...userData, phoneNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Gender</label>
                        <select
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-4 focus:outline-none focus:border-brand-pink transition-colors appearance-none cursor-pointer text-white/80"
                            value={userData.gender}
                            onChange={e => setUserData({ ...userData, gender: e.target.value })}
                        >
                            <option value="" className="bg-brand-black text-white/50">Select...</option>
                            <option value="Male" className="bg-brand-black">Male</option>
                            <option value="Female" className="bg-brand-black">Female</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-brand-black font-bold py-4 rounded-xl transition-all hover:bg-brand-rose hover:scale-[1.02] active:scale-[0.98] mt-4 shadow-lg shadow-white/5"
                    >
                        Start Matching
                    </button>
                </form>
            </div>
        )
    }

    if (!currentQuestion) return null

    const options = getOptionsForType(currentQuestion.type, userData.gender, phase)
    const selectedValue = getCurrentAnswer()

    const getPhaseTitle = () => {
        if (phase === 'about-me') return "About You"
        if (phase === 'match-personality') return "Your Match (Personality)"
        if (phase === 'match-appearance') return "Your Match (Appearance)"
    }

    const progress = ((currentIndex + 1) / currentPhaseQuestions.length) * 100

    return (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl min-h-[500px] flex flex-col justify-between relative overflow-hidden">

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div
                    className="h-full bg-brand-pink"
                    style={{ boxShadow: '0_0_10px_rgba(255,0,85,0.5)' }} // Corrected box-shadow to boxShadow
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="mb-8 mt-2">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
                    <span>Q{currentIndex + 1}/{currentPhaseQuestions.length}</span>
                    <span>{getPhaseTitle()}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id + phase}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <h2 className="text-3xl font-serif italic leading-tight text-white mb-2">{getDynamicQuestionText(currentQuestion)}</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest">
                            {phase === 'about-me' ? 'Select what applies to you' : 'Select what you prefer'}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="space-y-3 flex-1">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => selectOption(option)}
                        className={`w-full p-5 rounded-2xl text-left transition-all border group relative overflow-hidden ${selectedValue === option
                            ? 'bg-brand-pink border-brand-pink text-white shadow-lg shadow-brand-pink/20'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white/80'
                            }`}
                    >
                        <span className="relative z-10 font-medium">{option}</span>
                        {selectedValue === option && (
                            <motion.div layoutId="check" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-brand-pink rounded-full p-1 w-5 h-5 flex items-center justify-center">
                                <Check className="w-3 h-3" />
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <button
                    className="text-white/20 hover:text-white/50 text-xs uppercase tracking-widest transition-colors"
                    onClick={() => { /* back logic */ }}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!selectedValue}
                    className="py-3 px-8 bg-white text-brand-black font-bold rounded-full flex items-center gap-2 hover:bg-brand-rose transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:px-10"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
