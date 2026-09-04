/* Massive star shedding its outer layers.
 * Deterministic: seeded RNG, identical geometry on every load. */
export function build(THREE) {

/* deterministic rng + cheap fbm for knotty surfaces */
const rng = (s => () => (s = s * 1664525 + 1013904223 >>> 0) / 4294967296)(20240903);
function fbm(x, y, z) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * Math.sin(f * x * 1.7 + 2.1 * Math.cos(f * y * 1.3 + i)) *
             Math.cos(f * z * 1.9 + 1.7 * Math.sin(f * x * 0.7 + i));
    a *= 0.5; f *= 2.1;
  }
  return v;
}
/* push vertices along their normals by fbm — turns smooth primitives into ejecta */
function roughen(geo, amp, freq, offset = 0) {
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = amp * fbm(x * freq + offset, y * freq + offset, z * freq + offset);
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const M = {
  core:    new THREE.MeshStandardMaterial({ name: 'core-plasma', color: '#A9C7FF', roughness: 0.3, metalness: 0.04, emissive: '#4A7BFF', emissiveIntensity: 1.6 }),
  wind:    new THREE.MeshStandardMaterial({ name: 'hot-wind', color: '#4C6FE0', roughness: 0.48, metalness: 0.04, emissive: '#1F3FD8', emissiveIntensity: 0.18, side: THREE.DoubleSide }),
  shell:   new THREE.MeshStandardMaterial({ name: 'shell-dust', color: '#C3D4EE', roughness: 0.95, metalness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }),
  knot:    new THREE.MeshStandardMaterial({ name: 'dust-knot', color: '#5C82E8', roughness: 0.78, metalness: 0.04 }),
  inner:   new THREE.MeshStandardMaterial({ name: 'inner-dust', color: '#A8BEDF', roughness: 0.92, metalness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.78 }),
  outer:   new THREE.MeshStandardMaterial({ name: 'outer-dust', color: '#DCE6F7', roughness: 0.95, metalness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.62 }),
  halo:    new THREE.MeshStandardMaterial({ name: 'core-halo', color: '#7EA0F8', roughness: 0.6, emissive: '#3A66E8', emissiveIntensity: 1.1, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
};

const star = new THREE.Group();
star.name = 'wr124-shedding-star';
const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); m.name = name; star.add(m); return m; };

/* ---- the star: a hot core inside its own ejecta ---- */
add(roughen(new THREE.SphereGeometry(0.46, 64, 40), 0.014, 13, 3.1), M.core, 'core-photosphere');

/* the glow of the star, filling the cavity it cleared */
add(roughen(new THREE.SphereGeometry(0.66, 48, 32), 0.03, 6, 21.5), M.halo, 'core-halo');

/* the fast wind still leaving the surface, torn into two open caps */
[[0.5, 0.45], [3.6, 2.1]].forEach(([phi, theta], i) => {
  const g = new THREE.SphereGeometry(0.8, 48, 24, phi, 2.1, theta, 1.0);
  roughen(g, 0.03, 8, 11.7 + i * 5);
  add(g, M.wind, 'hot-wind-' + (i + 1));
});

/* ---- nested concentric shells: spheres with blobby holes blown through
        them. The holes share one radial noise field, so they line up into
        open sightlines and the blue star reads from any angle. Boundary
        vertices are pulled onto the threshold isoline, so the torn edges
        are ragged rather than staircased. ---- */
function shellGeometry(r, hole, seed, amp, freq, LON = 200, LAT = 100) {
  const dirAt = (i, j) => {
    const lon = (i / LON) * Math.PI * 2, lat = (j / LAT) * Math.PI;
    return [Math.sin(lat) * Math.cos(lon), Math.cos(lat), Math.sin(lat) * Math.sin(lon)];
  };
  /* one shared field: every shell tears in the same places, opening channels */
  const openness = (sx, sy, sz) =>
    fbm(sx * 1.15 + 4.2, sy * 1.15 - 1.7, sz * 1.15 + 2.9) * 1.35
    + 0.3 * fbm(sx * 3.1 + seed, sy * 3.1, sz * 3.1);
  const P = (i, j, pull = 0) => {
    let [sx, sy, sz] = dirAt(i, j);
    if (pull) {
      /* feather: nudge the vertex tangentially toward the hole's isoline */
      const e = 0.012;
      const gx = openness(sx + e, sy, sz) - openness(sx - e, sy, sz);
      const gy = openness(sx, sy + e, sz) - openness(sx, sy - e, sz);
      const gz = openness(sx, sy, sz + e) - openness(sx, sy, sz - e);
      const g = Math.hypot(gx, gy, gz) || 1;
      const k = (pull / g) * 0.09;
      sx += gx * k; sy += gy * k; sz += gz * k;
      const L = Math.hypot(sx, sy, sz) || 1;
      sx /= L; sy /= L; sz /= L;
    }
    const d = r * (1 + amp * fbm(sx * freq + seed, sy * freq + seed, sz * freq)
                     + amp * 0.45 * fbm(sx * freq * 3.3, sy * freq * 3.3, sz * freq * 3.3 + seed));
    return [sx * d, sy * d, sz * d];
  };
  const vOpen = (i, j) => { const [x, y, z] = dirAt(i, j); return openness(x, y, z); };
  const pos = [];
  for (let j = 0; j < LAT; j++) {
    for (let i = 0; i < LON; i++) {
      const o = [vOpen(i, j), vOpen(i + 1, j), vOpen(i + 1, j + 1), vOpen(i, j + 1)];
      if (Math.min(...o) > hole) continue;                       // fully inside a hole
      const pull = o.map((v) => (v > hole ? v - hole : 0));      // feather the rim
      const a = P(i, j, pull[0]), b = P(i + 1, j, pull[1]);
      const c = P(i + 1, j + 1, pull[2]), d = P(i, j + 1, pull[3]);
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

const SHELLS = [
  { r: 1.08, hole: -0.16, amp: 0.05, freq: 2.6, seed: 2.4, mat: 'inner' },
  { r: 1.58, hole: -0.10, amp: 0.06, freq: 2.0, seed: 8.1, mat: 'shell' },
  { r: 2.14, hole: -0.02, amp: 0.07, freq: 1.5, seed: 15.7, mat: 'outer' }
];
SHELLS.forEach((sh, i) => {
  add(shellGeometry(sh.r, sh.hole, sh.seed, sh.amp, sh.freq), M[sh.mat], 'shell-' + (i + 1));
});

/* ---- clumps: the knots the nebula is broken into ---- */
for (let i = 0; i < 74; i++) {
  const u = rng() * 2 - 1, a = rng() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const sh = SHELLS[Math.floor(rng() * 3)];
  const r = sh.r * (1 + (rng() - 0.5) * 0.06);
  const sz = 0.028 + rng() * 0.055;
  const geo = roughen(new THREE.SphereGeometry(sz, 14, 10), sz * 0.45, 26, i * 3.7);
  const m = add(geo, rng() > 0.25 ? M.knot : M.inner, 'knot-' + String(i + 1).padStart(2, '0'));
  m.scale.set(1.15 + rng() * 0.5, 0.7 + rng() * 0.4, 1.15 + rng() * 0.5);
  m.position.set(s * Math.cos(a) * r, u * r, s * Math.sin(a) * r);
  m.lookAt(0, 0, 0);
}

/* ---- filaments: short curved tapering strands drawn along the shells ---- */
for (let i = 0; i < 18; i++) {
  const u = rng() * 2 - 1, a = rng() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const base = new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
  const r0 = 1.1 + rng() * 0.95;
  const t = new THREE.Vector3().crossVectors(base, new THREE.Vector3(0, 1, 0.3)).normalize();
  const pts = [];
  for (let k = 0; k <= 5; k++) {
    const f = k / 5;
    pts.push(base.clone()
      .multiplyScalar(r0 * (1 + 0.07 * f))
      .addScaledVector(t, 0.34 * f)
      .addScaledVector(base.clone().cross(t).normalize(), 0.12 * Math.sin(f * 2.4)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const RS = 24, geo = new THREE.TubeGeometry(curve, RS, 0.018, 6, false);
  const p = geo.attributes.position;
  for (let v = 0; v < p.count; v++) {                            // taper to a point
    const f = Math.floor(v / 7) / RS;
    const c = curve.getPointAt(Math.min(1, f));
    const k = 1 - 0.85 * f;
    p.setXYZ(v, c.x + (p.getX(v) - c.x) * k, c.y + (p.getY(v) - c.y) * k, c.z + (p.getZ(v) - c.z) * k);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  add(geo, i % 4 === 0 ? M.knot : M.inner, 'filament-' + String(i + 1).padStart(2, '0'));
}

  star.rotation.set(0.12, 0.4, 0.08);
  return { object: star };
}
