/* Long gamma-ray burst (collapsar): black hole, accretion torus and twin jets.
 * build() returns a tick(dt) so the host can pause the flow off-screen. */
export function build(THREE) {

const rng = (s => () => (s = s * 1664525 + 1013904223 >>> 0) / 4294967296)(77120903);
function fbm(x, y, z) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * Math.sin(f * x * 1.7 + 2.1 * Math.cos(f * y * 1.3 + i)) *
             Math.cos(f * z * 1.9 + 1.7 * Math.sin(f * x * 0.7 + i));
    a *= 0.5; f *= 2.1;
  }
  return v;
}
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
  hole:    new THREE.MeshStandardMaterial({ name: 'black-hole', color: '#141414', roughness: 0.35, metalness: 0.25 }),
  torus:   new THREE.MeshStandardMaterial({ name: 'accretion-torus', color: '#F5C518', roughness: 0.45, metalness: 0.08, emissive: '#FF5A1F', emissiveIntensity: 0.9, side: THREE.DoubleSide }),
  beam:    new THREE.MeshStandardMaterial({ name: 'jet-core', color: '#FFFFFF', vertexColors: true, roughness: 0.28, metalness: 0.04, emissive: '#FFFFFF', emissiveIntensity: 0.3 }),
  rim:     new THREE.MeshStandardMaterial({ name: 'inner-rim', color: '#DCE8FF', roughness: 0.28, metalness: 0.04, emissive: '#4A7BFF', emissiveIntensity: 1.4 }),
  cool:    new THREE.MeshStandardMaterial({ name: 'cool-outflow', color: '#FF8A2B', roughness: 0.5, metalness: 0.05, emissive: '#F5C518', emissiveIntensity: 0.5 }),
  sheath:  new THREE.MeshStandardMaterial({ name: 'jet-sheath', color: '#FFFFFF', vertexColors: true, roughness: 0.5, metalness: 0.04, emissive: '#FFFFFF', emissiveIntensity: 0.08, side: THREE.DoubleSide, transparent: true, opacity: 0.42 }),
  shock:   new THREE.MeshStandardMaterial({ name: 'internal-shock', color: '#1F3FD8', roughness: 0.55, metalness: 0.06, emissive: '#1F3FD8', emissiveIntensity: 0.35 }),
  glow:    new THREE.MeshStandardMaterial({ name: 'jet-glow', color: '#FFFFFF', vertexColors: true, roughness: 0.6, emissive: '#FFFFFF', emissiveIntensity: 0.06, side: THREE.DoubleSide, transparent: true, opacity: 0.1 }),
  packet:  new THREE.MeshStandardMaterial({ name: 'flow-packet', color: '#FFFFFF', vertexColors: true, roughness: 0.45, metalness: 0.05, emissive: '#FFFFFF', emissiveIntensity: 0.18 }),
  envelope:new THREE.MeshStandardMaterial({ name: 'stellar-envelope', color: '#C3D4EE', roughness: 0.95, metalness: 0.03, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
};

const grb = new THREE.Group();
grb.name = 'gamma-ray-burst';
const add = (geo, mat, name) => { const m = new THREE.Mesh(geo, mat); m.name = name; grb.add(m); return m; };

/* ---- central engine: the collapsed core and its accretion torus ---- */
add(new THREE.SphereGeometry(0.13, 32, 24), M.hole, 'black-hole');

const torus = new THREE.TorusGeometry(0.46, 0.2, 20, 128);
{ /* flatten into a fed disk and score it with orbital striations */
  const p = torus.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = Math.hypot(x, y), a = Math.atan2(y, x);
    const s = 1 + 0.03 * fbm(x * 7, y * 7, z * 5) + 0.014 * Math.sin(a * 64);
    const flare = 1.35 - 0.5 * Math.min(1, (r - 0.26) / 0.42);   // thicker toward the inner edge
    p.setXYZ(i, x * s, y * s, z * 0.34 * flare);
  }
  p.needsUpdate = true;
  torus.computeVertexNormals();
  torus.rotateX(-Math.PI / 2);
}
add(torus, M.torus, 'accretion-torus');

/* the inner edge of the disk, glowing where it meets the hole */
const rim = new THREE.TorusGeometry(0.27, 0.03, 10, 96);
rim.rotateX(-Math.PI / 2);
add(rim, M.rim, 'inner-disk-rim');

