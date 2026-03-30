import * as React from 'react'
import { cn } from '@/lib/utils'

const SegmentedBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const validChildren = React.Children.toArray(children)
  const count = validChildren.length

  return (
    <div
      ref={ref}
      className={cn('flex text-sm uppercase', className)}
      {...props}
    >
      {validChildren.map((child, index) => {
        if (!React.isValidElement(child)) return null

        const element = child as React.ReactElement<{ className?: string }>

        const isFirst = index === 0
        const isLast = index === count - 1

        return React.cloneElement(element, {
          className: cn(
            'border-border/60 bg-primary-foreground/80 p-0.5 px-3 flex items-center',
            isFirst && 'rounded-l-sm border',
            !isFirst && 'border-y border-r',
            isLast && 'rounded-r-sm',
            element.props.className
          ),
        })
      })}
    </div>
  )
})
SegmentedBar.displayName = 'SegmentedBar'

export { SegmentedBar }
