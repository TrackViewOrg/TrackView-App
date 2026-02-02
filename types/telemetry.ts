export interface TelemetryDataPoint {
  time: number
  x: number
  y: number
  speed: number
  throttle: number
  brake: number
  gear: number
  steer: number
  norm_dist: number
}

export type TelemetryData = Record<string, TelemetryDataPoint[]>
