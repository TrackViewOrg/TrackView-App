"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { Loader2 } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            gap={5}
            icons={{
                loading: <Loader2 className="h-4 w-4 animate-spin" />,
            }}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:!bg-muted group-[.toaster]:!border-border/40 group-[.toaster]:text-foreground !rounded-sm font-archivo gap-0",
                    description: "group-[.toast]:!text-muted-foreground/60 !m-0 !mt-0 !mb-0 ml-3",
                    title: "group-[.toast]:font-bold group-[.toast]:text-sm !m-0 !mt-0 !mb-0 ml-3",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground !rounded-sm !font-bold transition-colors hover:bg-primary/90 !py-4",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground !rounded-sm",
                    error:
                        "group-[.toaster]:!text-red-500",
                    success:
                        "group-[.toaster]:!text-green-500",
                    warning:
                        "group-[.toaster]:!text-yellow-500",
                    info:
                        "group-[.toaster]:!text-blue-500",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }