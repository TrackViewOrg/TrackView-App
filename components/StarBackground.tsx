'use client'

import React, { useEffect, useRef } from 'react'

// --- Configuration ---
const STAR_CONFIG = {
  // Number of static stars in the background
  COUNT: 75,
  // Probability of a shooting star appearing per frame (0.01 = ~1 per sec, 0.002 = ~1 per 8 secs)
  SHOOTING_STAR_PROBABILITY: 0.001,
  // Color (Slate-400 equivalent in RGB)
  COLOR: '148, 163, 184',
}

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
  angle: number
}

const ShootingStars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    const starColor = STAR_CONFIG.COLOR

    // Initialize Static Stars
    const stars: Star[] = []
    const numStars = STAR_CONFIG.COUNT // Use config value
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.005 + 0.002,
      })
    }

    // Initialize Shooting Stars
    const shootingStars: ShootingStar[] = []

    const createShootingStar = (): ShootingStar => {
      const startX = Math.random() * canvas.width
      const startY = Math.random() * canvas.height * 0.5
      return {
        x: startX,
        y: startY,
        length: Math.random() * 80 + 10,
        speed: Math.random() * 10 + 6,
        opacity: 1,
        angle: Math.PI / 4,
      }
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw Static Stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed
        if (star.opacity > 1 || star.opacity < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starColor}, ${Math.abs(star.opacity)})`
        ctx.fill()
      })

      // Manage Shooting Stars using Config Probability
      if (Math.random() < STAR_CONFIG.SHOOTING_STAR_PROBABILITY) {
        shootingStars.push(createShootingStar())
      }

      // Draw and Move Shooting Stars
      for (let i = 0; i < shootingStars.length; i++) {
        const star = shootingStars[i]

        star.x += star.speed * Math.cos(star.angle)
        star.y += star.speed * Math.sin(star.angle)
        star.opacity -= 0.015

        const endX = star.x - star.length * Math.cos(star.angle)
        const endY = star.y - star.length * Math.sin(star.angle)

        const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY)
        gradient.addColorStop(0, `rgba(${starColor}, ${star.opacity})`)
        gradient.addColorStop(1, `rgba(${starColor}, 0)`)

        ctx.beginPath()
        ctx.moveTo(star.x, star.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()

        if (
          star.opacity <= 0 ||
          star.x > canvas.width ||
          star.y > canvas.height
        ) {
          shootingStars.splice(i, 1)
          i--
        }
      }

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
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  )
}

export default ShootingStars
