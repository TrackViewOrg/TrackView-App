import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "bg-primary-foreground/80 text-muted-foreground hover:bg-primary-foreground",
                destructive:
                    "bg-destructive/10 text-destructive hover:bg-destructive/20",
                outline:
                    "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                secondary:
                    "bg-input/20 text-muted-foreground hover:text-foreground/90 hover:bg-input/30",
                topbar:
                    "bg-track text-muted hover:text-black hover:bg-track/70",
                ghost:
                    "bg-transparent text-muted-foreground border-none hover:bg-muted hover:text-accent-foreground dark:hover:bg-input/40",
                cutted:
                    "bg-muted/60 text-muted-foreground border border-muted-foreground border-dashed hover:bg-muted hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                selected: "bg-accent/25 text-foreground",
                accent: "bg-foreground border-foreground border text-background",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
                icon: "size-9",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ComponentProps<"button">,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

function Button({
                    className,
                    variant = "default",
                    size = "default",
                    asChild = false,
                    ...props
                }: ButtonProps) {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }