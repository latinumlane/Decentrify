// Projects/Decentrify/Web Designs/Landing Pages/lattice/hero-lattice.js
//
// Interactive multi-shell line-network hero with scroll-depth traversal.
//
// CONTROL GRAMMAR ported verbatim from the effects library:
//   Effects/anime/depth-scene-control.html  ("3D Scene Control")
// Same attributes (data-scene-control / data-scene-object), same drag
// coefficients (.42 / .32), same clamp (-55..35), same rest pose (-14 / 28),
// same idle-cursor parallax, same material-scene switcher, same reduced-motion
// contract. Only the render target changed: the original drives a CSS
// `transform`, this drives a Three.js Group. The effect's own README says to
// reach for real WebGL "when the geometry itself needs to be accurate" — an
// arbitrary node/edge network is exactly that case, since CSS 3D can only
// compose faces.
//
// SCROLL DEPTH: the lattice is built as N concentric shells. Scroll progress
// (0..1) dollies the camera inward while shells the camera has passed fade
// out, so each panel lands "inside" the next layer of the graph.
//
// Budget: 2 draw calls (1 LineSegments + 1 Points), zero per-frame allocation,
// no per-frame layout reads.

import * as THREE from 'three';

const DEG2RAD = Math.PI / 180;

// Rest pose + drag coefficients — from depth-scene-control.html
const REST_X = -14;
const REST_Y = 28;
const DRAG_Y = 0.42;
const DRAG_X = 0.32;
const CLAMP_MIN = -55;
const CLAMP_MAX = 35;

// Material scenes, drawn entirely from the decentrify.biz palette in
// `website v3/styles.css` — sky #81c9ff, blue #3d79ff, cream #f6f3e9, and the
// three existing section grounds (hero radial #112e5d, about #0a2552,
// featured #173e8c). Nothing invented.
//
// These retint the lattice and the secondary accents only. The primary CTA
// deliberately stays brand blue at all times — see --brand-blue in the page.
// Each preset is a distinct object, not just a palette:
//   topology — how the geometry is generated (see buildLattice)
//   effect   — which displacement branch the vertex shader takes
//   params   — overrides merged onto DEFAULTS when the scene is selected
//
// AURORA is the site's opening state and carries the operator-tuned values
// verbatim, so DEFAULTS and AURORA.params must stay in agreement.
const SCENES = [
  {
    label: 'SIGNAL', a: '#1170E7', b: '#1170E7', c: '#112e5d',
    topology: 'cube', effect: 1,
    // Rigid and mechanical: a nested cube wireframe with a quantised axial
    // pulse. Low amplitude so the right angles stay legible.
    params: { shape: 0, amplitude: 0.03, spin: 6, nodeSize: 7, lineAlpha: 0.86, fog: 0.7, density: 0.42 },
  },
  {
    label: 'AURORA', a: '#1170E7', b: '#1170E7', c: '#0a2552',
    topology: 'shell', effect: 0,
    params: { shape: -0.30, amplitude: 0.06, spin: 3, nodeSize: 8.5, lineAlpha: 0.78, fog: 0.66, density: 0.40 },
  },
  {
    label: 'MERIDIAN', a: '#f6f3e9', b: '#1170E7', c: '#173e8c',
    topology: 'tri', effect: 2,
    // Faceted and fluid: subdivided icosahedra with a ripple travelling
    // across the surface, so triangles shear against each other.
    params: { shape: 0.22, amplitude: 0.09, spin: -4, nodeSize: 5, lineAlpha: 0.6, fog: 0.86, density: 0.5 },
  },
];

