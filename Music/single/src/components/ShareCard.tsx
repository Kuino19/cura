'use client'

import { motion } from 'framer-motion'
import { Heart, Share2, Download } from 'lucide-react'

export function ShareCard({ name, gender }: { name: string, gender: string }) {

    const handleShare = async () => {
        try {
            const html2canvas = (await import('html2canvas')).default
            const element = document.getElementById('share-card')
            if (!element) return

            const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 })
            const image = canvas.toDataURL("image/png")

            // Create a blob
            const blob = await (await fetch(image)).blob()
            const file = new File([blob], "valentines-match.png", { type: "image/png" })

            // Mobile Native Share
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: "I'm Locked In - Cura",
                    text: `I've joined the Cura waitlist. Find your match before Feb 14th.`,
                })
            } else {
                // Formatting for WhatsApp
                const text = encodeURIComponent(`I've joined the Cura waitlist. Find your match before Feb 14th.\n\n${window.location.origin}`)

                // Trigger download
                const link = document.createElement('a')
                link.href = image
                link.download = 'my-match-ticket.png'
                link.click()

                // Open WhatsApp
                window.open(`https://wa.me/?text=${text}`, '_blank')
            }
        } catch (err) {
            console.error("Share failed:", err)
            alert("Could not generate image. Please screenshot manually!")
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto group perspective-1000">
            <motion.div
                id="share-card"
                initial={{ rotateX: 10, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative bg-brand-black/90 border border-white/20 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl shadow-brand-pink/20"
            >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {/* Top Section */}
                <div className="p-8 pb-4 text-center border-b border-white/5 relative z-10">
                    <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 box-shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                        <Heart className="w-6 h-6 text-brand-pink fill-brand-pink animate-pulse" />
                    </div>
                    <h2 className="font-serif italic text-2xl text-white">Cura</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2">Official Waitlist</p>
                </div>

                {/* Ticket Body */}
                <div className="p-8 space-y-6 relative z-10 bg-gradient-to-b from-transparent to-brand-pink/5">
                    <div className="space-y-1 text-center">
                        <p className="text-xs uppercase tracking-widest text-white/40">Passenger</p>
                        <h1 className="text-3xl font-serif font-bold text-white text-shadow-sm">{name}</h1>
                        <p className="text-xs text-brand-rose/80 uppercase tracking-widest bg-white/5 inline-block px-3 py-1 rounded-full mt-2">{gender}</p>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-2xl p-4">
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-white/30">Status</p>
                            <p className="text-brand-pink font-bold glowing-text text-lg">LOCKED IN</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-white/30">Date</p>
                            <p className="text-white font-mono text-lg">FEB 14</p>
                        </div>
                    </div>

                    {/* Barcode-ish visual */}
                    <div className="flex gap-1 justify-center opacity-30 h-8 mt-4">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-1 bg-white h-full" style={{ opacity: Math.random() }} />
                        ))}
                    </div>
                </div>

                {/* Bottom Button */}
                <div className="p-4 bg-white/5 backdrop-blur-md">
                    <button
                        onClick={handleShare}
                        className="w-full bg-white text-brand-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-rose transition-colors"
                    >
                        <Share2 className="w-4 h-4" /> Share Ticket
                    </button>
                    <p className="text-center text-[10px] text-white/20 mt-3">Screenshot and post to your story</p>
                </div>
            </motion.div>
        </div>
    )
}
