import {
  getInitialComparisonLapIds,
  getNextComparisonSelection,
} from '@/lib/sessions/comparison'

const laps = [
  { id: 'lap-1', lap_time: 91.2 },
  { id: 'lap-2', lap_time: 89.4 },
  { id: 'lap-3', lap_time: 92.1 },
]

describe('comparison selection helpers', () => {
  it('chooses a distinct reference lap when selected and reference match', () => {
    expect(getInitialComparisonLapIds(laps, 'lap-2', 'lap-2')).toEqual({
      selectedLapId: 'lap-2',
      referenceLapId: 'lap-1',
    })
  })

  it('falls back to the fastest valid lap for the reference slot', () => {
    expect(getInitialComparisonLapIds(laps, 'lap-1', null)).toEqual({
      selectedLapId: 'lap-1',
      referenceLapId: 'lap-2',
    })
  })

  it('returns null when the next selection would duplicate the other slot', () => {
    expect(getNextComparisonSelection('lap-1', 'lap-1')).toBeNull()
  })
})