const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency <= 4;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Tunable defaults exposed to the slider panel.
//
// These are the operator's hand-tuned values, captured 2026-08-08 — they are
// the first-load state of the site, not neutral starting points. Change them
// only on request. Note they are no longer device-branched: the geometry tier
// inside buildLattice() already scales node counts and the edge budget down on
// mobile, so 4 shells stays affordable there.
export const DEFAULTS = {
  shells:    4,        // number of lattice layers
  density:   0.40,     // edge distance threshold
  nodeSize:  8.5,
  lineAlpha: 0.78,
  amplitude: 0.06,
  spin:      3,        // deg/sec idle rotation
  hue:       -11,      // -180..180 shift applied to the active scene
  fog:       0.66,     // depth-fade strength
  shape:     -0.30,    // -1 = cubic shell, 0 = sphere, +1 = lobed/star
  // Fixed svh of scroll per stage transition. Across the six transitions this
  // produces a 700svh rig (including the opening viewport).
  sectionScroll: 100,
};

// Scene the site opens on. 0 Signal / 1 Aurora / 2 Meridian.
export const DEFAULT_SCENE = 1;

// ── Geometry ────────────────────────────────────────────────────────────────

function fibonacciShell(count, radius, shellNorm, nodes, shellIds) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    nodes.push(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius
    );
    shellIds.push(shellNorm);
  }
}

// ── Cube topology (SIGNAL) ──────────────────────────────────────────────────
// A nested cube wireframe. Points sit on the SURFACE of a res×res×res grid,
// and edges follow the grid axes, so the result is a true right-angled mesh
// rather than a sphere pretending to be one. Edges come from the topology
// itself, not from proximity — that is what keeps the corners crisp.
function cubeShellMesh(res, extent, shellNorm, nodes, shellIds, edges) {
  const base = shellIds.length;
  const index = new Map();          // "i,j,k" → node index
  const onSurface = (i, j, k) =>
    i === 0 || i === res - 1 || j === 0 || j === res - 1 || k === 0 || k === res - 1;
  const coord = i => (i / (res - 1) - 0.5) * 2 * extent;

  for (let i = 0; i < res; i++)
    for (let j = 0; j < res; j++)
      for (let k = 0; k < res; k++) {
        if (!onSurface(i, j, k)) continue;
        index.set(`${i},${j},${k}`, base + index.size);
        nodes.push(coord(i), coord(j), coord(k));
        shellIds.push(shellNorm);
      }

  // Axis-aligned neighbours only.
  for (const [key, a] of index) {
    const [i, j, k] = key.split(',').map(Number);
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
      const b = index.get(`${i + di},${j + dj},${k + dk}`);
      if (b !== undefined) edges.push(a, b);
    }
  }
}

