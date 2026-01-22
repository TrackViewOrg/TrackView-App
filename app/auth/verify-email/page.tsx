"use client"

import React, { useState, useEffect, JSX } from 'react';
import Link from "next/link";
import {ArrowLeft, CircleQuestionMark} from 'lucide-react';
import { Button } from "@/components/ui/button";
import ShootingStars from "@/components/StarBackground";
import { cn } from "@/lib/utils";
import Logo from "@/components/LogoAnimated";
import {SupportDialog} from "@/components/dashboard/SupportDialog";
import {signout} from "@/lib/auth/actions";

// --- CONTENT CONSTANTS ---

const HIGHLIGHT = "text-[#dff976] italic";

const QUOTES = [
    {
        text: ["The setup is complete. ", <span key="q1" className={HIGHLIGHT}>Time to hit the track</span>]
    },
    {
        text: ["Engine started. ", <span key="q2" className={HIGHLIGHT}>Waiting for green flag</span>]
    }
];

// --- COMPONENT ---

export default function RegistrationSuccessPage() {
    const [mounted, setMounted] = useState(false);
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        setMounted(true);
    }, []);

    return (
        <main className="relative flex h-screen w-full items-center justify-center overflow-hidden font-archivo bg-background text-foreground  selection:text-black">

            {/* 1. Background Elements */}
            <ShootingStars />

            {/* Logo positioned absolute top-left or centered depending on your preference (kept default absolute) */}
            <Logo />

            {/* 2. Main Centered Content */}
            <div className={cn(
                "z-10 flex flex-col items-center justify-center text-center max-w-3xl px-6 transition-all duration-1000 ease-out",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>

                {/* Big Impact Quote */}
                <blockquote className="text-6xl md:text-8xl font-light font-serif leading-tight tracking-tight mb-12 select-none">
                    {quote.text.map((part, i) => (
                        <React.Fragment key={i}>{part}</React.Fragment>
                    ))}
                </blockquote>

                {/* Instruction Block */}
                <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
                    <div className="space-y-4 max-w-md">
                        <h1 className="text-2xl font-bold tracking-tight text-white/90">
                            Verify your email
                        </h1>
                        <p className="text-base text-muted-foreground font-light leading-relaxed">
                            We've sent a verification link to your inbox.
                            Please confirm your email address to unlock full access to the Trackview dashboard.
                        </p>
                    </div>

                    {/* Simple Back Action */}
                    <footer className="w-full flex items-center justify-between text-center text-sm text-muted-foreground pt-6">
                        <Button
                            variant="link"
                            type="button"
                            className="group text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                            onClick={() => signout()}
                        >
                            <ArrowLeft  />
                            Return to Login
                        </Button>
                        <SupportDialog>
                            <Button
                                variant="link"
                                type="button"
                                className="group text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                            >
                                <CircleQuestionMark />
                                Request Support
                            </Button>
                        </SupportDialog>
                    </footer>
                </div>

            </div>
        </main>
    );
}