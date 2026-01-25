import React from 'react'
import { cn } from '@/lib/utils'

interface SettingSectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

interface SettingItemProps {
  title: string
  value: string | React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const SettingSection = ({
  children,
  className,
  title,
  description,
}: SettingSectionProps) => {
  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex flex-col'}>
        <h1 className={'text-md'}>{title}</h1>
        <h1 className={'text-muted-foreground/50 text-xs'}>{description}</h1>
      </div>
      <div className={cn('flex w-full flex-col', className)}>{children}</div>
    </div>
  )
}

export const SettingItem = ({
  title,
  value,
  action,
  className,
}: SettingItemProps) => {
  return (
    <div
      className={cn(
        'bg-muted/50 flex w-full items-center justify-between gap-2 px-5 py-3',
        'border-border/50 border-x border-t last:border-b',
        'first:rounded-t-[4px] last:rounded-b-[4px]',
        className
      )}
    >
      <div>
        <h3 className="text-muted-foreground text-[12px]">{title}</h3>
        <div className="text-foreground text-[14px] font-medium">{value}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
