"use client"

import React from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {useTheme} from "next-themes"
import {
    BoltIcon,
    ExternalLinkIcon,
    HeadsetIcon,
    Loader2Icon,
    MessageCircleQuestionMarkIcon,
    SparkleIcon,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {useUser} from "@/components/providers/user-provider"
import {cn} from "@/lib/utils"
import SignoutMenuItem from "@/components/dashboard/settings/signoutMenuItem"
import {SupportDialog} from "@/components/dashboard/SupportDialog";
import {Button} from "@/components/ui/button";
import {useSubscriptionModal} from "@/lib/hooks/subscription";
import { settingsAccountRoute } from "@/lib/constants";

// Configuration for plan-specific styling
const PLAN_CONFIG: Record<string, { label: string; className: string; iconClass: string }> = {
    PLUS: {
        label: "Manage Plan (Plus)",
        className: "focus:bg-green-500/10 focus:text-green-500",
        iconClass: "group-focus:text-green-500",
    },
    PRO: {
        label: "Manage Plan (Pro)",
        className: "focus:bg-purple-500/10 focus:text-purple-500",
        iconClass: "group-focus:text-purple-500",
    },
    DEFAULT: {
        label: "Upgrade Plan",
        className: "",
        iconClass: "",
    }
}

export default function TopbarAvatar(): React.ReactElement {
    const {profile, user} = useUser()
    const {theme, setTheme} = useTheme()
    const router = useRouter()

    const subscriptionModal = useSubscriptionModal();

    // robust plan lookup
    const planKey = (profile?.plan && profile.plan in PLAN_CONFIG) ? profile.plan : 'DEFAULT'
    const planStyles = PLAN_CONFIG[planKey]

    // Shared styles for consistency and reusability
    const menuItemClass = "text-xs cursor-pointer transition-colors duration-200"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar
                    className="h-8 w-8 cursor-pointer select-none rounded-sm border transition-opacity hover:opacity-80">
                    <AvatarImage
                        src={profile?.avatar_url || ""}
                        alt={profile?.display_name || "User Avatar"}
                    />
                    <AvatarFallback className="bg-transparent">
                        <Loader2Icon className="animate-spin text-muted-foreground/20" size={15}/>
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="mt-1 w-56 gap-0.5 rounded-sm bg-muted p-0.5 font-archivo text-muted-foreground"
                align="end"
                forceMount
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <Link
                        href={`/@${profile?.display_name || '#'}`}
                        className="group flex cursor-pointer flex-col px-2 py-1.5 transition-colors"
                    >
                        <div className={"flex items-center justify-between"}>
                            <div className={"flex-col space-y-1"}>
                                <p className="text-sm font-semibold leading-none text-foreground group-hover:underline">
                                    {profile?.display_name || 'Racer'}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                            <ExternalLinkIcon size={16}/>
                        </div>
                    </Link>
                </DropdownMenuLabel>

                <DropdownMenuSeparator/>

                <DropdownMenuItem
                    onClick={() => router.push(settingsAccountRoute)}
                    className={menuItemClass}
                >
                    <BoltIcon size={14}/>
                    <span>Account preferences</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className={cn(menuItemClass, planStyles.className)}
                    onClick={() => subscriptionModal.open()}
                >
                    <SparkleIcon
                        size={14}
                        className={cn("transition-colors", planStyles.iconClass)}
                    />
                    <span>{planStyles.label}</span>
                </DropdownMenuItem>

                <SupportDialog>
                    <DropdownMenuItem
                        className={menuItemClass}
                        onSelect={(e) => e.preventDefault()}
                    >
                        <MessageCircleQuestionMarkIcon size={14}/>
                        <span>Help Center</span>
                    </DropdownMenuItem>
                </SupportDialog>

                <DropdownMenuSeparator/>

                <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                >
                    {['light', 'dark', 'system'].map((t) => (
                        <DropdownMenuRadioItem
                            key={t}
                            value={t}
                            className={cn(menuItemClass, "capitalize")}
                        >
                            {t}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator/>

                <SignoutMenuItem/>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}