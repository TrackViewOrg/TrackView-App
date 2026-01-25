'use client'

import React, { useEffect, useRef } from 'react'

// --- Configuration ---
const CONFIG = {
  // Colors
  THEME: {
    CAR_LEADER: '56, 189, 248', // Cyan (Leader)
    CAR_CHASER: '248, 113, 113', // Red (Chaser)
    TRACK_LIMITS: '71, 85, 105', // Slate-600 (Darker)
    RACING_LINE: '148, 163, 184', // Slate-400
  },
  // Physics
  BASE_SPEED: 0.0025, // Significantly slower for "Professional" feel
  CAMERA_SMOOTHING: 0.08, // Lower = heavier/smoother camera lag
  ZOOM_LEVEL: 1.2, // Slight zoom to focus on details
}

interface Point {
  x: number
  y: number
}
interface Car {
  color: string
  progress: number
  speedOffset: number
  laneOffset: number
}

const TelemetryStream: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dimensions
    let width = window.innerWidth
    let height = window.innerHeight

    // Camera State
    const camera = { x: 0, y: 0, zoom: 1 }

    // Track State
    let p0: Point, p1: Point, p2: Point, p3: Point
    let cars: Car[] = []
    let state: 'RACING' | 'TRANSITION' = 'RACING'
    let transitionProgress = 0

    // --- Math Helpers ---
    const lerp = (start: number, end: number, t: number) =>
      start * (1 - t) + end * t

    const getBezierPoint = (
      t: number,
      p0: Point,
      p1: Point,
      p2: Point,
      p3: Point
    ): Point => {
      // Clamp t (0-1)
      const tc = Math.max(0, Math.min(1, t))
      const mt = 1 - tc
      const mt2 = mt * mt
      const mt3 = mt2 * mt
      const t2 = tc * tc
      const t3 = t2 * tc
      return {
        x:
          mt3 * p0.x +
          3 * mt2 * tc * p1.x +
          3 * mt * t2 * t2 * p2.x +
          t3 * p3.x,
        y:
          mt3 * p0.y +
          3 * mt2 * tc * p1.y +
          3 * mt * t2 * t2 * p2.y +
          t3 * p3.y,
      }
    }

    // --- Logic ---
    const initSector = () => {
      // Define a sector that spans somewhat larger than screen to encourage camera movement
      const margin = 200

      // Random entry/exit points
      const startSide = Math.random() > 0.5 ? 'LEFT' : 'RIGHT'

      p0 = {
        x: startSide === 'LEFT' ? -margin : width + margin,
        y: height * 0.8,
      }

      p3 = {
        x: startSide === 'LEFT' ? width + margin : -margin,
        y: height * 0.2,
      }

      // Complex Control Points for Chicane/S-Turn shapes
      p1 = {
        x: width * 0.2 + Math.random() * width * 0.2,
        y: height * 0.1,
      }
      p2 = {
        x: width * 0.6 + Math.random() * width * 0.2,
        y: height * 0.9,
      }

      // Reset Cars
      cars = [
        {
          color: CONFIG.THEME.CAR_LEADER,
          progress: 0,
          speedOffset: 0,
          laneOffset: 0,
        },
        {
          color: CONFIG.THEME.CAR_CHASER,
          progress: -0.08,
          speedOffset: 0.0002,
          laneOffset: 12,
        },
      ]

      state = 'RACING'
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initSector()
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    let animationFrameId: number

    const animate = () => {
      // 1. Update Physics
      let targetCamX = 0
      let targetCamY = 0

      if (state === 'RACING') {
        // Move Cars
        let activeCount = 0
        let avgX = 0
        let avgY = 0

        cars.forEach((car) => {
          car.progress += CONFIG.BASE_SPEED + car.speedOffset

          if (car.progress <= 1.1) {
            activeCount++
            const pos = getBezierPoint(car.progress, p0, p1, p2, p3)
            avgX += pos.x
            avgY += pos.y
          }
        })

        // Calculate Camera Target (Average position of cars)
        if (activeCount > 0) {
          avgX /= activeCount
          avgY /= activeCount

          // Center the "action" in the middle of the screen
          targetCamX = width / 2 - avgX
          targetCamY = height / 2 - avgY
        } else {
          // Everyone finished, trigger smooth transition
          state = 'TRANSITION'
          transitionProgress = 0
        }
      } else if (state === 'TRANSITION') {
        transitionProgress += 0.02
        if (transitionProgress >= 1) {
          initSector() // New Track
        }
        // During transition, drift camera slightly
        targetCamX = camera.x - 2
        targetCamY = camera.y - 2
      }

      // 2. Update Camera (Smooth Lerp)
      camera.x = lerp(camera.x, targetCamX, CONFIG.CAMERA_SMOOTHING)
      camera.y = lerp(camera.y, targetCamY, CONFIG.CAMERA_SMOOTHING)

      // 3. Draw
      ctx.clearRect(0, 0, width, height)

      ctx.save()

      // Apply Camera Transform
      // We translate to center, scale (zoom), then translate camera pos
      ctx.translate(width / 2, height / 2)
      ctx.scale(CONFIG.ZOOM_LEVEL, CONFIG.ZOOM_LEVEL)
      ctx.translate(-width / 2 + camera.x, -height / 2 + camera.y)

      // Fade out effect during transition
      if (state === 'TRANSITION') {
        ctx.globalAlpha = 1 - transitionProgress
      }

      // A. Draw Track Limits (Outer Lines)
      const drawCurve = (
        offset: number,
        color: string,
        width: number,
        dashed: boolean = false
      ) => {
        ctx.beginPath()
        // We draw the curve by sampling points (simple method for parallel curves)
        for (let t = 0; t <= 1; t += 0.01) {
          const p = getBezierPoint(t, p0, p1, p2, p3)
          // Approximate normal for offset (simplified)
          // For perfect parallel curves we need derivative, but simple x/y offset works for abstract
          if (t === 0) ctx.moveTo(p.x + offset, p.y + offset)
          else ctx.lineTo(p.x + offset, p.y + offset)
        }
        ctx.strokeStyle = `rgba(${color}, ${dashed ? 0.3 : 0.5})`
        ctx.lineWidth = width
        if (dashed) ctx.setLineDash([10, 20])
        else ctx.setLineDash([])
        ctx.stroke()
      }

      // Outer Left
      drawCurve(-25, CONFIG.THEME.TRACK_LIMITS, 2)
      // Outer Right
      drawCurve(25, CONFIG.THEME.TRACK_LIMITS, 2)
      // Center Racing Line
      drawCurve(0, CONFIG.THEME.RACING_LINE, 1, true)

      // B. Draw Cars (Abstract Data Points)
      cars.forEach((car) => {
        if (car.progress > -0.1 && car.progress < 1.1) {
          const pos = getBezierPoint(car.progress, p0, p1, p2, p3)

          // Glow
          ctx.shadowColor = `rgba(${car.color}, 0.8)`
          ctx.shadowBlur = 20

          // Core Dot
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${car.color}, 1)`
          ctx.fill()

          // Ring (Telemetry Marker)
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${car.color}, 0.4)`
          ctx.lineWidth = 1
          ctx.stroke()

          // Reset Shadow
          ctx.shadowBlur = 0
        }
      })

      ctx.restore()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full"
      style={{ opacity: 0.6 }} // Subtle blend with background
    />
  )
}

export default TelemetryStream
