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

// Helper: Formats URL segments (e.g., "track-analysis" -> "Track Analysis")
const formatPathTitle = (segment: string) => {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function TopbarBreadcrumb() {
  const pathname = usePathname()
  // Generate segments, filtering out empty strings caused by leading slashes
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

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <SlashIcon className="text-border h-4 w-4" />
              </BreadcrumbSeparator>

              <BreadcrumbItem className={'select-none'}>
                {isLast ? (
                  <BreadcrumbPage className={'font-semibold'}>
                    {formatPathTitle(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{formatPathTitle(segment)}</Link>
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
