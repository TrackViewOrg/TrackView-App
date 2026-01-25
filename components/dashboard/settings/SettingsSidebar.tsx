'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DatabaseIcon, LockIcon, SparkleIcon, UserIcon } from 'lucide-react'
import {
  settingsAccountRoute,
  settingsDataRoute,
  settingsSecurityRoute,
  settingsSubscriptionRoute,
} from '@/lib/constants'

const sidebarItems = [
  { label: 'Account', href: settingsAccountRoute, icon: UserIcon },
  { label: 'Security', href: settingsSecurityRoute, icon: LockIcon },
  { label: 'Data', href: settingsDataRoute, icon: DatabaseIcon },
  { label: 'Subscription', href: settingsSubscriptionRoute, icon: SparkleIcon },
] as const

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <div className="font-archivo flex h-full w-55 flex-col justify-between gap-1 border-r p-1">
      <div className={'flex flex-col gap-[1px]'}>
        {sidebarItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href

          return (
            <Button
              key={label}
              variant={isActive ? 'selected' : 'ghost'}
              size="sm"
              className={cn(
                'justify-start gap-3 px-3',
                !isActive && 'text-muted-foreground'
              )}
              asChild
            >
              <Link href={href}>
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            </Button>
          )
        })}
      </div>
      <div
        className={
          'text-muted-foreground/10 flex w-full justify-between px-2 text-xs'
        }
      >
        <span>TrackView</span>
        <span className={'font-mono'}>0.1.0</span>
      </div>
    </div>
  )
}
