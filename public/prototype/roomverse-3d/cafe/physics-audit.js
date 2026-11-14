// Room 04 construction checks. Coordinates are world-space metres; reports are millimetres.
// The scene builder registers relationships while parts are still separate, before batching.
const mm = (value) => Math.round(value * 1000 * 10) / 10;
const EPS = 1e-6;

function inset({ x, z }, surface) {
  if (surface.shape === "circle") return surface.radius - Math.hypot(x - surface.x, z - surface.z);
  return Math.min(x - surface.x0, surface.x1 - x, z - surface.z0, surface.z1 - z);
}

function pointBoxPenetration(point, box, radius = 0) {
  const dx = Math.max(box.x0 - point.x, 0, point.x - box.x1);
  const dy = Math.max(box.y0 - point.y, 0, point.y - box.y1);
  const dz = Math.max(box.z0 - point.z, 0, point.z - box.z1);
  const outside = Math.hypot(dx, dy, dz);
  if (outside > 0) return radius - outside;
  return Math.min(point.x - box.x0, box.x1 - point.x, point.y - box.y0,
    box.y1 - point.y, point.z - box.z0, box.z1 - point.z) + radius;
}

export function auditRoom04(entries) {
  return entries.map(({ name, kind, ...entry }) => {
    if (kind === "embed") {
      const edge = inset(entry.tip, entry.surface);
      const depth = entry.tip.y - entry.surface.y;
      return { ok: edge + EPS >= 0.003 && depth + EPS >= 0.003, name,
        detail: `support inset ${mm(edge)} mm; vertical embed ${mm(depth)} mm (min 3 mm)` };
    }
    if (kind === "join") {
      const a = entry.a, b = entry.b;
      const gap = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) - (entry.radiusA ?? 0) - (entry.radiusB ?? 0);
      return { ok: gap <= 0.002 + EPS, name, detail: `joint gap ${mm(gap)} mm (max 2 mm)` };
    }
    if (kind === "rim") {
      const t = (entry.rim.y - entry.start.y) / (entry.end.y - entry.start.y);
      const x = entry.start.x + t * (entry.end.x - entry.start.x);
      const z = entry.start.z + t * (entry.end.z - entry.start.z);
      const clear = entry.rim.radius - Math.hypot(x - entry.rim.x, z - entry.rim.z) - entry.tubeRadius;
      return { ok: t >= 0 && t <= 1 && clear >= -EPS, name,
        detail: `rim clearance ${mm(clear)} mm; crossing fraction ${Math.round(t * 100)}% (min 0 mm)` };
    }
    if (kind === "barrier") {
      const penetration = Math.max(...entry.points.map((p) => pointBoxPenetration(p, entry.box, entry.radius ?? 0)));
      return { ok: penetration <= EPS, name, detail: `board/wall penetration ${mm(Math.max(0, penetration))} mm (max 0 mm)` };
    }
    if (kind === "rest") {
      const edge = inset(entry.base, entry.surface) - (entry.base.radius ?? 0);
      const gap = entry.base.y - entry.surface.y;
      return { ok: edge >= -EPS && Math.abs(gap) <= 0.003 + EPS, name,
        detail: `support inset ${mm(edge)} mm; vertical gap ${mm(gap)} mm (max ±3 mm)` };
    }
    if (kind === "ground") {
      const gap = entry.bottomY - (entry.floorY ?? 0);
      return { ok: Math.abs(gap) <= 0.003 + EPS, name,
        detail: `ground gap ${mm(gap)} mm (max ±3 mm)` };
    }
    if (kind === "wall") {
      const gap = entry.back - entry.plane;
      return { ok: Math.abs(gap) <= 0.003 + EPS, name,
        detail: `wall mounting gap ${mm(gap)} mm (max ±3 mm)` };
    }
    if (kind === "reset") return { ok: entry.value === 0, name, detail: `partShiftLeft ${mm(entry.value)} mm (must be 0 mm)` };
    return { ok: false, name, detail: `unknown audit kind: ${kind}` };
  });
}
