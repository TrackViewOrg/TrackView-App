import { TelemetryDataPoint } from '@/types/telemetry'

type TelemetryField = keyof TelemetryDataPoint
type TelemetrySeriesPayload = Partial<Record<TelemetryField, unknown>>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFieldSeries(
  payload: TelemetrySeriesPayload,
  field: TelemetryField
): unknown[] {
  const series = payload[field]
  return Array.isArray(series) ? series : []
}

function toFiniteNumber(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : 0

  return Number.isFinite(parsed) ? parsed : 0
}

function seriesPayloadToPoints(
  payload: TelemetrySeriesPayload
): TelemetryDataPoint[] {
  const pointCount = getFieldSeries(payload, 'time').length

  if (pointCount === 0) {
    return []
  }

  return Array.from({ length: pointCount }, (_, index) => ({
    time: toFiniteNumber(getFieldSeries(payload, 'time')[index]),
    x: toFiniteNumber(getFieldSeries(payload, 'x')[index]),
    y: toFiniteNumber(getFieldSeries(payload, 'y')[index]),
    speed: toFiniteNumber(getFieldSeries(payload, 'speed')[index]),
    throttle: toFiniteNumber(getFieldSeries(payload, 'throttle')[index]),
    brake: toFiniteNumber(getFieldSeries(payload, 'brake')[index]),
    gear: toFiniteNumber(getFieldSeries(payload, 'gear')[index]),
    steer: toFiniteNumber(getFieldSeries(payload, 'steer')[index]),
    norm_dist: toFiniteNumber(getFieldSeries(payload, 'norm_dist')[index]),
  }))
}

function sortTelemetryPoints(
  points: TelemetryDataPoint[]
): TelemetryDataPoint[] {
  return [...points].sort((left, right) => left.time - right.time)
}

export function parseTelemetryPayload(payload: unknown): TelemetryDataPoint[] {
  if (!isRecord(payload)) {
    return []
  }

  if (Array.isArray(payload.time)) {
    return sortTelemetryPoints(seriesPayloadToPoints(payload))
  }

  const allPoints = Object.keys(payload)
    .sort((left, right) => {
      const leftNumber = Number.parseInt(left, 10)
      const rightNumber = Number.parseInt(right, 10)

      if (Number.isNaN(leftNumber) || Number.isNaN(rightNumber)) {
        return left.localeCompare(right)
      }

      return leftNumber - rightNumber
    })
    .flatMap((key) => {
      const sectionPayload = payload[key]
      if (!isRecord(sectionPayload) || !Array.isArray(sectionPayload.time)) {
        return []
      }

      return seriesPayloadToPoints(sectionPayload)
    })

  return sortTelemetryPoints(allPoints)
}

export function findClosestTelemetryPointByNormalizedDistance(
  points: TelemetryDataPoint[],
  targetNormalizedDistance: number
): TelemetryDataPoint | null {
  if (points.length === 0) {
    return null
  }

  let low = 0
  let high = points.length - 1

  while (low < high) {
    const middle = Math.floor((low + high) / 2)

    if (points[middle].norm_dist < targetNormalizedDistance) {
      low = middle + 1
    } else {
      high = middle
    }
  }

  const current = points[low]
  const previous = points[Math.max(0, low - 1)]

  if (!previous) {
    return current
  }

  return Math.abs(previous.norm_dist - targetNormalizedDistance) <=
    Math.abs(current.norm_dist - targetNormalizedDistance)
    ? previous
    : current
}
