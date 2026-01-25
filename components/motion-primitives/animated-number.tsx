'use client'

import { cn } from '@/lib/utils'
import { motion, SpringOptions, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
  value: number
  className?: string
  springOptions?: SpringOptions
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export function AnimatedNumber({
  value,
  className,
  springOptions,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
}: AnimatedNumberProps) {
  const spring = useSpring(value, springOptions)
  const display = useTransform(spring, (current) =>
    current.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    })
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span className={cn('tabular-nums', className)}>
      {display}
    </motion.span>
  )
}
