"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleQuestionMark, FlagTriangleRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ShootingStars from "@/components/StarBackground";
import { cn } from "@/lib/utils";
import Logo from "@/components/LogoAnimated";
import { SupportDialog } from "@/components/dashboard/SupportDialog";

// --- CONTENT CONSTANTS ---

const HIGHLIGHT = "text-[#dff976] italic";

const ERROR_QUOTES = [
    {
        text: ["Black and white flag shown. ", <span key="q1" className={HIGHLIGHT}>Track limits exceeded.</span>]
    },
    {
        text: ["You've missed the apex. ", <span key="q2" className={HIGHLIGHT}>You are off the track.</span>]
    }
];

// --- COMPONENT ---

export default function NotFoundPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [quote, setQuote] = useState(ERROR_QUOTES[0]);

    useEffect(() => {
        // Randomize the error message slightly for flavor
        setQuote(ERROR_QUOTES[Math.floor(Math.random() * ERROR_QUOTES.length)]);
        setMounted(true);
    }, []);

    return (
        <main className="relative flex h-screen w-full items-center justify-center overflow-hidden font-archivo bg-background text-foreground selection:text-black">

            {/* 1. Background Elements */}
            <ShootingStars />
            <Logo />

            {/* 2. Main Centered Content */}
            <div className={cn(
                "z-10 flex flex-col items-center justify-center text-center max-w-4xl px-6 transition-all duration-1000 ease-out",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>

                {/* 404 Indicator */}
                <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-sm border text-red-400 border-border/40 bg-muted text-xl font-serif uppercase tracking-widest ">
                    <span>404</span>
                </div>



                {/* Big Impact Quote */}
                <blockquote className="text-5xl md:text-7xl font-light font-serif leading-tight tracking-tight mb-5 select-none text-foreground max-w-5/6">
                    {quote.text.map((part, i) => (
                        <React.Fragment key={i}>{part}</React.Fragment>
                    ))}
                </blockquote>

                {/* Instruction Block */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
                    <div className="space-y-2 max-w-md">
                        <p className="text-base text-muted-foreground font-light leading-relaxed">
                            The requested URL does not exist on this server. <br />
                            Let's get you back to the racing line.
                        </p>
                    </div>

                    {/* Navigation Actions */}
                    <footer className="w-full flex items-center justify-center gap-8 text-sm pt-6">
                        <Button
                            variant="link"
                            type="button"
                            className="group text-muted-foreground hover:text-[#dff976] transition-colors px-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft  />
                            Return to Previous Page
                        </Button>


                        <SupportDialog>
                            <Button
                                variant="link"
                                type="button"
                                className="group text-muted-foreground hover:text-foreground px-0"
                            >
                                <CircleQuestionMark  />
                                Report Bug
                            </Button>
                        </SupportDialog>
                    </footer>
                </div>

            </div>
        </main>
    );
}