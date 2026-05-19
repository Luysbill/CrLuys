import React from "react";
import { CATEGORY_IMAGES } from "../lib/api";

// Subtle editorial mood-board strip — slow, cinematic, infinite-loop horizontal scroll.
// Visually quiet by design: no captions, no badges, just curated frames.
const FRAMES = [
    { src: CATEGORY_IMAGES["smart-investing"], caption: "Wealth" },
    { src: CATEGORY_IMAGES["health-wellness"], caption: "Wellness" },
    { src: CATEGORY_IMAGES["fitness-nutrition"], caption: "Strength" },
    { src: CATEGORY_IMAGES["self-sufficiency"], caption: "Independence" },
    { src: CATEGORY_IMAGES["mindset-balance"], caption: "Clarity" },
];

export default function DiscoveryRibbon() {
    // Duplicate the frames for seamless marquee loop
    const frames = [...FRAMES, ...FRAMES];

    return (
        <section
            data-testid="discovery-ribbon"
            className="relative py-14 sm:py-20 overflow-hidden"
            aria-label="A curated visual mood-board across the CrLuys ecosystem"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 sm:mb-10">
                <div className="flex items-end justify-between gap-6 flex-wrap">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-gold/80 mb-3">
                            Mood Board · The Ecosystem
                        </p>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.05] tracking-tight">
                            Five worlds, <span className="italic gold-gradient-text">one philosophy</span>.
                        </h2>
                    </div>
                    <p className="text-cream/55 font-light text-sm max-w-sm">
                        A quiet montage of the lifestyle we curate — wealth, wellness,
                        strength, independence and clarity.
                    </p>
                </div>
            </div>

            {/* Fade-edged marquee */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-40 z-10 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-40 z-10 bg-gradient-to-l from-ink via-ink/60 to-transparent" />

                <div className="ribbon-track flex gap-5 sm:gap-7 will-change-transform">
                    {frames.map((f, i) => (
                        <div
                            key={i}
                            className="shrink-0 w-[68vw] max-w-[420px] sm:w-[360px] md:w-[420px] aspect-[4/5] rounded-2xl overflow-hidden border border-gold/15 relative group"
                        >
                            <img
                                src={f.src}
                                alt=""
                                loading="lazy"
                                draggable={false}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                            <div className="absolute bottom-4 left-5 right-5">
                                <p className="font-serif italic text-2xl text-cream/95 tracking-tight">
                                    {f.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
