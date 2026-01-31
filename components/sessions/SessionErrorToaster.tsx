'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function SessionErrorToaster() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      toast.error(error)
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('error')
      router.replace(`?${newParams.toString()}`)
    }
  }, [error, router, searchParams])

  return null
}
