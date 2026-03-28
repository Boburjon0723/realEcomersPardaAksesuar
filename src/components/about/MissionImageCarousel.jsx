import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTO_MS = 5000

/**
 * Bir nechta rasm: silliq opacity almashinuvi, avtomatik slayd, nuqta va tugmalar
 */
export default function MissionImageCarousel({ urls, alt, className = '' }) {
    const n = urls?.length || 0
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)

    const urlsDependencyKey = Array.isArray(urls) ? urls.join('|') : ''

    useEffect(() => {
        setIndex(0)
    }, [urlsDependencyKey])

    const go = useCallback(
        (dir) => {
            if (n <= 1) return
            setIndex((i) => (dir === 'next' ? (i + 1) % n : (i - 1 + n) % n))
        },
        [n]
    )

    useEffect(() => {
        if (n <= 1 || paused) return
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % n)
        }, AUTO_MS)
        return () => clearInterval(id)
    }, [n, paused, index])

    if (!n) return null

    return (
        <div
            className={`relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 ${className}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="relative min-h-[240px] md:min-h-[300px] w-full">
                {urls.map((url, i) => (
                    <img
                        key={`${url}-${i}`}
                        src={url}
                        alt={i === index ? alt : ''}
                        aria-hidden={i !== index}
                        className={`absolute inset-0 w-full h-auto max-h-[min(32rem,75vh)] object-contain object-center mx-auto left-0 right-0 transition-opacity duration-700 ease-in-out ${
                            i === index ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                        loading={i === 0 ? 'eager' : 'lazy'}
                    />
                ))}
            </div>

            {n > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => go('prev')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white transition-colors"
                        aria-label="Oldingi rasm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => go('next')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white transition-colors"
                        aria-label="Keyingi rasm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="flex justify-center gap-2 py-3 px-2 bg-gray-50/80">
                        {urls.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === index ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Rasm ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
