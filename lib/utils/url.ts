const DEFAULT_DEV_ORIGIN = 'http://localhost:3000'

export function getSiteOrigin(): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configuredOrigin) {
    return DEFAULT_DEV_ORIGIN
  }

  try {
    return new URL(configuredOrigin).origin
  } catch {
    return DEFAULT_DEV_ORIGIN
  }
}

export function sanitizeAppPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) {
    return fallback
  }

  return value.startsWith('/') && !value.startsWith('//') ? value : fallback
}
