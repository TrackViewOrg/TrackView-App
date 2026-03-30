# Track Ground Truth Extraction

- [x] Define the problem statement and constraints from user context.
- [x] Reject `fast_lane.ai` as a ground-truth source for track shape.
- [x] Validate the physical-surface extraction path from AC track assets.
- [x] Define an automated pipeline from track files to metric SVG output.
- [x] Document fallbacks, confidence checks, and failure modes.
- [x] Add a short review section with the recommended implementation path.

## Review

- Recommended source of truth: physical track meshes identified by AC node naming plus `surfaces.ini`, not `fast_lane.ai`, not `map.png`, and not material names.
- Recommended automation path: load all KN5 files for the layout, filter meshes by valid track surface semantics, project drivable triangles to X/Z, union them into a 2D polygon, and export SVG in meter space.
- `fast_lane.ai` remains useful only for verification, lap-progress alignment, or optional centerline metadata.
- Important caveat: this can produce exact in-sim ground truth. It cannot make a mod more accurate than the mod's own underlying geometry.

## Prototype

- [ ] Add a standalone CLI entrypoint for track extraction.
- [ ] Support direct OBJ input and automated KN5 to OBJ conversion.
- [ ] Parse `surfaces.ini` and `models.ini` for physical mesh selection.
- [ ] Reconstruct 2D boundary loops from drivable triangles.
- [ ] Emit SVG plus metadata JSON with metric bounds.
- [ ] Add fixture-based tests and run them locally.
