import React, { JSX, ReactNode } from 'react'

function Section({
  children,
  title,
  description,
  className,
}: {
  children: ReactNode
  title: string
  description?: string
  className?: string
}): JSX.Element {
  return (
    <div
      className={
        'bg-background relative flex h-full w-full flex-col justify-start gap-7 overflow-hidden px-20 py-20 ' +
        className
      }
    >
      <header className={'flex w-full flex-col items-start justify-between'}>
        <h1 className={'text-3xl font-bold'}>{title}</h1>
        {description && (
          <p className={'text-muted-foreground text-lg font-light'}>
            {description}
          </p>
        )}
      </header>
      <div className={'h-full w-full'}>{children}</div>
    </div>
  )
}

export default Section
