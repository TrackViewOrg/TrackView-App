"use client"

import React, {useState, useEffect, JSX} from 'react';
import Link from "next/link";
import {CircleQuestionMark, Eye, EyeOff} from 'lucide-react';
import { Control, FieldValues, Path } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ShootingStars from "@/components/StarBackground";
import { cn } from "@/lib/utils";
import TrackViewIcon from "@/components/TrackViewIcon";
import { motion } from "framer-motion";
import Logo from "@/components/LogoAnimated";
import {SupportDialog} from "@/components/dashboard/SupportDialog";

// --- TYPES ---

interface BaseFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
}

interface PasswordFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    forgotPasswordLink?: React.ReactNode;
}

// Exported to allow complex overrides from parent
export interface Catchphrase {
    id: number;
    text: (string | JSX.Element)[];
}

// --- DATA CONSTANTS ---

// Exported for reuse in overrides
export const HIGHLIGHT = "text-[#dff976] italic";

const CATCHPHRASES: Catchphrase[] = [
    {
        id: 1,
        text: ["Stop ", <span key="c1-1" className={HIGHLIGHT}>guessing</span>, " your mistakes and start ", <span key="c1-2" className={HIGHLIGHT}>fixing them</span>]
    },
    {
        id: 2,
        text: [<span key="c2-1" className={HIGHLIGHT}>Bridge the gap</span>, " between your intuition and reality"]
    },
    {
        id: 3,
        text: ["Unlock the ", <span key="c3-1" className={HIGHLIGHT}>hidden pace</span>, " that average drivers miss"]
    },
    {
        id: 4,
        text: ["Turn a single fast lap into ", <span key="c4-1" className={HIGHLIGHT}>consistent, dominant pace</span>]
    },
    {
        id: 5,
        text: ["See the invisible mistakes ", <span key="c5-1" className={HIGHLIGHT}>costing you vital time</span>]
    },
    {
        id: 6,
        text: ["Master your inputs, optimize your lines, ", <span key="c6-1" className={HIGHLIGHT}>redefine your limits</span>]
    },
    {
        id: 7,
        text: ["The data tells a story, ", <span key="c7-1" className={HIGHLIGHT}>learn to read it</span>]
    },
    {
        id: 8,
        text: ["Transform raw inputs into ", <span key="c8-1" className={HIGHLIGHT}>championship defining</span>, " excellence"]
    }
];

const RACING_TIPS = [
    "Analysis cuts braking errors by 35% in 5 sessions. Stop guessing, use our tools to unlock your potential.",
    "Coasting costs 1.5s per lap on average. Stop hesitating, let our data prove exactly where to stay on the gas.",
    "80% of amateur time loss is at corner entry. Stop chasing top speed, use our tools to fix your transition today.",
    "The 5°C optimal tire window yields 0.4s free pace. Stop burning grip, use our stats to master your aggression.",
    "Short-shifting prevents 90% of traction loss events. Stop fighting the wheel, use our analysis to perfect your exits.",
    "Pros deviate less than 2% from the racing line. Stop the randomness, drive with intent."
];

// --- UTILS ---

export const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // Max 5
};

// --- COMPONENTS ---

interface AuthLayoutProps {
    children: React.ReactNode;
    formPosition?: "left" | "right";
    /** Optional: Override the random catchphrase. Can be a simple string or a Catchphrase object for custom styling. */
    quoteOverride?: string | Catchphrase;
    /** Optional: Override the random racing tip. */
    tipOverride?: string;
}

export function AuthLayout({
                               children,
                               formPosition = "right",
                               quoteOverride,
                               tipOverride
                           }: AuthLayoutProps) {
    const layoutDirection = formPosition === "left" ? "md:flex-row-reverse" : "md:flex-row";
    const borderClass = formPosition === "left" ? "border-r" : "border-l";

    // Initialize with a known state
    const [mounted, setMounted] = useState(false);
    const [content, setContent] = useState({
        headline: CATCHPHRASES[0],
        tip: RACING_TIPS[0]
    });

    useEffect(() => {
        // Determine Headline
        let selectedHeadline: Catchphrase;

        if (quoteOverride) {
            // Check if it's a simple string or a Catchphrase object
            selectedHeadline = typeof quoteOverride === 'string'
                ? { id: 999, text: [quoteOverride] }
                : quoteOverride;
        } else {
            selectedHeadline = CATCHPHRASES[Math.floor(Math.random() * CATCHPHRASES.length)];
        }

        // Determine Tip
        const selectedTip = tipOverride
            ? tipOverride
            : RACING_TIPS[Math.floor(Math.random() * RACING_TIPS.length)];

        setContent({
            headline: selectedHeadline,
            tip: selectedTip
        });

        // Signal that hydration is complete and content is ready
        setMounted(true);
    }, [quoteOverride, tipOverride]);

    return (
        <main className={cn("relative flex h-full w-full items-center justify-center overflow-hidden font-archivo", layoutDirection)}>
            <ShootingStars />

            {/* Logo */}
            <Logo/>

            {/* Content Section */}
            <section className="hidden md:flex w-5/7 h-full flex-col justify-center px-24 z-10">
                {/* The content exists but is invisible (opacity-0) until randomization/override is done.
                   This prevents layout shift while hiding the "flicker".
                */}
                <div className={cn(
                    "space-y-6 max-w-3xl text-foreground select-none transition-opacity duration-500",
                    mounted ? "opacity-100 animate-in fade-in slide-in-from-left-4 duration-700" : "opacity-0"
                )}>
                    <blockquote className="text-8xl font-light font-serif">
                        {content.headline.text.map((part, i) => (
                            <React.Fragment key={i}>{part}</React.Fragment>
                        ))}
                    </blockquote>
                    <div className="space-y-2 border-l-2 border-primary/10 pl-3">
                        <p className="text-md text-muted-foreground font-light max-w-lg">
                            {content.tip}
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className={cn("w-full md:w-2/5 h-full bg-background/80 backdrop-blur-sm z-10 flex flex-col justify-center px-8 md:px-20 py-12", borderClass)}>
                <div className="max-w-md mx-auto w-full">
                    {children}
                </div>
            </section>
        </main>
    );
}

export function FormInputField<T extends FieldValues>({ control, name, label, placeholder, type = "text" }: BaseFieldProps<T> & { type?: string }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input {...field} type={type} className="h-11" placeholder={placeholder} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function PasswordWithStrength<T extends FieldValues>({ control, name, label, placeholder }: BaseFieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const strength = calculatePasswordStrength(field.value);

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <div className="relative">
                            <FormControl>
                                <Input
                                    {...field}
                                    className="h-11"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={placeholder}
                                />
                            </FormControl>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex h-1 w-full gap-1">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div
                                    key={step}
                                    className={cn(
                                        "h-full flex-1 transition-colors duration-300 rounded-full",
                                        step <= strength
                                            ? strength <= 2 ? "bg-destructive" : strength <= 4 ? "bg-yellow-500" : "bg-green-500"
                                            : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}

export function FormPasswordField<T extends FieldValues>({ control, name, label, placeholder, forgotPasswordLink }: PasswordFieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>{label}</FormLabel>
                        {forgotPasswordLink}
                    </div>
                    <div className="relative">
                        <FormControl>
                            <Input {...field} className="h-11" type={showPassword ? "text" : "password"} placeholder={placeholder} />
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function GoogleButton({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) {
    return (
        <Button
            variant="secondary"
            className="w-full flex gap-3 h-11"
            type="button"
            onClick={onClick}
        >
            <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {children}
        </Button>
    );
}