/* the disk's cooler outer edge, where the temperature has dropped to yellow */
const outerEdge = new THREE.TorusGeometry(0.72, 0.045, 10, 128);
{
  const p = outerEdge.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const s = 1 + 0.05 * fbm(x * 6, y * 6, z * 4);
    p.setXYZ(i, x * s, y * s, z * 0.55);
  }
  p.needsUpdate = true;
  outerEdge.computeVertexNormals();
  outerEdge.rotateX(-Math.PI / 2);
}
add(outerEdge, M.cool, 'outer-disk-edge');

/* ---- temperature ramp: blue-white where the flow is hottest at the base,
        yellow then orange out along the beam where it has cooled ---- */
const TEMP = [
  [0.00, new THREE.Color('#F2F7FF')],
  [0.26, new THREE.Color('#B9D2FF')],
  [0.46, new THREE.Color('#EFF3F2')],
  [0.64, new THREE.Color('#FBE7B4')],
  [0.82, new THREE.Color('#F5C518')],
  [1.00, new THREE.Color('#FF7A22')]
];
function tempAt(f) {
  for (let i = 1; i < TEMP.length; i++) {
    if (f <= TEMP[i][0] || i === TEMP.length - 1) {
      const [a, ca] = TEMP[i - 1], [b, cb] = TEMP[i];
      return ca.clone().lerp(cb, Math.min(1, Math.max(0, (f - a) / (b - a))));
    }
  }
}
/* paint a jet cone by axial position: local -L/2 is the base, +L/2 the head */
function paintByAxis(geo, L, gamma = 1) {
  const p = geo.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) {
    const f = Math.pow(Math.min(1, Math.max(0, (p.getY(i) + L / 2) / L)), gamma);
    const c = tempAt(f);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

/* ---- twin jets: a bright collimated core inside a wide, faint,
        flaring beam — the shape artists' impressions give a GRB ---- */
const JET = { y0: 0.14, len: 3.2, r0: 0.07, r1: 0.5 };

[1, -1].forEach((dir) => {
  const tag = dir > 0 ? 'north' : 'south';
  const L = JET.len * (dir > 0 ? 1 : 0.88);

  /* narrow bright core, tapering open along the axis */
  const core = new THREE.CylinderGeometry(JET.r1 * 0.34, JET.r0 * 0.55, L, 32, 1, true);
  paintByAxis(core, L, 1.5);
  const mc = add(core, M.beam, 'jet-core-' + tag);
  mc.position.y = dir * (JET.y0 + L / 2);
  mc.scale.y = dir;

  /* the beam proper: a wider translucent cone, its wall broken up */
  const sh = new THREE.CylinderGeometry(JET.r1, JET.r0, L, 48, 16, true);
  roughen(sh, 0.035, 2.6, dir > 0 ? 4.1 : 9.7);
  paintByAxis(sh, L, 1.15);
  const ms = add(sh, M.sheath, 'jet-beam-' + tag);
  ms.position.y = dir * (JET.y0 + L / 2);
  ms.scale.y = dir;

  /* a fainter halo cone outside it, so the beam fades rather than ending */
  const halo = new THREE.CylinderGeometry(JET.r1 * 1.5, JET.r0 * 1.6, L * 1.02, 40, 1, true);
  paintByAxis(halo, L * 1.02, 0.9);
  const mh = add(halo, M.glow, 'jet-halo-' + tag);
  mh.position.y = dir * (JET.y0 + L / 2);
  mh.scale.y = dir;

  /* internal shocks: three knots where faster shells overrun slower ones */
  [0.34, 0.58, 0.82].forEach((f, i) => {
    const r = JET.r0 + (JET.r1 - JET.r0) * f;
    const ring = new THREE.TorusGeometry(r * 1.02, 0.022 - 0.004 * i, 8, 72);
    roughen(ring, 0.02, 6, 20 + i * 4);
    const m = add(ring, i === 2 ? M.cool : M.shock, 'shock-' + tag + '-' + (i + 1));
    m.rotation.x = Math.PI / 2;
    m.rotation.z = i * 0.4;
    m.position.y = dir * (JET.y0 + L * f);
  });
});

/* ---- the dying envelope: the star's outer layers, open at both poles ---- */
const env = new THREE.SphereGeometry(1.15, 128, 64, 0, Math.PI * 2, 0.45, Math.PI - 0.9);
roughen(env, 0.07, 2.4, 12.9);
const menv = add(env, M.envelope, 'stellar-envelope');
menv.scale.set(1, 1.26, 1);

/* the funnel each jet drilled, thickening the torn polar rim */
[1, -1].forEach((dir) => {
  const ring = new THREE.TorusGeometry(0.5, 0.05, 10, 96);
  roughen(ring, 0.035, 5, dir > 0 ? 61 : 73);
  const m = add(ring, M.envelope, 'polar-funnel-' + (dir > 0 ? 'north' : 'south'));
  m.rotation.x = Math.PI / 2;
  m.position.y = dir * 1.29;
});

/* clumps of envelope breaking up over the surface */
for (let i = 0; i < 34; i++) {
  const u = (rng() * 2 - 1) * 0.86, a = rng() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const sz = 0.055 + rng() * 0.08;
  const geo = roughen(new THREE.SphereGeometry(sz, 14, 10), sz * 0.4, 22, i * 3.7);
  const m = add(geo, M.envelope, 'clump-' + String(i + 1).padStart(2, '0'));
  m.scale.set(0.95 + rng() * 0.35, 0.7 + rng() * 0.3, 0.95 + rng() * 0.35);
  const r = 1.0;
  m.position.set(s * Math.cos(a) * r, u * r * 1.26, s * Math.sin(a) * r);
  m.lookAt(0, 0, 0);
}

/* ---- flow: packets of material running out along each beam ---- */
const flows = [];
/* irregular phases, so gaps along the beam vary by 2-3x */
const PHASES = [0.0, 0.07, 0.2, 0.27, 0.42, 0.56, 0.63, 0.8, 0.9];
const PACKETS = PHASES.length;
[1, -1].forEach((dir) => {
  const tag = dir > 0 ? 'north' : 'south';
  const L = JET.len * (dir > 0 ? 1 : 0.88);
  for (let i = 0; i < PACKETS; i++) {
    /* a partial arc, not a closed hoop — a shell riding the beam */
    const arc = 1.0 + rng() * 1.7;
    const geo = new THREE.TorusGeometry(1, 0.026 + rng() * 0.036, 8, 40, arc);
    geo.rotateX(Math.PI / 2);
    const n = geo.attributes.position.count;
    geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    const m = add(geo, M.packet, 'flow-' + tag + '-' + String(i + 1).padStart(2, '0'));
    m.rotation.set((rng() - 0.5) * 0.3, rng() * Math.PI * 2, (rng() - 0.5) * 0.3);
    flows.push({ m, geo, dir, L, phase: PHASES[i], t: PHASES[i], bulge: 0.35 + rng() * 0.75 });
  }
});
const PAPER = new THREE.Color('#F4F1E8');
function placeFlow(f) {
  const r = JET.r0 + (JET.r1 - JET.r0) * f.t;
  f.m.position.y = f.dir * (JET.y0 + f.L * f.t);
  f.m.scale.set(r * (0.94 + f.bulge * 0.14), f.bulge, r * (0.94 + f.bulge * 0.14));
  /* temperature, faded toward the ground as the packet runs out of the beam */
  const c = tempAt(f.t).lerp(PAPER, Math.pow(f.t, 2.2) * 0.8);
  const col = f.geo.attributes.color;
  for (let i = 0; i < col.count; i++) col.setXYZ(i, c.r, c.g, c.b);
  col.needsUpdate = true;
}
flows.forEach(placeFlow);

const disk = grb.getObjectByName('accretion-torus');
const diskRim = grb.getObjectByName('inner-disk-rim');
const diskEdge = grb.getObjectByName('outer-disk-edge');
  let clock = 0;
  function tick(dt) {
    dt = Math.min(0.05, dt);
  /* one shared clock, fixed per-packet offsets — spacing can never drift */
  clock = (clock + dt * 0.19) % 1;
  for (const f of flows) {
    f.t = (clock + f.phase) % 1;
    placeFlow(f);
  }
  const spin = dt * 0.55;
  if (disk) disk.rotation.y += spin;
  if (diskRim) diskRim.rotation.y += spin * 2.4;
  if (diskEdge) diskEdge.rotation.y += spin * 0.6;
  }
  grb.rotation.set(0.06, 0.5, 0.14);
  return { object: grb, tick };
}
