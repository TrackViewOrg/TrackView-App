"use client"
import React from 'react'
import TopbarAvatar from '@/components/dashboard/topbar/topbarAvatar'
import TopbarBreadcrumb from '@/components/dashboard/topbar/topbarBreadcrumb'
import { Button } from '@/components/ui/button'
import {
  BellIcon,
  DownloadIcon,
  MessageCircleQuestionMarkIcon,
  SparkleIcon,
  ZapIcon,
} from 'lucide-react'
import { SupportDialog } from '@/components/dashboard/SupportDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSubscriptionModal } from '@/lib/hooks/subscription'

function Topbar() {

  const subscriptionModal = useSubscriptionModal()

  return (
    <div
      className={
        'flex max-h-10.25 min-h-10.25 shrink-0 items-center justify-between border-b pr-2'
      }
    >
      <TopbarBreadcrumb />

      {/* 2. Replaced <hjere> with the Upgrade Button */}
      <Button
        size={'sm'}
        onClick={() => subscriptionModal.open()}
        className={
          'group flex h-7 gap-2 bg-[#dff976]/30 px-3 text-xs font-bold text-[#dff976]/90 hover:text-background hover:bg-[#dff976] transition-all duration-400'
        }
      >
        <ZapIcon className={'group-hover h-3.5 w-3.5'} />
        UPGRADE TO PLUS
      </Button>

      <div className={'flex items-center gap-1'}>
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <Button
              className={'border-border/10 h-8 w-8 cursor-pointer border'}
              variant={'default'}
            >
              <DownloadIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Client</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <Button
              className={'border-border/10 h-8 w-8 cursor-pointer border'}
              variant={'default'}
            >
              <BellIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
        <SupportDialog>
          <Button
            className={'border-border/10 aspe h-8 w-8 cursor-pointer border'}
            variant={'default'}
          >
            <MessageCircleQuestionMarkIcon />
          </Button>
        </SupportDialog>
        <TopbarAvatar />
      </div>
    </div>
  )
}

export default Topbar