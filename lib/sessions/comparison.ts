interface ComparableLap {
  id: string
  lap_time: number
}

function isLapAvailable(
  laps: ComparableLap[],
  lapId: string | null | undefined
): lapId is string {
  return !!lapId && laps.some((lap) => lap.id === lapId)
}

function getFirstDistinctLapId(
  laps: ComparableLap[],
  excludedLapId: string | null
): string | null {
  return laps.find((lap) => lap.id !== excludedLapId)?.id ?? null
}

export function getFastestLapId(laps: ComparableLap[]): string | null {
  if (laps.length === 0) {
    return null
  }

  return laps.reduce((fastestLap, currentLap) =>
    currentLap.lap_time < fastestLap.lap_time ? currentLap : fastestLap
  ).id
}

export function getSelectableComparisonLaps<T extends ComparableLap>(
  laps: T[],
  excludedLapId: string | null
): T[] {
  if (!excludedLapId) {
    return laps
  }

  return laps.filter((lap) => lap.id !== excludedLapId)
}

export function getInitialComparisonLapIds(
  laps: ComparableLap[],
  preferredSelectedLapId: string | null | undefined,
  preferredReferenceLapId: string | null | undefined
) {
  const selectedLapId = isLapAvailable(laps, preferredSelectedLapId)
    ? preferredSelectedLapId
    : (laps[0]?.id ?? null)

  const preferredReferenceId = isLapAvailable(laps, preferredReferenceLapId)
    ? preferredReferenceLapId
    : getFastestLapId(laps)

  const referenceLapId =
    preferredReferenceId && preferredReferenceId !== selectedLapId
      ? preferredReferenceId
      : getFirstDistinctLapId(laps, selectedLapId)

  return {
    selectedLapId,
    referenceLapId,
  }
}

export function getNextComparisonSelection(
  nextLapId: string | null,
  otherLapId: string | null
) {
  if (!nextLapId) {
    return null
  }

  return nextLapId === otherLapId ? null : nextLapId
}
