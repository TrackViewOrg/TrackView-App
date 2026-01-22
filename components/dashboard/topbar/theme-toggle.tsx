"use client"

import * as React from "react"
import {Monitor, Moon, Sun} from "lucide-react"
import {useTheme} from "next-themes"

import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"

export function ThemeToggle() {
    const {setTheme, theme} = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch by rendering only after mount
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Return a placeholder with the same dimensions to prevent layout shift
        return <div className="w-full rounded-md bg-muted/50"/>
    }

    return (
        <Tabs
            defaultValue={theme}
            onValueChange={setTheme}
            className="w-full"
        >
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="light" className="rounded-[3px]">
                    <Sun className="h-4 w-4"/>
                </TabsTrigger>
                <TabsTrigger value="system" className="rounded-[3px]">
                    <Monitor className="h-4 w-4"/>
                </TabsTrigger>
                <TabsTrigger value="dark" className="rounded-[3px]">
                    <Moon className="h-4 w-4"/>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}