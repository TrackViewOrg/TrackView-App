import React from "react";
import {cn} from "@/lib/utils";

interface SettingSectionProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
}

interface SettingItemProps {
    title: string;
    value: string | React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const SettingSection = ({children, className, title, description}: SettingSectionProps) => {
    return (
        <div className={"flex flex-col gap-2"}>
            <div className={"flex flex-col"}>
                <h1 className={"text-md"}>{title}</h1>
                <h1 className={"text-xs text-muted-foreground/50"}>{description}</h1>
            </div>
            <div className={cn("flex flex-col w-full", className)}>
                {children}
            </div>
        </div>
    );
};

export const SettingItem = ({title, value, action, className}: SettingItemProps) => {
    return (
        <div className={cn(
            "w-full bg-muted/50 px-5 py-3 flex justify-between items-center gap-2",
            "border-x border-t border-border/50 last:border-b",
            "first:rounded-t-[4px] last:rounded-b-[4px]",
            className
        )}>
            <div>
                <h3 className="text-[12px] text-muted-foreground">{title}</h3>
                <div className="text-[14px] font-medium text-foreground">{value}</div>
            </div>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};