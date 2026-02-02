export const getShortTimeAgo = (dateInput: string) => {
  if (!dateInput) return 'n/a'

  const recordDate = new Date(dateInput.replace(' ', 'T'))
  const now = new Date()
  const seconds = Math.floor((now.getTime() - recordDate.getTime()) / 1000)

  // Handle invalid dates or future dates immediately
  if (isNaN(seconds) || seconds < 0) return 'Now'

  // NEW: Quick check for under a minute
  if (seconds < 60) return 'Now'

  const units = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]

  for (const unit of units) {
    const interval = Math.floor(seconds / unit.seconds)
    if (interval >= 1) {
      return `${interval}${unit.label} Ago`
    }
  }

  return '0s'
}

export const formatLapTime = (seconds: number) => {
  if (!seconds) return '00:00.000'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}
