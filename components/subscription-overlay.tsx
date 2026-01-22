"use client";

import React, { useState } from "react";
import { Plus, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HIGHLIGHT } from "@/components/auth/auth-components";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import { TextMorph } from "@/components/motion-primitives/text-morph";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { BorderTrail } from "@/components/motion-primitives/border-trail";
import StarBackground from "@/components/StarBackground";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSubscriptionModal } from "@/lib/hooks/subscription";
import { RocketIcon } from "@/components/ui/rocket";
import { ZapIcon } from "@/components/ui/zap";
import { BoxIcon } from "@/components/ui/box";
import Logo from "@/components/LogoAnimated";

// --- Types & Constants ---
type Plan = {
    id: string;
    name: string;
    icon: React.ElementType;
    basePrice: number;
    features: string[];
    highlight?: boolean;
    annualDiscount?: number;
};

const PLANS: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        icon: BoxIcon,
        basePrice: 0,
        features: [
            "Cloud Store: 20 Stints",
            "5 AI Corner Analysis / mo",
            "Basic Telemetry Comparison",
            "1 AI Setup Suggestion / mo",
            "Global Leaderboard Access"
        ],
        annualDiscount: 0,
    },
    {
        id: "plus",
        name: "Plus",
        icon: ZapIcon,
        basePrice: 5.62,
        features: [
            "Unlimited Cloud Storage",
            "30 AI Corner Analysis / mo",
            "Advanced Telemetry Overlays",
            "5 AI Setup Suggestions / mo",
            "Everything in Starter",
        ],
        highlight: true,
        annualDiscount: 0.20, // 25% Savings
    },
    {
        id: "pro",
        name: "Pro",
        icon: RocketIcon,
        basePrice: 13.63,
        features: [
            "Unlimited AI Analysis",
            "Full Telemetry Suite & Export",
            "Predictive Tire & Fuel ML Models",
            "Unlimited AI Setup Engineering",
            "Dynamic Pit Strategy Calculator",
            "Real-time AI Race Engineer",
            "Everything in Plus",
        ],
        annualDiscount: 0.25, // 30% Savings
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
    exit: { opacity: 0 },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

export function SubscriptionOverlay() {
    const { isOpen, close } = useSubscriptionModal();
    const [isAnnual, setIsAnnual] = useState(false);

    const getDisplayPrice = (plan: Plan): number => {
        if (plan.basePrice === 0) return 0;
        return isAnnual
            ? plan.basePrice * (1 - (plan.annualDiscount || 0))
            : plan.basePrice;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-background overflow-hidden pt-10"
                >
                    <div className="fixed top-6 right-6 z-[60]">
                        <Button variant="link" size="icon" onClick={close}>
                            <XIcon className="h-6 w-6" />
                        </Button>
                    </div>


                    <motion.div
                        className="fixed top-1 left-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <Logo />
                    </motion.div>

                    {/* Content Wrapper */}
                    <div className="flex w-full flex-col items-center justify-center gap-8 p-6">

                        {/* Title Section */}
                        <motion.div variants={itemVariants} className="space-y-2 text-center">
                            <blockquote className="flex flex-col items-center select-none font-serif text-7xl font-light leading-tight tracking-tight text-foreground md:text-8xl">
                                <TextEffect preset="fade-in-blur">Plans For Every Level</TextEffect>
                                <TextEffect per="char" preset="blur" className={HIGHLIGHT}>
                                    Of Ambition
                                </TextEffect>
                            </blockquote>
                        </motion.div>

                        {/* Toggle Switch */}
                        <motion.div
                            variants={itemVariants}
                            className="relative flex items-center rounded-sm border border-border bg-background p-0.5"
                        >
                            <button
                                onClick={() => setIsAnnual(false)}
                                className="relative px-6 py-2 text-sm font-medium outline-none transition-colors"
                            >
                                <span
                                    className={cn(
                                        "relative z-10 transition-colors duration-200",
                                        !isAnnual
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Monthly
                                </span>
                                {!isAnnual && (
                                    <motion.div
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 rounded-sm bg-muted shadow-sm"
                                        transition={{ type: "tween", ease: "easeInOut", duration: 0.15 }}
                                    />
                                )}
                            </button>

                            <button
                                onClick={() => setIsAnnual(true)}
                                className="relative px-6 py-2 text-sm font-medium outline-none transition-colors"
                            >
                                <span
                                    className={cn(
                                        "relative z-10 flex items-center gap-2 transition-colors duration-200",
                                        isAnnual
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Annually
                                    <span className="rounded-sm uppercase bg-[#dff976] px-1.5 py-0.5 text-[10px] font-bold leading-none text-background">
                                        Up to -25%
                                    </span>
                                </span>
                                {isAnnual && (
                                    <motion.div
                                        layoutId="toggle-pill"
                                        className="absolute inset-0 rounded-sm bg-muted shadow-sm"
                                        transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
                                    />
                                )}
                            </button>
                        </motion.div>

                        {/* Cards Grid */}
                        <motion.div
                            variants={itemVariants}
                            className="grid w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-3"
                        >
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex h-full w-full flex-col gap-6 rounded-sm p-8 bg-card transition-colors duration-200",
                                        plan.highlight
                                            ? "border border-border shadow-sm bg-muted"
                                            : "border border-border/40"
                                    )}
                                >
                                    {plan.highlight && (
                                        <BorderTrail
                                            className="bg-gradient-to-l from-[#dff976]/1 via-[#dff976] to-[#dff976]/1"
                                            size={420}
                                        />
                                    )}

                                    {/* Card Header */}
                                    <div className={"flex justify-between items-start"}>
                                        <div className="flex items-center gap-4">
                                            <h1 className="font-serif text-3xl font-semibold">
                                                {plan.name}
                                            </h1>
                                            <plan.icon size={25} className="text-muted-foreground" />
                                        </div>
                                        {plan.highlight && (
                                            <div className={"bg-[#dff976] text-background text-xs p-1 font-semibold px-4 rounded-sm border-sm"}>
                                                POPULAR
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Section */}
                                    <div className="flex items-center justify-start gap-2">
                                        {plan.basePrice === 0 ? (
                                            <h1 className="text-4xl font-bold">FREE</h1>
                                        ) : (
                                            <div className={"flex gap-2 items-start justify-start"}>
                                                <div className="flex gap-0.5">
                                                    <h1 className="text-4xl font-bold">$</h1>
                                                    <SlidingNumber
                                                        value={getDisplayPrice(plan)}
                                                        className="text-4xl font-bold"
                                                        decimalPlaces={2}
                                                    />
                                                </div>
                                                <div className="flex flex-col pt-1">
                                                    <TextMorph className="text-xs text-muted-foreground">
                                                        {isAnnual
                                                            ? "USD/month (Billed Yearly)"
                                                            : "USD/month"}
                                                    </TextMorph>

                                                    {isAnnual && plan.annualDiscount && (
                                                        <TextEffect
                                                            per="char"
                                                            preset="fade"
                                                            className="text-xs font-bold text-[#dff976]"
                                                        >
                                                            {`Saving ${(plan.annualDiscount * 100).toFixed(0)}%`}
                                                        </TextEffect>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        variant={plan.basePrice === 0 ? "secondary" : "accent"}
                                        className={`${plan.highlight && "hover:bg-[#dff976] text-background hover:scale-105 hover:border-[#dff976] transition-all duration-300"} h-11 w-full font-semibold`}
                                        disabled={plan.basePrice === 0}
                                    >
                                        {plan.basePrice === 0 ? "Current Plan" : "Upgrade"}
                                    </Button>

                                    {/* Features List */}
                                    <div className="flex flex-col gap-3 pt-2">
                                        {plan.features.map((feature, i) => {
                                            const isUpgradeFeature = feature.startsWith("Everything in");
                                            const Icon = isUpgradeFeature ? Plus : CheckIcon;

                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 text-sm text-muted-foreground"
                                                >
                                                    <Icon size={18} className="text-primary/70" />
                                                    <span>{feature}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        <div className="h-4" />
                        <StarBackground />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}