// ── Triangular topology (MERIDIAN) ──────────────────────────────────────────
// Subdivided icosahedron projected to a sphere: real triangles, so the edge
// set is the triangulation itself and the facets read as facets.
function icosphereMesh(subdiv, radius, shellNorm, nodes, shellIds, edges) {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  for (let s = 0; s < subdiv; s++) {
    const mid = new Map();
    const next = [];
    const midpoint = (a, b) => {
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      let m = mid.get(key);
      if (m === undefined) {
        const va = verts[a], vb = verts[b];
        m = verts.length;
        verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]);
        mid.set(key, m);
      }
      return m;
    };
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  const base = shellIds.length;
  for (const v of verts) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    nodes.push(v[0] / len * radius, v[1] / len * radius, v[2] / len * radius);
    shellIds.push(shellNorm);
  }

  // Unique triangle edges — every edge is shared by two faces.
  const seen = new Set();
  for (const [a, b, c] of faces) {
    for (const [p, q] of [[a, b], [b, c], [c, a]]) {
      const key = p < q ? `${p},${q}` : `${q},${p}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(base + p, base + q);
    }
  }
}

// Shells run from radius 1.0 (outermost, shellNorm 0) inward to 0.28
// (innermost, shellNorm 1). For the proximity topology, edges connect within a
// shell and to the adjacent shell only — that keeps each layer legible instead
// of a uniform fuzz. Cube and tri carry their own edges from the mesh.
function buildLattice({ shells, density, maxEdges, topology = 'shell' }) {
  if (topology === 'cube' || topology === 'tri') {
    const nodes = [];
    const shellIds = [];
    const found = [];
    const shellCount = Math.max(2, Math.round(shells));
    const cap = isMobile || isLowEnd ? 0.72 : 1;

    for (let s = 0; s < shellCount; s++) {
      const t = shellCount === 1 ? 0 : s / (shellCount - 1);
      const size = 0.92 - t * 0.66;
      if (topology === 'cube') {
        // Link density drives grid resolution here rather than a radius.
        const res = Math.max(2, Math.round((3 + (density - 0.26) / 0.32 * 4) * cap));
        cubeShellMesh(res, size, t, nodes, shellIds, found);
      } else {
        // Capped at 2 deliberately. Subdiv 3 is ~1,920 edges per shell —
        // four shells blow past maxEdges and the budget stride then removes
        // edges at random, which on a triangulation reads as holes in the
        // faces rather than a thinner cloud.
        const subdiv = clamp(Math.round((1 + (density - 0.26) / 0.32) * cap), 1, 2);
        icosphereMesh(subdiv, size, t, nodes, shellIds, found);
      }
    }
    return finaliseLattice(nodes, shellIds, found, maxEdges, shellCount);
  }

  return buildProximityLattice({ shells, density, maxEdges });
}

function buildProximityLattice({ shells, density, maxEdges }) {
  const nodes = [];
  const shellIds = [];
  const shellCount = Math.max(2, Math.round(shells));

  for (let s = 0; s < shellCount; s++) {
    const t = shellCount === 1 ? 0 : s / (shellCount - 1);
    const radius = 1.0 - t * 0.72;
    // Fewer nodes on inner shells so density stays visually even.
    const count = Math.round((isMobile || isLowEnd ? 118 : 200) * (0.42 + 0.58 * (1 - t)));
    fibonacciShell(count, radius, t, nodes, shellIds);
  }

  const nodeCount = shellIds.length;
  const found = [];
  const t2 = density * density;
  const adjacent = shellCount === 1 ? 1 : 1 / (shellCount - 1) + 1e-4;

  for (let i = 0; i < nodeCount; i++) {
    const ix = nodes[i * 3], iy = nodes[i * 3 + 1], iz = nodes[i * 3 + 2];
    for (let j = i + 1; j < nodeCount; j++) {
      // Same shell, or one shell in — never skip layers.
      if (Math.abs(shellIds[i] - shellIds[j]) > adjacent) continue;
      const dx = ix - nodes[j * 3];
      const dy = iy - nodes[j * 3 + 1];
      const dz = iz - nodes[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < t2) found.push(i, j);
    }
  }

  return finaliseLattice(nodes, shellIds, found, maxEdges, shellCount);
}

// Packs a node list + edge list into the GPU buffers every topology shares.
function finaliseLattice(nodes, shellIds, found, maxEdges, shellCount) {
  // Enforce the budget by striding across the whole edge list, never by
  // truncating it. Nodes are generated outer-shell-first, so a plain cut
  // would hand every edge to the outer shells and leave the inner layers —
  // the ones the scroll descends into — completely bare.
  let edges = found;
  const foundCount = found.length / 2;
  if (foundCount > maxEdges) {
    const stride = foundCount / maxEdges;
    edges = new Array(maxEdges * 2);
    for (let e = 0; e < maxEdges; e++) {
      const src = Math.floor(e * stride) * 2;
      edges[e * 2] = found[src];
      edges[e * 2 + 1] = found[src + 1];
    }
  }

  const segCount = edges.length / 2;
  const positions = new Float32Array(segCount * 6);
  const seeds = new Float32Array(segCount * 2);
  const shellAttr = new Float32Array(segCount * 2);

  for (let e = 0; e < segCount; e++) {
    const a = edges[e * 2], b = edges[e * 2 + 1];
    positions[e * 6 + 0] = nodes[a * 3];
    positions[e * 6 + 1] = nodes[a * 3 + 1];
    positions[e * 6 + 2] = nodes[a * 3 + 2];
    positions[e * 6 + 3] = nodes[b * 3];
    positions[e * 6 + 4] = nodes[b * 3 + 1];
    positions[e * 6 + 5] = nodes[b * 3 + 2];
    seeds[e * 2 + 0] = a * 0.618;
    seeds[e * 2 + 1] = b * 0.618;
    shellAttr[e * 2 + 0] = shellIds[a];
    shellAttr[e * 2 + 1] = shellIds[b];
  }

  // Per-shell segment tally — proves the budget stride kept every layer
  // populated rather than starving the inner shells.
  const perShell = new Array(shellCount).fill(0);
  for (let e = 0; e < segCount; e++) {
    const s = Math.round(shellAttr[e * 2] * (shellCount - 1));
    perShell[s]++;
  }

  const nodeCount = shellIds.length;
  return {
    positions, seeds, shellAttr, perShell,
    nodePositions: new Float32Array(nodes),
    nodeSeeds: Float32Array.from({ length: nodeCount }, (_, i) => i * 0.618),
    nodeShells: Float32Array.from(shellIds),
    segCount, nodeCount, shellCount,
  };
}

// ── Shaders ─────────────────────────────────────────────────────────────────
// Displacement + shell visibility are shared so lines and nodes stay welded.

const COMMON = /* glsl */`
  uniform float uTime;
  uniform float uAmp;
  uniform float uDepth;   // 0 = outside, 1 = innermost layer
  uniform float uFog;
  uniform float uShape;   // -1 = cubic shell, 0 = sphere, +1 = lobed/star
  uniform float uEffect;  // 0 = organic, 1 = axial pulse, 2 = tangential ripple
  attribute float aSeed;
  attribute float aShell; // 0 = outer shell, 1 = inner shell
  varying float vDepth;
  varying float vRadius;
  varying float vShellVis;

  // Reshapes the wireframe without touching topology: edges were resolved
  // from the sphere positions, so deforming here keeps the same connection
  // graph and re-reads it as a new solid. Runs before breathe() so morph
  // amplitude rides on top of whatever shape is selected.
  vec3 shaped(vec3 p) {
    float rad = length(p);
    if (rad < 1e-5 || abs(uShape) < 0.001) return p;
    vec3 n = p / rad;

    if (uShape > 0.0) {
      // Lobed: spherical-harmonic modulation of the radius.
      float theta = atan(n.z, n.x);
      float phi   = acos(clamp(n.y, -1.0, 1.0));
      float h = sin(theta * 4.0) * sin(phi * 3.0);
      return n * rad * (1.0 + uShape * 0.5 * h);
    }

    // Cubic: push the shell out to its Chebyshev (box) envelope.
    float m = max(max(abs(n.x), abs(n.y)), abs(n.z));
    return mix(p, n * rad / max(m, 1e-5), -uShape);
  }

  // Per-scene motion. Branching on a uniform is uniform across the draw call,
  // so this costs nothing measurable versus three separate materials — and it
  // keeps the budget at two draw calls.
  vec3 breathe(vec3 p, float seed) {
    float d = length(p);
    vec3 dir = normalize(p + 1e-5);

    // 0 — AURORA: organic radial wave plus a lateral swirl.
    if (uEffect < 0.5) {
      float wave = sin(uTime * 0.9 + seed * 6.2831 + d * 2.2);
      float swirl = cos(uTime * 0.55 + seed * 3.1416);
      return p + dir * wave * uAmp + vec3(-dir.z, 0.0, dir.x) * swirl * uAmp * 0.6;
    }

    // 1 — SIGNAL: displacement along the dominant axis only, quantised into
    // steps so the cube reads as mechanical rather than fluid.
    if (uEffect < 1.5) {
      vec3 a = abs(p);
      float m = max(a.x, max(a.y, a.z));
      vec3 axis = vec3(
        a.x >= m ? sign(p.x) : 0.0,
        a.y >= m ? sign(p.y) : 0.0,
        a.z >= m ? sign(p.z) : 0.0
      );
      float pulse = sin(uTime * 1.5 + d * 3.2 + seed * 1.7);
      pulse = floor(pulse * 3.0) / 3.0;
      return p + axis * pulse * uAmp * 1.8;
    }

    // 2 — MERIDIAN: a ripple travelling ACROSS the surface rather than in and
    // out, so neighbouring triangles shear against one another.
    float lat = atan(p.z, p.x);
    float ripple = sin(lat * 3.0 + uTime * 1.1 + d * 2.4);
    vec3 tangent = normalize(vec3(-dir.z, 0.25, dir.x) + 1e-5);
    return p + tangent * ripple * uAmp * 2.2 + dir * ripple * uAmp * 0.3;
  }

  // Shells the camera has already travelled past dissolve, so the layer you
  // are currently inside is always the one you read.
  float shellVisibility() {
    float rel = aShell - uDepth;
    return smoothstep(-0.30, 0.02, rel);
  }
`;

function lineMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: COMMON + /* glsl */`
      void main() {
        vec3 p = breathe(shaped(position), aSeed);
        // Radius stays the ORIGINAL sphere radius so shell colouring and
        // depth-traversal fading are unaffected by the shape morph.
        vRadius = length(position);
        vShellVis = shellVisibility();
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uOpacity;
      uniform float uFog;
      varying float vDepth;
      varying float vRadius;
      varying float vShellVis;

      void main() {
        vec3 col = mix(uColorB, uColorA, smoothstep(0.28, 1.0, vRadius));
        float fog = mix(1.0, 1.0 - smoothstep(2.2, 6.4, vDepth), uFog);
        float a = uOpacity * fog * vShellVis;
        if (a < 0.002) discard;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
}

function nodeMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: COMMON + /* glsl */`
      uniform float uSize;
      uniform float uPixelRatio;
      void main() {
        vec3 p = breathe(shaped(position), aSeed);
        // Radius stays the ORIGINAL sphere radius so shell colouring and
        // depth-traversal fading are unaffected by the shape morph.
        vRadius = length(position);
        vShellVis = shellVisibility();
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = -mv.z;
        gl_PointSize = uSize * uPixelRatio * (3.0 / max(vDepth, 0.001));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uFog;
      varying float vDepth;
      varying float vRadius;
      varying float vShellVis;

      void main() {
        // Tight core, short falloff — nodes should read as joints in the
        // network, not as glowing orbs competing with the lines.
        vec2 d = gl_PointCoord - 0.5;
        float r = dot(d, d);
        if (r > 0.25) discard;
        float glow = 1.0 - smoothstep(0.05, 0.22, r);
        vec3 col = mix(uColorB, uColorA, smoothstep(0.28, 1.0, vRadius));
        float fog = mix(1.0, 1.0 - smoothstep(2.2, 6.4, vDepth), uFog);
        float a = glow * fog * vShellVis;
        if (a < 0.002) discard;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

export function initLattice({ canvas, viewport, chrome, rig, panelCount = 4, onScene, onDepth }) {
  const params = { ...DEFAULTS };
  const maxEdges = isMobile || isLowEnd ? 900 : 2200;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 20);
  camera.position.set(0, 0, 4.2);

  const uniforms = {
    uTime:       { value: 0 },
    uAmp:        { value: calm ? 0 : params.amplitude },
    uDepth:      { value: 0 },
    uFog:        { value: params.fog },
    uShape:      { value: params.shape },
    uEffect:     { value: SCENES[DEFAULT_SCENE].effect },
    uColorA:     { value: new THREE.Color(SCENES[0].a) },
    uColorB:     { value: new THREE.Color(SCENES[0].b) },
    uOpacity:    { value: params.lineAlpha },
    uSize:       { value: params.nodeSize },
    uPixelRatio: { value: renderer.getPixelRatio() },
  };

  // Group is the `data-scene-object` equivalent — the thing the drag orbits.
  const group = new THREE.Group();
  group.rotation.order = 'XYZ'; // matches CSS `rotateX(...) rotateY(...)` composition
  scene.add(group);

  let lattice, lineGeo, nodeGeo, lineMat, nodeMat, lines, points;

  // Declared up here because rebuild() reads SCENES[index] for the topology,
  // and rebuild() runs before the scene-switching block below.
  let index = DEFAULT_SCENE;

  function disposeMeshes() {
    if (!lines) return;
    group.remove(lines, points);
    lineGeo.dispose();
    nodeGeo.dispose();
    lineMat.dispose();
    nodeMat.dispose();
  }

  function rebuild() {
    disposeMeshes();
    lattice = buildLattice({
      shells: params.shells, density: params.density, maxEdges,
      topology: SCENES[index]?.topology ?? 'shell',
    });

    lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lattice.positions, 3));
    lineGeo.setAttribute('aSeed',    new THREE.BufferAttribute(lattice.seeds, 1));
    lineGeo.setAttribute('aShell',   new THREE.BufferAttribute(lattice.shellAttr, 1));
    lineMat = lineMaterial(uniforms);
    lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;

    nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(lattice.nodePositions, 3));
    nodeGeo.setAttribute('aSeed',    new THREE.BufferAttribute(lattice.nodeSeeds, 1));
    nodeGeo.setAttribute('aShell',   new THREE.BufferAttribute(lattice.nodeShells, 1));
    nodeMat = nodeMaterial(uniforms);
    points = new THREE.Points(nodeGeo, nodeMat);
    points.frustumCulled = false;

    group.add(lines, points);
  }
  // No standalone rebuild here — setScene(DEFAULT_SCENE) below performs the
  // first build, so boot does one build rather than two.

  // ── Orbit state (the ported control layer) ───────────────────────────────
  let rx = REST_X, ry = REST_Y;   // target, degrees
  let cx = REST_X, cy = REST_Y;   // damped current
  let spinAccum = 0;
  let drag = false, hasDragged = false, startX = 0, startY = 0, baseX = 0, baseY = 0;

  function onPointerDown(e) {
    if (calm) return;
    drag = true;
    hasDragged = true;
    viewport.classList.add('is-dragging');
    try { viewport.setPointerCapture(e.pointerId); } catch {}
    startX = e.clientX; startY = e.clientY;
    baseX = rx; baseY = ry;
  }

  function onPointerMove(e) {
    if (calm) return;
    if (drag) {
      ry = baseY + (e.clientX - startX) * DRAG_Y;
      rx = clamp(baseX - (e.clientY - startY) * DRAG_X, CLAMP_MIN, CLAMP_MAX);
      return;
    }
    // Idle cursor parallax is useful before interaction, but once the visitor
    // has placed the lattice manually, their chosen pose must persist.
    if (hasDragged) return;
    // Idle cursor parallax — same coefficients as the CSS effect.
    const r = viewport.getBoundingClientRect();
    ry = REST_Y + ((e.clientX - r.left) / r.width - 0.5) * 15;
    rx = REST_X - ((e.clientY - r.top) / r.height - 0.5) * 10;
  }

  function onPointerUp() {
    drag = false;
    viewport.classList.remove('is-dragging');
  }

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);

  // ── Scene switching + hue ────────────────────────────────────────────────
  function applyColors() {
    const s = SCENES[index];
    const a = new THREE.Color(s.a);
    const b = new THREE.Color(s.b);
    const shift = params.hue / 360;
    if (shift) { a.offsetHSL(shift, 0, 0); b.offsetHSL(shift, 0, 0); }
    uniforms.uColorA.value.copy(a);
    uniforms.uColorB.value.copy(b);
    // Retint the page chrome exactly like the original effect does.
    chrome.style.setProperty('--a', `#${a.getHexString()}`);
    chrome.style.setProperty('--b', `#${b.getHexString()}`);
    chrome.style.setProperty('--c', s.c);
  }

  // Selecting a preset adopts its whole character — geometry, motion and
  // palette — not just its colours. Any slider tweaks made under the previous
  // preset are replaced, which is what "preset" should mean.
  function setScene(i, { applyParams = true } = {}) {
    const prev = SCENES[index];
    index = (i + SCENES.length) % SCENES.length;
    const s = SCENES[index];

    if (applyParams && s.params) {
      Object.assign(params, s.params);
      uniforms.uShape.value   = params.shape;
      uniforms.uAmp.value     = calm ? 0 : params.amplitude;
      uniforms.uSize.value    = params.nodeSize;
      uniforms.uOpacity.value = params.lineAlpha;
      uniforms.uFog.value     = params.fog;
    }
    uniforms.uEffect.value = s.effect ?? 0;

    // Rebuilding is only needed when the mesh itself changes.
    const topologyChanged = (prev?.topology ?? 'shell') !== (s.topology ?? 'shell');
    if (topologyChanged || (applyParams && s.params && 'density' in s.params)) rebuild();

    applyColors();
    // The page re-syncs its sliders from this — without it the panel would
    // claim the old preset's numbers while the renderer used the new ones.
    onScene?.(index, s, SCENES.length, { ...params });
  }
  setScene(DEFAULT_SCENE);

  // ── Scroll depth ─────────────────────────────────────────────────────────
  // Measured on resize only; the loop reads scrollY, never layout.
  let rigTop = 0, rigRange = 1;
  let depthTarget = 0, depthCurrent = 0;

  function measure() {
    if (!rig) return;
    const r = rig.getBoundingClientRect();
    rigTop = r.top + window.scrollY;
    rigRange = Math.max(1, rig.offsetHeight - window.innerHeight);
  }

  // One sticky viewport plus `sectionScroll` of travel per layer transition.
  // Re-anchors the scroll position so dragging the slider doesn't teleport
  // the viewer to a different layer than the one they were reading.
  function applyRigHeight() {
    if (!rig) return;
    // Derive the held position from live scroll, not depthTarget — that only
    // updates once a frame has run, so it is stale if the slider moves first.
    // Only re-anchor when the viewer is actually inside the rig; someone
    // reading the FAQ below it must not get yanked back up.
    const within = rigRange > 1 && window.scrollY >= rigTop && window.scrollY <= rigTop + rigRange;
    const held = within ? clamp((window.scrollY - rigTop) / rigRange, 0, 1) : null;

    const transitions = Math.max(1, panelCount - 1);
    rig.style.height = `${100 + transitions * params.sectionScroll}svh`;
    measure();

    if (held !== null) scrollTo({ top: rigTop + rigRange * held, behavior: 'instant' });
  }

  function resize() {
    const r = viewport.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
    measure();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(viewport);
  addEventListener('resize', measure);
  resize();
  applyRigHeight(); // owns the rig height from here on; CSS value is only a pre-boot fallback

  // ── Loop ─────────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let running = true;

  function frame() {
    const delta = Math.min(clock.getDelta(), 0.1); // clamp after tab-restore
    uniforms.uTime.value += calm ? 0 : delta;

    // Scroll → depth, damped so wheel steps don't feel notchy.
    if (rig) depthTarget = clamp((window.scrollY - rigTop) / rigRange, 0, 1);
    const dk = 1 - Math.pow(0.004, delta);
    depthCurrent += (depthTarget - depthCurrent) * dk;
    uniforms.uDepth.value = depthCurrent;

    // Fly inward. Reduced motion keeps a much shorter travel.
    const travel = calm ? 0.9 : 3.55;
    camera.position.z = 4.2 - depthCurrent * travel;

    // Composition: wide viewports put the network right of the copy; narrow
    // ones lift it into the upper half so the stacked copy below sits on a
    // clean field. Both resolve to centre as the camera descends inside.
    const wide = camera.aspect > 1.05;
    group.position.x = (wide ? 1.05 : 0) * (1 - depthCurrent);
    group.position.y = (wide ? 0 : 0.92) * (1 - depthCurrent);

    // Frame-rate-independent damping toward the target pose.
    const k = 1 - Math.pow(0.0015, delta);
    cx += (rx - cx) * k;
    cy += (ry - cy) * k;
    if (!calm && params.spin && !drag) spinAccum += params.spin * delta;
    group.rotation.x = cx * DEG2RAD;
    group.rotation.y = (cy + spinAccum) * DEG2RAD;

    onDepth?.(depthCurrent);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);

  // Pause when the rig scrolls away — no point burning GPU off-screen.
  const vis = new IntersectionObserver(([entry]) => {
    const shouldRun = entry.isIntersecting;
    if (shouldRun === running) return;
    running = shouldRun;
    renderer.setAnimationLoop(running ? frame : null);
    if (running) clock.getDelta(); // discard the gap
  }, { threshold: 0.01 });
  vis.observe(rig || viewport);

  // ── Context loss ─────────────────────────────────────────────────────────
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    chrome.classList.add('is-context-lost');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    chrome.classList.remove('is-context-lost');
    resize();
    clock.getDelta();
    renderer.setAnimationLoop(frame);
  });

  // ── Param API for the slider panel ───────────────────────────────────────
  const REBUILD_KEYS = new Set(['shells', 'density']);

  function setParam(key, value) {
    if (!(key in params)) return;
    params[key] = value;
    switch (key) {
      case 'nodeSize':  uniforms.uSize.value = value; break;
      case 'lineAlpha': uniforms.uOpacity.value = value; break;
      case 'amplitude': uniforms.uAmp.value = calm ? 0 : value; break;
      case 'fog':       uniforms.uFog.value = value; break;
      case 'shape':     uniforms.uShape.value = value; break;
      case 'sectionScroll': applyRigHeight(); break;
      case 'hue':       applyColors(); break;
      default: break;
    }
    if (REBUILD_KEYS.has(key)) rebuild();
  }

  // Restores the ACTIVE preset, not Aurora's numbers — resetting while Signal
  // is selected should give you Signal's intended look, not a cube wearing
  // Aurora's settings.
  function reset() {
    const base = { ...DEFAULTS, ...(SCENES[index].params || {}) };
    Object.keys(base).forEach(k => setParam(k, base[k]));
    spinAccum = 0;
    rx = REST_X; ry = REST_Y;
    return { ...params };
  }

  // ── Teardown ─────────────────────────────────────────────────────────────
  function destroy() {
    renderer.setAnimationLoop(null);
    ro.disconnect();
    vis.disconnect();
    removeEventListener('resize', measure);
    viewport.removeEventListener('pointerdown', onPointerDown);
    viewport.removeEventListener('pointermove', onPointerMove);
    viewport.removeEventListener('pointerup', onPointerUp);
    viewport.removeEventListener('pointercancel', onPointerUp);
    disposeMeshes();
    renderer.dispose();
  }

  return {
    next: () => setScene(index + 1),
    prev: () => setScene(index - 1),
    go: (i) => setScene(i),
    setParam,
    reset,
    params,
    scenes: SCENES,
    scrollToDepth: (t) => {
      if (!rig) return;
      scrollTo({ top: rigTop + rigRange * clamp(t, 0, 1), behavior: calm ? 'auto' : 'smooth' });
    },
    stats: () => ({
      segments: lattice.segCount,
      nodes: lattice.nodeCount,
      shells: lattice.shellCount,
      perShell: lattice.perShell,
      calls: renderer.info.render.calls,
      frame: renderer.info.render.frame, // static while the loop is parked
      // Must stay flat across rebuilds — proves disposeMeshes() is freeing
      // the old buffers rather than orphaning them on the GPU.
      geometries: renderer.info.memory.geometries,
      programs: renderer.info.programs?.length ?? 0,
      depth: +depthCurrent.toFixed(3),
      target: { rx: +rx.toFixed(1), ry: +ry.toFixed(1) },
      pose: { rx: +cx.toFixed(1), ry: +cy.toFixed(1) },
    }),
    destroy,
  };
}

export { SCENES, calm };
