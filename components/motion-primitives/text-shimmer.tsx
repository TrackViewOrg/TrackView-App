'use client'
import React, { type JSX, useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type TextShimmerProps = {
  children: string
  as?: React.ElementType
  className?: string
  duration?: number
  spread?: number
}

const MotionP = motion.create('p')
const MotionSpan = motion.create('span')
const MotionDiv = motion.create('div')

// Cache for dynamically created motion components to avoid creation during render
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motionCache = new Map<string, any>()

function TextShimmerComponent({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = useMemo(() => {
    if (Component === 'p') return MotionP
    if (Component === 'span') return MotionSpan
    if (Component === 'div') return MotionDiv

    if (typeof Component !== 'string') {
      // For custom components, we still need to wrap them with motion.
      // To avoid creating them during render, we can use the cache if possible,
      // but custom components (functions/classes) as keys in a Map might be tricky if they are recreated.
      // However, usually these are stable references.
      // eslint-disable-next-line
      if (!motionCache.has(Component as any)) {
        // eslint-disable-next-line
        motionCache.set(Component as any, motion.create(Component as any))
      }
      // eslint-disable-next-line
      return motionCache.get(Component as any)
    }

    if (!motionCache.has(Component)) {
      motionCache.set(
        Component,
        motion.create(Component as keyof JSX.IntrinsicElements)
      )
    }
    return motionCache.get(Component)
  }, [Component])

  const dynamicSpread = useMemo(() => {
    return children.length * spread
  }, [children, spread])

  return (
    // eslint-disable-next-line
    <MotionComponent
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]',
        '[background-repeat:no-repeat,padding-box] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
        'dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  )
}

export const TextShimmer = React.memo(TextShimmerComponent)
