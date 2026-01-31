'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { usePathname, useRouter } from 'next/navigation'
import { getTrackInternalName } from '@/lib/dashboard/track'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/components/sessions/SessionContext'
import { Lap } from '@/components/sessions/LapTable'

interface TrackMapProps {
  sessionId: string
  laps: Lap[]
}

interface TrackSection {
  startPct: number | string
  endPct: number | string
}

interface TrackSections {
  [key: string]: TrackSection
}

interface SectionData {
  name: string
  startPct: number
  endPct: number
  index: number
}

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string
  x: number
  y: number
  idealX: number
  idealY: number
  data: SectionData
}

// Basic GeoJSON type definition
interface GeoJSONData {
  type: string
  features: unknown[]
  bbox?: number[]
  [key: string]: unknown
}

export function TrackMap({ sessionId, laps }: TrackMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [geoJson, setGeoJson] = useState<GeoJSONData | null>(null)
  const [sections, setSections] = useState<TrackSections | null>(null)

  const { selectedLapId, referenceLapId } = useSession()

  // Derived state for sections
  const sectionsArray = useMemo(() => {
    if (!sections) return []
    return Object.entries(sections)
      .map(([name, data]) => ({
        name,
        startPct: Number(data.startPct),
        endPct: Number(data.endPct),
      }))
      .sort((a, b) => a.startPct - b.startPct)
      .map((s, i) => ({ ...s, index: i }))
  }, [sections])

  // Memoize deltas
  const sectionDeltas = useMemo(() => {
    if (
      sectionsArray.length === 0 ||
      !selectedLapId ||
      !referenceLapId ||
      !laps
    )
      return {}

    const selectedLap = laps.find((l) => l.id === selectedLapId)
    const referenceLap = laps.find((l) => l.id === referenceLapId)

    if (!selectedLap || !referenceLap) return {}

    const deltas: Record<string, number> = {}

    sectionsArray.forEach((section) => {
      const index = section.index
      const selectedTimeStr = selectedLap.sections?.[index.toString()]
      const referenceTimeStr = referenceLap.sections?.[index.toString()]

      if (selectedTimeStr && referenceTimeStr) {
        const selectedTime = parseFloat(selectedTimeStr.replace('s', ''))
        const referenceTime = parseFloat(referenceTimeStr.replace('s', ''))

        if (!isNaN(selectedTime) && !isNaN(referenceTime)) {
          deltas[section.name] = selectedTime - referenceTime
        }
      }
    })
    return deltas
  }, [sectionsArray, selectedLapId, referenceLapId, laps])

  // 1. Fetch data
  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        setLoading(true)
        const {
          internalName,
          sections: trackSections,
          error: nameError,
        } = await getTrackInternalName(sessionId)

        if (!mounted) return

        if (nameError || !internalName) {
          setError(nameError || 'Could not find track name')
          setLoading(false)
          return
        }

        if (trackSections) {
          setSections(trackSections as TrackSections)
        }

        const baseUrl = `https://cdn.jsdelivr.net/gh/TrackViewOrg/TrackView-Data@main/Tracks/${internalName}/center_line.geojson`

        const response = await fetch(baseUrl)
        if (!response.ok) {
          if (mounted) {
            setError(`Failed to fetch: ${response.statusText}`)
            setLoading(false)
          }
          return
        }

        const data = await response.json()
        if (mounted) {
          setGeoJson(data)
          setLoading(false)
        }
      } catch {
        if (mounted) {
          setError('Failed to load map')
          setLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      mounted = false
    }
  }, [sessionId])

  // 2. Render map
  useEffect(() => {
    if (!geoJson || !svgRef.current || !containerRef.current) return

    const render = () => {
      const width = containerRef.current?.clientWidth || 0
      const height = containerRef.current?.clientHeight || 0

      if (width === 0 || height === 0) return

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      svg.attr('width', width).attr('height', height)

      // Drop shadow definition
      const defs = svg.append('defs')
      const filter = defs
        .append('filter')
        .attr('id', 'drop-shadow')
        .attr('height', '130%')
      filter
        .append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3)
      filter
        .append('feOffset')
        .attr('dx', 0)
        .attr('dy', 2)
        .attr('result', 'offsetblur')
      filter
        .append('feFlood')
        .attr('flood-color', '#000000')
        .attr('flood-opacity', 0.5)
      filter
        .append('feComposite')
        .attr('in2', 'offsetblur')
        .attr('operator', 'in')
      const feMerge = filter.append('feMerge')
      feMerge.append('feMergeNode')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

      try {
        const PADDING = 50
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projection = d3.geoMercator().fitExtent(
          [
            [PADDING, PADDING],
            [width - PADDING, height - PADDING],
          ],
          geoJson as any
        )
        const pathGenerator = d3.geoPath().projection(projection)

        // Visual Constants
        const ROAD_WIDTH = 6
        const BORDER_WIDTH = 2
        const OUTER_STROKE_WIDTH = ROAD_WIDTH + BORDER_WIDTH * 2

        // Card Constants
        const CARD_WIDTH = 80 // Increased width for names
        const CARD_HEIGHT = 42 // Increased height for two lines of text
        const COLLISION_RADIUS = CARD_WIDTH / 2 + 8

        // --- LAYER 1: Border ---
        const borderPath = svg
          .append('path')
          .datum(geoJson)
          .attr('d', pathGenerator)
          .attr('fill', 'none')
          .attr('stroke', '#303030')
          .attr('stroke-width', OUTER_STROKE_WIDTH)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')

        // --- LAYER 2: Road Surface ---
        svg
          .append('path')
          .datum(geoJson)
          .attr('d', pathGenerator)
          .attr('fill', 'none')
          .attr('stroke', '#202020')
          .attr('stroke-width', ROAD_WIDTH)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')

        if (sectionsArray.length > 0) {
          const pathNode = borderPath.node() as SVGPathElement
          const totalLength = pathNode ? pathNode.getTotalLength() : 0

          // 1. Calculate Initial Positions & Draw Separators
          const nodes: SimulationNode[] = []

          sectionsArray.forEach((section) => {
            let endPct = section.endPct
            if (endPct <= section.startPct && section.startPct > 0.5)
              endPct = 1.0
            if (endPct <= section.startPct) return

            // --- Draw Separator (Tick Mark) ---
            const len = totalLength * endPct
            const p1 = pathNode.getPointAtLength(len)

            // Tangent calculation
            const sampleLen = len >= totalLength ? len - 1 : len
            const pA = pathNode.getPointAtLength(sampleLen)
            const pB = pathNode.getPointAtLength(sampleLen + 0.1)

            const dx = pB.x - pA.x
            const dy = pB.y - pA.y
            const angle = Math.atan2(dy, dx)
            const perpAngle = angle + Math.PI / 2

            // Make tick exactly the width of the outer stroke (10px total)
            const tickSize = OUTER_STROKE_WIDTH / 2

            const x1 = p1.x - Math.cos(perpAngle) * tickSize
            const y1 = p1.y - Math.sin(perpAngle) * tickSize
            const x2 = p1.x + Math.cos(perpAngle) * tickSize
            const y2 = p1.y + Math.sin(perpAngle) * tickSize

            svg
              .append('line')
              .attr('x1', x1)
              .attr('y1', y1)
              .attr('x2', x2)
              .attr('y2', y2)
              .attr('stroke', '#909090')
              .attr('stroke-width', 2)
              .attr('stroke-linecap', 'butt')
              .attr('opacity', 1)

            // --- Prepare Node for Simulation ---
            const midPct = section.startPct + (endPct - section.startPct) / 2
            const midPointLength = totalLength * midPct
            const centerPoint = pathNode.getPointAtLength(midPointLength)

            nodes.push({
              id: section.name,
              x: centerPoint.x,
              y: centerPoint.y,
              idealX: centerPoint.x,
              idealY: centerPoint.y,
              data: section,
            })
          })

          // 2. Run Force Simulation to resolve overlaps
          const simulation = d3
            .forceSimulation<SimulationNode>(nodes)
            .force(
              'x',
              d3
                .forceX<SimulationNode>((d: SimulationNode) => d.idealX)
                .strength(0.3)
            )
            .force(
              'y',
              d3
                .forceY<SimulationNode>((d: SimulationNode) => d.idealY)
                .strength(0.3)
            )
            .force(
              'collide',
              d3.forceCollide(COLLISION_RADIUS).strength(1).iterations(2)
            )
            .stop()

          for (let i = 0; i < 150; ++i) simulation.tick()

          // 3. Render Lines & Cards
          nodes.forEach((node) => {
            const delta = sectionDeltas[node.data.name]
            const hasDelta = delta !== undefined
            const deltaStr = hasDelta
              ? (delta > 0 ? '+' : '') + delta.toFixed(3)
              : '-'
            const deltaColor = hasDelta
              ? delta > 0
                ? '#ef4444'
                : '#22c55e'
              : '#71717a'

            // --- Draw Leader Line (if moved significantly) ---
            const dist = Math.sqrt(
              Math.pow(node.x - node.idealX, 2) +
                Math.pow(node.y - node.idealY, 2)
            )

            if (dist > 5) {
              svg
                .append('line')
                .attr('x1', node.idealX)
                .attr('y1', node.idealY)
                .attr('x2', node.x)
                .attr('y2', node.y)
                .attr('stroke', '#71717a')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '2,2')
                .attr('opacity', 0.6)
                .attr('pointer-events', 'none')
            }

            // --- Draw Card Group ---
            const group = svg
              .append('g')
              .attr('transform', `translate(${node.x}, ${node.y})`)
              .attr('cursor', 'pointer')
              .attr('filter', 'url(#drop-shadow)')
              .on('click', () => {
                router.push(`${pathname}/map?section=${node.data.index}`)
              })
              // --- Hover Interactions ---
              .on('mouseenter', (event: MouseEvent) => {
                const g = d3.select(event.currentTarget as Element)
                // Switch bg to normal muted
                g.select('rect')
                  .classed('fill-muted/90', false)
                  .classed('fill-muted', true)
              })
              .on('mouseleave', (event: MouseEvent) => {
                const g = d3.select(event.currentTarget as Element)
                // Revert to bg-muted/90
                g.select('rect')
                  .classed('fill-muted', false)
                  .classed('fill-muted/90', true)
              })

            // Card Background
            group
              .append('rect')
              .attr('x', -CARD_WIDTH / 2)
              .attr('y', -CARD_HEIGHT / 2)
              .attr('width', CARD_WIDTH)
              .attr('height', CARD_HEIGHT)
              .attr('rx', 3) // Rounded -3
              .attr('stroke-width', 1)
              // Using Tailwind classes for styles
              .attr(
                'class',
                'fill-muted/90 stroke-border/70 transition-colors duration-150'
              )

            // Section Name (Top)
            group
              .append('text')
              .text(node.data.name)
              .attr('x', 0)
              .attr('y', -6) // Shifted up
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              // Use muted-foreground color for the label name
              .attr('class', 'fill-muted-foreground text-[10px] font-medium')
              .style('user-select', 'none')
              .style('pointer-events', 'none')

            // Delta Time (Bottom)
            group
              .append('text')
              .text(deltaStr)
              .attr('x', 0)
              .attr('y', 8) // Shifted down
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', deltaColor)
              .attr('font-size', '15px')
              .attr('font-weight', 'bold')
              .attr('font-family', 'monospace')
              .style('user-select', 'none')
              .style('pointer-events', 'none')
          })
        }
      } catch (e) {
        console.error('TrackMap: D3 Render Error', e)
      }
    }

    render()
    const resizeObserver = new ResizeObserver(() => render())
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [geoJson, sectionsArray, sectionDeltas, router, pathname])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-muted-foreground flex h-full w-full items-center justify-center">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div ref={containerRef} className="h-full min-h-50 w-full">
        <svg
          ref={svgRef}
          className="block h-full w-full"
          style={{ overflow: 'visible' }}
        />
      </div>
    </div>
  )
}
