import React from 'react'
import TopbarAvatar from "@/components/dashboard/topbar/topbarAvatar";
import TopbarBreadcrumb from "@/components/dashboard/topbar/topbarBreadcrumb";
import {Button} from "@/components/ui/button";
import {
    BellIcon,
    CircleQuestionMark,
    DownloadIcon,
    HeadsetIcon,
    HelpCircleIcon,
    InfoIcon, MessageCircleQuestionMarkIcon,
    MonitorIcon,
} from "lucide-react";
import Link from "next/link";
import {SupportDialog} from "@/components/dashboard/SupportDialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

function Topbar() {

    return (
        <div className={"border-b flex items-center pr-2 justify-between min-h-10.25 max-h-10.25 shrink-0"}>
            <TopbarBreadcrumb/>
            <div className={"flex items-center gap-1"}>
                <Tooltip delayDuration={400}>
                    <TooltipTrigger asChild>
                        <Button className={"h-8 w-8 cursor-pointer border border-border/10"} variant={"default"}>
                            <DownloadIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Download Client</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={400}>
                    <TooltipTrigger asChild>
                        <Button className={"h-8 w-8 cursor-pointer border border-border/10"} variant={"default"}>
                            <BellIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Notifications</p>
                    </TooltipContent>
                </Tooltip >
                <SupportDialog>
                    <Button className={"h-8 w-8 cursor-pointer border border-border/10 aspe"} variant={"default"}>
                        <MessageCircleQuestionMarkIcon/>
                    </Button>
                </SupportDialog>
                <TopbarAvatar/>
            </div>
        </div>
    )
}

export default Topbar
