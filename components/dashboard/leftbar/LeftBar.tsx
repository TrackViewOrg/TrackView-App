"use client"

import React from 'react'
import { Button } from "@/components/ui/button";
import {
    CarIcon,
    FolderClockIcon,
    GaugeIcon,
    LineSquiggleIcon,
    TrendingUpIcon,
    TrophyIcon,
} from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    carsRoute,
    dashRoute,
    leaderboardRoute,
    sessionsRoute,
    statisticsRoute,
    tracksRoute
} from "@/lib/constants";
import { usePathname } from "next/navigation";

const nav_items = [
    {
        label: "Dashboard",
        href: dashRoute,
        icon: GaugeIcon,
    },
    {
        label: "Sessions",
        href: sessionsRoute,
        icon: FolderClockIcon,
    },
    {
        label: "Stats",
        href: statisticsRoute,
        icon: TrendingUpIcon,
    },
    {
        label: "Leaderboard",
        href: leaderboardRoute,
        icon: TrophyIcon,
    },
    {
        label: "Tracks",
        href: tracksRoute,
        icon: LineSquiggleIcon,
    },
    {
        label: "Cars",
        href: carsRoute,
        icon: CarIcon,
    },
]

function LeftBar() {
    const pathname = usePathname();

    return (
        <div className={"flex border-r p-1 h-full flex-col justify-between"}>
            <div className={"flex flex-col gap-[1px]"}>
                {nav_items.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Tooltip key={item.label} delayDuration={400}>
                            <TooltipTrigger asChild>
                                <Link href={item.href}>
                                    <Button
                                        variant={isActive ? "selected" : "ghost"}
                                        size={"icon-sm"}
                                    >
                                        <item.icon strokeWidth={2.5} />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent align={"center"} side={"right"} className={"ml-2 rounded-[4px]"}>
                                <p className={"font-archivo"}>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </div>
    )
}

export default LeftBar