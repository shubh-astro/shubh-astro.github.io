/* RV Tauri variable: a pulsating post-AGB star inside its own dust.
 * Deterministic geometry; the pulsation is written as a light curve first and
 * the geometry derived from it, so the page can plot the same magAt() that
 * drives the star. */

/* ---- the light curve ------------------------------------------------------
   Broad rounded maxima and narrower minima, the decline a little quicker than
   the rise, and alternating deep and shallow minima (with slightly alternating
   maxima to match). The formal period is the interval between successive deep
   minima — two pulsation cycles. */
export const PERIOD = 6;                          // seconds per pulsation cycle on screen
export const CYCLES = 4;                          // four cycles drawn = two formal periods
export const DEEP    = { max: 0.00, min: 1.00, swell: 0.20 };
export const SHALLOW = { max: 0.10, min: 0.80, swell: 0.15 };
export const cycleOf = (phi) => (Math.floor(phi) % 2 === 0 ? DEEP : SHALLOW);

/* magnitude at phase: phase 0 is maximum light */
export function magAt(phi) {
  const c = cycleOf(phi), next = cycleOf(Math.floor(phi) + 1);
  const f = phi - Math.floor(phi);
  const DECLINE = 0.47, PEAKED = 1.4;
  if (f < DECLINE) {                              // fall from a broad maximum into the dip
    const t = f / DECLINE;
    return c.max + (c.min - c.max) * Math.pow((1 - Math.cos(Math.PI * t)) / 2, PEAKED);
  }
  const t = (f - DECLINE) / (1 - DECLINE);        // rise back out, slightly slower
  return next.max + (c.min - next.max) * Math.pow((1 + Math.cos(Math.PI * t)) / 2, PEAKED);
}
/* the star is largest and coolest near minimum light, lagging it slightly */
function radiusAt(phi) {
  const p = (phi - 0.07 + CYCLES) % CYCLES, c = cycleOf(p);
  const frac = Math.min(1.05, Math.max(0, (magAt(p) - c.max) / (c.min - c.max)));
  return 1 + c.swell * frac;
}

export function build(THREE) {

/* cheap fbm for knotty surfaces */
function fbm(x, y, z) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * Math.sin(f * x * 1.7 + 2.1 * Math.cos(f * y * 1.3 + i)) *
             Math.cos(f * z * 1.9 + 1.7 * Math.sin(f * x * 0.7 + i));
    a *= 0.5; f *= 2.1;
  }
  return v;
}
/* push vertices along their normals by fbm */
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
  photosphere: new THREE.MeshStandardMaterial({ name: 'photosphere', color: '#FFE9A8', roughness: 0.42, metalness: 0.03, emissive: '#FFC24A', emissiveIntensity: 0.55 }),
  atmosphere:  new THREE.MeshStandardMaterial({ name: 'extended-atmosphere', color: '#F6D9A6', roughness: 0.8, metalness: 0.03, emissive: '#E8A85A', emissiveIntensity: 0.16, side: THREE.DoubleSide, transparent: true, opacity: 0.52 }),
  shockA:      new THREE.MeshStandardMaterial({ name: 'shock-shell-rising', color: '#FFFBEF', roughness: 0.5, emissive: '#FFE9B8', emissiveIntensity: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }),
  shockB:      new THREE.MeshStandardMaterial({ name: 'shock-shell-fading', color: '#FFF7F0', roughness: 0.5, emissive: '#FFDCC0', emissiveIntensity: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.16 }),
  dust:        new THREE.MeshStandardMaterial({ name: 'dust-shell', color: '#E4DCC8', roughness: 0.96, metalness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.17 })
};

const rv = new THREE.Group();
rv.name = 'rv-tauri-pulsator';
const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); m.name = name; rv.add(m); return m; };

/* ---- the pulsating star: photosphere and the extended atmosphere above it ---- */
const photosphere = add(roughen(new THREE.SphereGeometry(1, 96, 64), 0.03, 5.5, 3.1), M.photosphere, 'photosphere');
const atmosphere = add(roughen(new THREE.SphereGeometry(1.34, 80, 52), 0.022, 2.4, 17.4), M.atmosphere, 'extended-atmosphere');

