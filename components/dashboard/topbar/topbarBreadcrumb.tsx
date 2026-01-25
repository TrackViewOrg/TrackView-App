'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SlashIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import TrackViewIcon from '@/components/TrackViewIcon'
import { homeRoute } from '@/lib/constants'

// Helper: Detect if a segment is an ID (UUID or generic long ID)
const isIdSegment = (segment: string) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
  // Checks for UUID OR long string mixed with numbers (e.g. MongoDB ID)
  return uuidRegex.test(segment) || (segment.length > 12 && /\d/.test(segment))
}

// Helper: Formats URL segments (e.g., "track-analysis" -> "Track Analysis")
const formatPathTitle = (segment: string) => {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function TopbarBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter((item) => item !== '')

  return (
    <Breadcrumb className={'font-archivo pl-1.5'}>
      <BreadcrumbList>
        {/* Root: Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={homeRoute} aria-label="Home">
              <TrackViewIcon className="dark:bg-background dark:border-background h-7 w-7 rounded-sm border bg-[#101010] p-1 text-[#dff976]" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic Segments */}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const href = `/${segments.slice(0, index + 1).join('/')}`

          const isId = isIdSegment(segment)

          // 1. If it's an ID in the middle of the path (e.g. /sessions/[id]/settings), SKIP IT.
          //    This creates the "Sessions / Settings" effect.
          if (isId && !isLast) {
            return null
          }

          // 2. Determine Display Name
          let displayName = formatPathTitle(segment)

          // 3. If it's an ID and it IS the last item, rename to "Overview"
          if (isId && isLast) {
            displayName = 'Overview'
          }

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <SlashIcon className="text-border h-4 w-4" />
              </BreadcrumbSeparator>

              <BreadcrumbItem className={'select-none'}>
                {isLast ? (
                  <BreadcrumbPage className={'font-semibold'}>
                    {displayName}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
