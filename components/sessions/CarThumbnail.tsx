'use client'

import * as React from 'react'
import Image from 'next/image'

interface CarThumbnailProps {
  alt: string
  src: string
}

export function CarThumbnail({ alt, src }: CarThumbnailProps) {
  const [hasError, setHasError] = React.useState(false)

  if (hasError) {
    return null
  }

  return (
    <div className="w-16 flex-shrink-0 overflow-hidden rounded-[4px]">
      <Image
        src={src}
        alt={alt}
        width={128}
        height={72}
        sizes="64px"
        className="h-auto w-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
