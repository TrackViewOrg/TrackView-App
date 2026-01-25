'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import TrackViewIcon from '@/components/TrackViewIcon'
import { homeRoute } from '@/lib/constants'

const containerVariants: Variants = {
  rest: {
    gap: '0.5rem',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  hover: {
    gap: '0.75rem',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const textVelocityVariants: Variants = {
  rest: {
    skewX: 0,
    backgroundPosition: '200% 0',
  },
  hover: {
    skewX: -12,
    backgroundPosition: '-200% 0',
    transition: {
      skewX: { type: 'spring', stiffness: 200, damping: 10 },
      backgroundPosition: {
        repeat: Infinity,
        duration: 4,
        ease: 'linear',
      },
    },
  },
}

export default function Logo() {
  return (
    <Link
      href={homeRoute}
      className="group absolute top-8 left-8 z-20 select-none"
    >
      <motion.div
        className="flex items-center"
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={containerVariants}
      >
        <div className="relative aspect-square h-7.5 text-[#dff976] transition-colors duration-300">
          <TrackViewIcon className="h-full w-full" />
        </div>

        <div className="relative overflow-visible">
          <motion.span
            className="text-foreground block text-4xl font-bold tracking-tighter"
            variants={textVelocityVariants}
          >
            TrackView
          </motion.span>
        </div>
      </motion.div>
    </Link>
  )
}