/* ---- shock shells: thin fronts running out through the atmosphere ---- */
const shockA = add(roughen(new THREE.SphereGeometry(1, 72, 44), 0.045, 4.4, 27.2), M.shockA, 'shock-shell-rising');
const shockB = add(roughen(new THREE.SphereGeometry(1, 72, 44), 0.05, 3.8, 41.9), M.shockB, 'shock-shell-fading');

/* ---- dust shell: porous and clumpy, built by many cycles of mass loss.
        Holes share one radial field so sightlines open to the star, and rim
        vertices are pulled onto the threshold isoline so the tears are ragged
        rather than staircased. ---- */
function porousShell(r, hole, seed, amp, freq, LON = 184, LAT = 92) {
  const dirAt = (i, j) => {
    const lon = (i / LON) * Math.PI * 2, lat = (j / LAT) * Math.PI;
    return [Math.sin(lat) * Math.cos(lon), Math.cos(lat), Math.sin(lat) * Math.sin(lon)];
  };
  const openness = (x, y, z) => fbm(x * 1.2 + 3.4, y * 1.2 - 1.1, z * 1.2 + 2.2) * 1.3
                              + 0.3 * fbm(x * 3.1 + seed, y * 3.1, z * 3.1);
  const P = (i, j, pull = 0) => {
    let [sx, sy, sz] = dirAt(i, j);
    if (pull) {
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
    const d = r * (1 + amp * fbm(sx * freq + seed, sy * freq, sz * freq)
                     + amp * 0.4 * fbm(sx * freq * 3.2, sy * freq * 3.2, sz * freq * 3.2 + seed));
    return [sx * d, sy * d, sz * d];
  };
  const vOpen = (i, j) => { const [x, y, z] = dirAt(i, j); return openness(x, y, z); };
  const pos = [];
  for (let j = 0; j < LAT; j++) {
    for (let i = 0; i < LON; i++) {
      const o = [vOpen(i, j), vOpen(i + 1, j), vOpen(i + 1, j + 1), vOpen(i, j + 1)];
      if (Math.min(...o) > hole) continue;
      const pull = o.map((v) => (v > hole ? v - hole : 0));
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
add(porousShell(2.25, 0.46, 6.3, 0.07, 1.7), M.dust, 'dust-shell-inner');
add(porousShell(2.95, 0.54, 14.8, 0.08, 1.4), M.dust, 'dust-shell-outer');

rv.rotation.set(0.1, 0.4, 0.06);

/* ---- pulsation, derived from the light curve above ---- */
const HOT = new THREE.Color('#FFF3D0'), COOL = new THREE.Color('#E8873C');
const HOT_E = new THREE.Color('#FFD98A'), COOL_E = new THREE.Color('#C85A18');

let phase = 0;
/* Advances the pulsation and returns the phase, so the host can move the
   marker on its light curve without keeping a second clock. */
function tick(dt) {
  phase = (phase + Math.min(0.05, dt) / PERIOD) % CYCLES;

  const R = radiusAt(phase);
  const warmth = (R - 1) / DEEP.swell;            // 0 compressed, 1 fully swollen at deep minimum
  photosphere.scale.setScalar(R);
  M.photosphere.color.copy(HOT).lerp(COOL, warmth);
  M.photosphere.emissive.copy(HOT_E).lerp(COOL_E, warmth);
  M.photosphere.emissiveIntensity = 0.62 - 0.22 * warmth;

  /* the loosely bound envelope follows, a fifth of a cycle behind */
  const Ra = radiusAt((phase - 0.2 + CYCLES) % CYCLES);
  atmosphere.scale.setScalar(1 + (Ra - 1) * 1.5);
  M.atmosphere.opacity = 0.48 + 0.14 * ((Ra - 1) / DEEP.swell);

  /* two shock shells, half a cycle apart: one rising, one fading at the top */
  const shell = (mesh, mat, u, peak) => {
    mesh.scale.setScalar(1.05 + 1.5 * u);
    mat.opacity = peak * (1 - u) * (1 - u) + 0.02;
  };
  const f = phase - Math.floor(phase);
  shell(shockA, M.shockA, f, 0.34);
  shell(shockB, M.shockB, (f + 0.5) % 1, 0.34);

  return phase;
}
tick(0);                                          // settle the star at maximum light

  return { object: rv, tick };
}
