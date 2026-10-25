import * as THREE from 'three';

type ExplodeCategory = 'exterior' | 'chassis_sub' | 'cooling' | 'engine_lift' | 'engine_parts';

interface ExplodablePart {
  obj: THREE.Object3D;
  basePos: THREE.Vector3;
  baseRot: THREE.Euler;
  offset: THREE.Vector3;
  rotOffset: THREE.Euler;
  category: ExplodeCategory;
  progress: number;
  drawGuideLine: boolean;
}

interface SpinningPart {
  obj: THREE.Object3D;
  axis: 'x' | 'y' | 'z';
  speed: number;
}

interface GraphiteMatOptions {
  paperHex?: number;
  graphiteHex?: number;
  accentHex?: number;
  accentStrength?: number;
  shadeFloor?: number;
  toneBias?: number;
  hatchScale?: number;
  glassMode?: number;
  opacity?: number;
}

type Profile = [number, number][];
type PatchFilter = (pt: THREE.Vector3, z: number, v: number, tz: number, tv: number, side: number) => THREE.Vector3;

export interface PorscheScrollState {
  exteriorProgress: number;
  chassisSubProgress: number;
  coolingProgress: number;
  engineLiftProgress: number;
  enginePartsProgress: number;
  camAngle: number;
  camHeight: number;
  camRadius: number;
  lookX: number;
  lookY: number;
  lookZ: number;
}

export const createInitialScrollState = (): PorscheScrollState => ({
  exteriorProgress: 0,
  chassisSubProgress: 0,
  coolingProgress: 0,
  engineLiftProgress: 0,
  enginePartsProgress: 0,
  // Front three-quarter view: camera ahead of the car (+z) and off to its right side (+x).
  camAngle: 0.6,
  camHeight: 1.3,
  camRadius: 6.9,
  lookX: 0,
  lookY: 0.52,
  lookZ: 0.15,
});

export interface PorscheScene {
  scrollState: PorscheScrollState;
  setSize: (width: number, height: number) => void;
  setPointer: (x: number, y: number) => void;
  orbitBy: (dx: number, dy: number) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
}

const BASE_FOV = 32;
// The original fills a desktop viewport; narrower containers widen the vertical FOV so the
// same horizontal framing (and therefore the same composition) is preserved.
const REFERENCE_ASPECT = 16 / 9;
const FRAME_MS = 1000 / 60;

export interface PorscheSceneOptions {
  /** Camera zoom multiplier; >1 enlarges the car. */
  zoom?: number;
  /** Horizontal screen position of the scene centre, 0 (left edge) to 1 (right edge). */
  centerX?: number;
}

const graphiteVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const graphiteFragmentShader = `
  uniform vec3 uPaperColor;
  uniform vec3 uGraphiteColor;
  uniform vec3 uAccentColor;
  uniform float uAccentStrength;
  uniform float uShadeFloor;
  uniform float uToneBias;
  uniform float uHatchScale;
  uniform float uGlassMode;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 34.5);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float pencilStroke(vec2 p, float angle, float freq, float width) {
    float s = sin(angle);
    float c = cos(angle);
    vec2 rot = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    float tremor = noise(rot * 0.14) * 1.45;
    float wave = abs(sin((rot.x + tremor) * freq));
    float leadGrain = noise(p * 2.2) * 0.28 + 0.72;
    return smoothstep(width, width + 0.28, wave) * leadGrain;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 WN = normalize(vWorldNormal);
    vec3 V = normalize(vViewPos);
    if (dot(N, V) < 0.0) {
      N = -N;
      WN = -WN;
    }

    vec3 L_top   = normalize(vec3(0.25, 0.92, 0.28));
    vec3 L_front = normalize(vec3(0.45, 0.40, 0.78));
    vec3 L_back  = normalize(vec3(-0.55, 0.45, -0.70));

    float dTop   = max(dot(WN, L_top), 0.0);
    float dFront = max(dot(WN, L_front), 0.0) * 0.55;
    float dBack  = max(dot(WN, L_back), 0.0) * 0.45;

    float sideFlankBand = 0.75 + 0.25 * cos((vWorldPos.y - 0.54) * 9.5);
    float topBrightness = smoothstep(0.15, 0.75, abs(WN.y)) * 0.28;
    float spec = pow(max(dot(N, normalize(L_top + V)), 0.0), 24.0) * 0.45;

    float ndotv = abs(dot(N, V));
    float silhouetteInk = pow(1.0 - ndotv, 3.6) * 0.48;

    float rawLum = (dTop * 0.68 + dFront + dBack + 0.34) * sideFlankBand + topBrightness + spec;
    float lum = clamp(rawLum - silhouetteInk - uToneBias, 0.0, 1.0);

    vec2 screenP = gl_FragCoord.xy * 0.23 * uHatchScale;
    vec2 worldP = (vWorldPos.zy * 1.15 + vWorldPos.xy * 0.85) * 15.0 * uHatchScale;
    vec2 strokeCoord = mix(screenP, worldP, 0.40);

    float h2H = pencilStroke(strokeCoord, 0.58, 1.10, 0.32);
    float hHB = pencilStroke(strokeCoord, -0.58, 1.18, 0.38);
    float h2B = pencilStroke(strokeCoord, 0.15, 1.35, 0.44);
    float h6B = pencilStroke(strokeCoord, 1.38, 1.60, 0.54);

    float hatchMask = 1.0;

    if (lum < 0.84) {
      float w = smoothstep(0.84, 0.50, lum);
      hatchMask = mix(1.0, h2H, w * 0.48);
    }
    if (lum < 0.54) {
      float w = smoothstep(0.54, 0.25, lum);
      hatchMask = min(hatchMask, mix(1.0, hHB, w * 0.62));
    }
    if (lum < 0.30) {
      float w = smoothstep(0.30, 0.05, lum);
      hatchMask = min(hatchMask, mix(1.0, h2B, w * 0.78));
    }
    if (lum < 0.16) {
      float w = smoothstep(0.16, 0.0, lum);
      hatchMask = min(hatchMask, mix(1.0, h6B * 0.45, w));
    }

    if (uGlassMode > 0.5 && uGlassMode < 1.5) {
      float glassStreak = smoothstep(0.62, 0.96, sin((vWorldPos.x * 4.2 + vWorldPos.z * 3.1 + vWorldPos.y * 5.2) * 2.8));
      float rimSheen = pow(1.0 - ndotv, 2.4) * 0.18;
      lum = clamp(0.15 + spec * 0.55 + glassStreak * 0.22 + rimSheen, 0.12, 0.54);
      hatchMask = mix(hatchMask, h2B * hHB, 0.55);
    }
    else if (uGlassMode >= 1.5) {
      float glassStreak = smoothstep(0.45, 0.85, sin((vWorldPos.x * 5.5 + vWorldPos.z * 3.8 + vWorldPos.y * 4.0) * 3.2));
      lum = clamp(lum + glassStreak * 0.32, 0.65, 0.96);
    }

    float paperGrain = (noise(gl_FragCoord.xy * 0.65) - 0.5) * 0.06;
    float smoothShade = smoothstep(0.0, 0.90, lum);
    float finalShade = clamp(mix(smoothShade, hatchMask, 0.50) + paperGrain, uShadeFloor, 1.0);

    vec3 baseSketch = mix(uGraphiteColor, uPaperColor, finalShade);
    vec3 finalColor = mix(baseSketch, uAccentColor * (0.45 + 0.55 * finalShade), uAccentStrength);

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function evalProfileSpline(z: number, controlPoints: Profile) {
  if (z <= controlPoints[0][0]) return controlPoints[0][1];
  const n = controlPoints.length;
  if (z >= controlPoints[n - 1][0]) return controlPoints[n - 1][1];
  for (let i = 0; i < n - 1; i++) {
    const z0 = controlPoints[i][0];
    const z1 = controlPoints[i + 1][0];
    if (z >= z0 && z <= z1) {
      const t = (z - z0) / (z1 - z0);
      const p0 = controlPoints[Math.max(0, i - 1)][1];
      const p1 = controlPoints[i][1];
      const p2 = controlPoints[i + 1][1];
      const p3 = controlPoints[Math.min(n - 1, i + 2)][1];
      const t2 = t * t;
      const t3 = t2 * t;
      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }
  }
  return controlPoints[n - 1][1];
}

const centerTopProfile: Profile = [
  [-2.25, 0.46],
  [-2.18, 0.68],
  [-2.04, 0.79],
  [-1.65, 0.93],
  [-1.30, 1.045],
  [-1.08, 1.115],
  [-0.82, 1.185],
  [-0.52, 1.245],
  [-0.22, 1.282],
  [ 0.06, 1.292],
  [ 0.25, 1.276],
  [ 0.40, 1.235],
  [ 0.53, 1.155],
  [ 0.66, 1.045],
  [ 0.78, 0.925],
  [ 0.88, 0.835],
  [ 1.28, 0.768],
  [ 1.68, 0.665],
  [ 2.06, 0.512],
  [ 2.18, 0.420],
  [ 2.25, 0.305],
];

const shoulderHeightProfile: Profile = [
  [-2.25, 0.44],
  [-2.12, 0.71],
  [-1.75, 0.83],
  [-1.35, 0.885],
  [-1.13, 0.89],
  [-0.82, 0.875],
  [-0.50, 0.86],
  [-0.18, 0.848],
  [ 0.15, 0.84],
  [ 0.52, 0.838],
  [ 0.88, 0.835],
  [ 1.32, 0.825],
  [ 1.68, 0.752],
  [ 1.90, 0.652],
  [ 2.06, 0.535],
  [ 2.20, 0.395],
  [ 2.25, 0.285],
];

const lowerSillProfile: Profile = [
  [-2.25, 0.32],
  [-2.15, 0.20],
  [-1.65, 0.17],
  [-1.13, 0.16],
  [ 0.00, 0.145],
  [ 1.32, 0.15],
  [ 1.90, 0.15],
  [ 2.20, 0.145],
  [ 2.25, 0.26],
];

const halfWidthProfile: Profile = [
  [-2.25, 0.44],
  [-2.16, 0.74],
  [-1.92, 0.88],
  [-1.35, 0.955],
  [-1.00, 0.95],
  [-0.45, 0.87],
  [ 0.20, 0.855],
  [ 0.85, 0.885],
  [ 1.32, 0.905],
  [ 1.75, 0.875],
  [ 2.02, 0.790],
  [ 2.16, 0.640],
  [ 2.22, 0.460],
  [ 2.25, 0.240],
];

const cabinAndHoodWidthProfile: Profile = [
  [-2.25, 0.32],
  [-1.95, 0.46],
  [-1.20, 0.52],
  [-0.45, 0.57],
  [ 0.15, 0.61],
  [ 0.88, 0.565],
  [ 1.28, 0.502],
  [ 1.68, 0.440],
  [ 1.95, 0.392],
  [ 2.06, 0.360],
  [ 2.18, 0.300],
  [ 2.25, 0.220],
];

const ARCH_WHEELS = [
  { wz: 1.32, wy: 0.34, rArch: 0.395 },
  { wz: -1.13, wy: 0.35, rArch: 0.410 },
];

function evalPorsche911Point(z: number, v: number, side = 1) {
  const yCenter = evalProfileSpline(z, centerTopProfile);
  const yShoulder = evalProfileSpline(z, shoulderHeightProfile);
  const yBottom = evalProfileSpline(z, lowerSillProfile);
  const xMax = evalProfileSpline(z, halfWidthProfile);
  const xSeam = evalProfileSpline(z, cabinAndHoodWidthProfile);

  const frontHoodFactor = smoothstep(0.84, 1.05, z);
  const ySeamCabin = yShoulder + (yCenter - yShoulder) * 0.36;
  const ySeamHood = yCenter - 0.008;
  const ySeam = ySeamCabin * (1 - frontHoodFactor) + ySeamHood * frontHoodFactor;

  let x = 0;
  let y = 0;

  if (v <= 0.48) {
    const t = v / 0.48;
    const angle = t * (Math.PI * 0.5);
    const doorSculpt = (z > -0.6 && z < 0.85) ? Math.sin(t * Math.PI) * 0.025 : 0;
    x = xMax * (0.86 + 0.14 * Math.sin(angle)) - doorSculpt;
    y = yBottom + (yShoulder - yBottom) * Math.pow(t, 0.88);

    for (let w = 0; w < ARCH_WHEELS.length; w++) {
      const wheel = ARCH_WHEELS[w];
      const dz = z - wheel.wz;
      const dy = y - wheel.wy;
      const dist = Math.sqrt(dz * dz + Math.max(0, dy) * Math.max(0, dy));
      if (Math.abs(dz) < wheel.rArch * 1.15 && y < wheel.wy + wheel.rArch * 1.08) {
        const archNormalized = Math.min(1, Math.abs(dz) / wheel.rArch);
        const archTopY = wheel.wy + Math.sqrt(Math.max(0.001, 1 - archNormalized * archNormalized)) * wheel.rArch;
        if (y < archTopY) {
          const liftFactor = Math.pow(1 - t, 0.65);
          y = Math.max(y, archTopY - (1 - liftFactor) * 0.02);
        }
        const lipProximity = Math.exp(-Math.pow((dist - wheel.rArch) / 0.075, 2));
        x += lipProximity * 0.024;
      }
    }
  } else if (v <= 0.68) {
    const u = (v - 0.48) / 0.20;
    x = xMax * (1 - u) + xSeam * u;

    const torpedoFactor = smoothstep(0.88, 1.25, z) * (1 - smoothstep(1.95, 2.15, z));
    const torpedoArch = Math.sin(u * Math.PI) * (0.014 + 0.028 * torpedoFactor);
    y = yShoulder * (1 - u) + ySeam * u + torpedoArch;
  } else {
    const w = (v - 0.68) / 0.32;
    x = xSeam * (1 - w);

    if (frontHoodFactor > 0.001) {
      const crownProfile = Math.sin(w * Math.PI * 0.5);
      y = ySeam + (yCenter - ySeam) * crownProfile;
    } else {
      const arch = Math.sin(w * Math.PI * 0.5);
      y = ySeam + (yCenter - ySeam) * Math.pow(arch, 0.85);
    }
  }

  return new THREE.Vector3(side * x, y, z);
}

function evalFenderSurfaceAndNormal(z: number, u: number, side = 1) {
  const v = 0.46 + u * 0.20;
  const p = evalPorsche911Point(z, v, side);
  const dz = 0.015;
  const dv = 0.015;
  const pz = evalPorsche911Point(z + dz, v, side).sub(p);
  const pv = evalPorsche911Point(z, v + dv, side).sub(p);
  const normal = new THREE.Vector3().crossVectors(pz, pv).normalize();
  if (normal.y < 0) normal.negate();
  return { point: p, normal };
}

function ensureOutwardNormals(geometry: THREE.BufferGeometry) {
  geometry.computeVertexNormals();
  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const nx = norm.getX(i);
    const ny = norm.getY(i);
    const nz = norm.getZ(i);

    const outX = px;
    const outY = py - 0.30;
    if (nx * outX + ny * outY < 0) {
      norm.setXYZ(i, -nx, -ny, -nz);
    }
  }
  norm.needsUpdate = true;
}

function buildRingStripGeometry(positions: number[], rings: number, segs: number) {
  const stride = segs + 1;
  const indices: number[] = [];
  for (let ir = 0; ir < rings; ir++) {
    for (let is = 0; is < segs; is++) {
      const a = ir * stride + is;
      const b = (ir + 1) * stride + is;
      const c = (ir + 1) * stride + (is + 1);
      const d = ir * stride + (is + 1);
      indices.push(a, d, b, b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  ensureOutwardNormals(geo);
  return geo;
}

export function createPorscheScene(
  canvas: HTMLCanvasElement,
  { zoom = 1, centerX = 0.5 }: PorscheSceneOptions = {},
): PorscheScene {
  // ==========================================================================
  // 1. SCENE, CAMERA & RENDERER
  // ==========================================================================
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xffffff, 0.012);

  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 180);
  camera.zoom = zoom;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // ==========================================================================
  // 2. GRAPHITE PENCIL MATERIALS
  // ==========================================================================
  function createGraphiteMat(options: GraphiteMatOptions = {}) {
    return new THREE.ShaderMaterial({
      vertexShader: graphiteVertexShader,
      fragmentShader: graphiteFragmentShader,
      uniforms: {
        uPaperColor: { value: new THREE.Color(options.paperHex ?? 0xf9f7f1) },
        uGraphiteColor: { value: new THREE.Color(options.graphiteHex ?? 0x22201c) },
        uAccentColor: { value: new THREE.Color(options.accentHex ?? 0x22201c) },
        uAccentStrength: { value: options.accentStrength ?? 0.0 },
        uShadeFloor: { value: options.shadeFloor ?? 0.52 },
        uToneBias: { value: options.toneBias ?? 0.0 },
        uHatchScale: { value: options.hatchScale ?? 1.0 },
        uGlassMode: { value: options.glassMode ?? 0.0 },
        uOpacity: { value: options.opacity ?? 1.0 },
      },
      transparent: (options.opacity ?? 1.0) < 1.0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  }

  const matPorscheBody = createGraphiteMat({ toneBias: -0.06, shadeFloor: 0.58, hatchScale: 0.92 });

  const matPorscheGlass = createGraphiteMat({
    graphiteHex: 0x141518,
    accentHex: 0x1e222a,
    accentStrength: 0.34,
    toneBias: 0.56,
    shadeFloor: 0.14,
    hatchScale: 1.25,
    glassMode: 1.0,
    opacity: 0.93,
  });

  const matHeadlightGlass = createGraphiteMat({
    toneBias: -0.10,
    shadeFloor: 0.72,
    hatchScale: 1.0,
    glassMode: 2.0,
    opacity: 0.42,
  });

  const matMachinedAlloy = createGraphiteMat({ toneBias: 0.06, shadeFloor: 0.45, hatchScale: 1.05 });
  const matDarkCharcoal = createGraphiteMat({ toneBias: 0.42, shadeFloor: 0.22, hatchScale: 1.30 });

  const matYellowCaliper = createGraphiteMat({
    toneBias: -0.04,
    shadeFloor: 0.55,
    hatchScale: 1.05,
    accentHex: 0xdfb722,
    accentStrength: 0.72,
  });

  const matRedTaillight = createGraphiteMat({
    toneBias: 0.08,
    shadeFloor: 0.45,
    hatchScale: 1.05,
    accentHex: 0xc22b22,
    accentStrength: 0.66,
  });

  const lineDarkMat = new THREE.LineBasicMaterial({ color: 0x171613, transparent: true, opacity: 0.92 });
  const lineMidMat = new THREE.LineBasicMaterial({ color: 0x36332c, transparent: true, opacity: 0.62 });
  const lineLightMat = new THREE.LineBasicMaterial({ color: 0x666257, transparent: true, opacity: 0.36 });

  function createSketchMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material = matPorscheBody,
    edgeAngle = 15,
    addFineWire = false,
  ) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, material));
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, edgeAngle), lineDarkMat));
    if (addFineWire) {
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 4), lineLightMat));
    }
    return group;
  }

  function createPencilCurveLine(points: THREE.Vector3[], closed = false, mat: THREE.Material = lineDarkMat) {
    const curve = new THREE.CatmullRomCurve3(points, closed);
    const pts = curve.getPoints(points.length * 8);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, mat);
  }

  // ==========================================================================
  // 3. DRAFTING FLOOR & TURNTABLE DATUM RINGS
  // ==========================================================================
  const floorGroup = new THREE.Group();
  floorGroup.position.y = 0.0;
  masterGroup.add(floorGroup);

  const gridHelper = new THREE.GridHelper(32, 32, 0x78746a, 0xc9c4b8);
  const gridMaterial = gridHelper.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.34;
  floorGroup.add(gridHelper);

  const shadowGeo = new THREE.PlaneGeometry(2.30, 4.90, 20, 20);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = createGraphiteMat({ toneBias: 0.45, shadeFloor: 0.32, hatchScale: 1.5, opacity: 0.32 });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.set(0, 0.004, 0.02);
  floorGroup.add(contactShadow);

  [2.8, 3.8, 5.4, 8.2].forEach((r, idx) => {
    const ringGeo = new THREE.RingGeometry(r, r + 0.018, 96);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b3831,
      transparent: true,
      opacity: idx % 2 === 0 ? 0.30 : 0.14,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.006;
    floorGroup.add(ring);
  });

  // ==========================================================================
  // 4. EXPLODED PART REGISTRY
  // ==========================================================================
  const explodableParts: ExplodablePart[] = [];
  const spinningParts: SpinningPart[] = [];

  function registerExplodable(
    obj: THREE.Object3D,
    offset: THREE.Vector3,
    rotOffset: THREE.Euler,
    category: ExplodeCategory,
    drawGuideLine = true,
  ) {
    explodableParts.push({
      obj,
      basePos: obj.position.clone(),
      baseRot: obj.rotation.clone(),
      offset,
      rotOffset,
      category,
      progress: 0,
      drawGuideLine,
    });
  }

  const carRoot = new THREE.Group();
  masterGroup.add(carRoot);

  // ==========================================================================
  // 5. PARAMETRIC SURFACE PATCHES
  // ==========================================================================
  const HL_Z_CENTER = 1.845;
  const HL_U_CENTER = 0.40;
  const HL_Z_RADIUS = 0.182;
  const HL_U_RADIUS = 0.34;

  function buildLoftedPorschePatch(
    zMin: number,
    zMax: number,
    vMin: number,
    vMax: number,
    zSteps: number,
    vSteps: number,
    side = 1,
    customFilter: PatchFilter | null = null,
  ) {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iz = 0; iz <= zSteps; iz++) {
      const tz = iz / zSteps;
      const z = zMin + (zMax - zMin) * tz;
      for (let iv = 0; iv <= vSteps; iv++) {
        const tv = iv / vSteps;
        const v = vMin + (vMax - vMin) * tv;
        let pt = evalPorsche911Point(z, v, side);
        if (customFilter) pt = customFilter(pt, z, v, tz, tv, side);
        positions.push(pt.x, pt.y, pt.z);
        uvs.push(tz, tv);
      }
    }

    const stride = vSteps + 1;
    for (let iz = 0; iz < zSteps; iz++) {
      for (let iv = 0; iv < vSteps; iv++) {
        const a = iz * stride + iv;
        const b = (iz + 1) * stride + iv;
        const c = (iz + 1) * stride + (iv + 1);
        const d = iz * stride + (iv + 1);
        if (side > 0) {
          indices.push(a, d, b);
          indices.push(b, d, c);
        } else {
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    ensureOutwardNormals(geo);
    return geo;
  }

  function buildPatchBoundaryLine(
    zMin: number,
    zMax: number,
    vMin: number,
    vMax: number,
    steps: number,
    side = 1,
    mat: THREE.Material = lineDarkMat,
  ) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) pts.push(evalPorsche911Point(zMin + (zMax - zMin) * (i / steps), vMin, side));
    for (let i = 1; i <= steps; i++) pts.push(evalPorsche911Point(zMax, vMin + (vMax - vMin) * (i / steps), side));
    for (let i = 1; i <= steps; i++) pts.push(evalPorsche911Point(zMax - (zMax - zMin) * (i / steps), vMax, side));
    for (let i = 1; i < steps; i++) pts.push(evalPorsche911Point(zMin, vMax - (vMax - vMin) * (i / steps), side));
    return createPencilCurveLine(pts, true, mat);
  }

  // ==========================================================================
  // 6A. FRONT HOOD
  // ==========================================================================
  const hoodGroup = new THREE.Group();
  carRoot.add(hoodGroup);

  function evalSmoothHoodSurface(tz: number, u: number) {
    const absU = Math.abs(u);
    const side = u >= 0 ? 1 : -1;
    const frontCornerZone = smoothstep(0.80, 1.0, tz) * smoothstep(0.55, 1.0, absU);
    const zPullback = frontCornerZone * 0.055;
    const rearCowlCurve = (1.0 - smoothstep(0.0, 0.15, tz)) * (absU * absU) * 0.022;
    const z = 0.88 + (2.06 - 0.88) * tz - zPullback + rearCowlCurve;
    const v = 1.0 - absU * 0.32;
    return evalPorsche911Point(z, v, side);
  }

  {
    const hoodZSteps = 30;
    const hoodUSteps = 28;
    const hoodPositions: number[] = [];
    const hoodUvs: number[] = [];
    const hoodIndices: number[] = [];

    for (let iz = 0; iz <= hoodZSteps; iz++) {
      const tz = iz / hoodZSteps;
      for (let iu = 0; iu <= hoodUSteps; iu++) {
        const tu = iu / hoodUSteps;
        const u = -1.0 + 2.0 * tu;
        const pt = evalSmoothHoodSurface(tz, u);
        hoodPositions.push(pt.x, pt.y, pt.z);
        hoodUvs.push(tz, tu);
      }
    }

    const hStride = hoodUSteps + 1;
    for (let iz = 0; iz < hoodZSteps; iz++) {
      for (let iu = 0; iu < hoodUSteps; iu++) {
        const a = iz * hStride + iu;
        const b = (iz + 1) * hStride + iu;
        const c = (iz + 1) * hStride + (iu + 1);
        const d = iz * hStride + (iu + 1);
        hoodIndices.push(a, d, b);
        hoodIndices.push(b, d, c);
      }
    }

    const unifiedHoodGeo = new THREE.BufferGeometry();
    unifiedHoodGeo.setAttribute('position', new THREE.Float32BufferAttribute(hoodPositions, 3));
    unifiedHoodGeo.setAttribute('uv', new THREE.Float32BufferAttribute(hoodUvs, 2));
    unifiedHoodGeo.setIndex(hoodIndices);
    ensureOutwardNormals(unifiedHoodGeo);
    hoodGroup.add(new THREE.Mesh(unifiedHoodGeo, matPorscheBody));
  }

  [0.002, 0.004].forEach((yLift, idx) => {
    const hoodPerimeterPts: THREE.Vector3[] = [];
    const scaleU = idx === 0 ? 1.0 : 0.985;
    for (let i = 0; i <= 28; i++) {
      const pt = evalSmoothHoodSurface(i / 28, scaleU);
      pt.y += yLift;
      hoodPerimeterPts.push(pt);
    }
    for (let i = 1; i <= 20; i++) {
      const u = scaleU * (1.0 - 2.0 * (i / 20));
      const pt = evalSmoothHoodSurface(1.0, u);
      pt.y += yLift;
      hoodPerimeterPts.push(pt);
    }
    for (let i = 27; i >= 0; i--) {
      const pt = evalSmoothHoodSurface(i / 28, -scaleU);
      pt.y += yLift;
      hoodPerimeterPts.push(pt);
    }
    for (let i = 1; i < 20; i++) {
      const u = scaleU * (-1.0 + 2.0 * (i / 20));
      const pt = evalSmoothHoodSurface(0.0, u);
      pt.y += yLift;
      hoodPerimeterPts.push(pt);
    }
    hoodGroup.add(createPencilCurveLine(hoodPerimeterPts, true, idx === 0 ? lineDarkMat : lineMidMat));
  });

  [-0.78, 0.78].forEach((uLine) => {
    const linePts: THREE.Vector3[] = [];
    for (let i = 2; i <= 25; i++) {
      const pt = evalSmoothHoodSurface(i / 28, uLine);
      pt.y += 0.002;
      linePts.push(pt);
    }
    hoodGroup.add(createPencilCurveLine(linePts, false, lineMidMat));
  });

  {
    const crestPt = evalSmoothHoodSurface(0.93, 0.0);
    const crestGroup = new THREE.Group();
    crestGroup.position.set(0, crestPt.y + 0.004, crestPt.z);
    crestGroup.rotation.x = 0.30;
    crestGroup.add(createSketchMesh(new THREE.BoxGeometry(0.048, 0.006, 0.060), matYellowCaliper));
    crestGroup.add(createSketchMesh(new THREE.BoxGeometry(0.018, 0.008, 0.045), matRedTaillight));
    hoodGroup.add(crestGroup);
  }

  [-0.22, 0.22].forEach((wx) => {
    const wiperPt = evalSmoothHoodSurface(0.02, wx);
    const wiperBlade = createSketchMesh(new THREE.BoxGeometry(0.42, 0.012, 0.018), matDarkCharcoal);
    wiperBlade.position.set(wiperPt.x + 0.08, wiperPt.y + 0.008, wiperPt.z - 0.01);
    wiperBlade.rotation.y = 0.12;
    hoodGroup.add(wiperBlade);
  });

  registerExplodable(hoodGroup, new THREE.Vector3(0, 1.48, 0.82), new THREE.Euler(-0.34, 0, 0), 'exterior');

  // ==========================================================================
  // 6B. FRONT FENDERS & OVAL HEADLIGHTS
  // ==========================================================================
  [-1, 1].forEach((side) => {
    const frontFenderGroup = new THREE.Group();
    carRoot.add(frontFenderGroup);

    const fenderGeo = buildLoftedPorschePatch(0.80, 2.06, 0.0, 0.68, 32, 20, side);
    frontFenderGroup.add(new THREE.Mesh(fenderGeo, matPorscheBody));
    frontFenderGroup.add(buildPatchBoundaryLine(0.80, 2.06, 0.0, 0.68, 22, side, lineDarkMat));

    const markerPt = evalPorsche911Point(1.89, 0.31, side);
    const sideMarker = createSketchMesh(new THREE.BoxGeometry(0.018, 0.022, 0.13), matHeadlightGlass);
    sideMarker.position.set(markerPt.x + side * 0.005, markerPt.y, markerPt.z);
    sideMarker.rotation.y = -side * 0.18;
    frontFenderGroup.add(sideMarker);

    if (side === -1) {
      const capPt = evalPorsche911Point(1.18, 0.54, -1);
      const fuelCap = createSketchMesh(new THREE.CylinderGeometry(0.066, 0.066, 0.008, 24), matPorscheBody);
      fuelCap.position.copy(capPt);
      fuelCap.rotation.z = -0.58;
      frontFenderGroup.add(fuelCap);
    }

    registerExplodable(
      frontFenderGroup,
      new THREE.Vector3(side * 1.38, 0.35, 0.45),
      new THREE.Euler(0, side * 0.14, -side * 0.08),
      'exterior',
    );

    const headlightGroup = new THREE.Group();
    carRoot.add(headlightGroup);

    const hlOrigin = evalFenderSurfaceAndNormal(HL_Z_CENTER, HL_U_CENTER, side).point.clone();
    headlightGroup.position.copy(hlOrigin);

    const evalHeadlightPointLocal = (rNorm: number, theta: number, liftOffset = 0.0) => {
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const z = HL_Z_CENTER + cosT * HL_Z_RADIUS * rNorm;
      const u = HL_U_CENTER + (sinT * HL_U_RADIUS * rNorm) + (z - HL_Z_CENTER) * 0.18;
      const surf = evalFenderSurfaceAndNormal(z, u, side);
      return surf.point.clone().sub(hlOrigin).addScaledVector(surf.normal, liftOffset);
    };

    const bucketSegs = 32;

    const bucketRings = 6;
    const bucketPos: number[] = [];
    for (let ir = 0; ir <= bucketRings; ir++) {
      const rNorm = (ir / bucketRings) * 0.94;
      for (let is = 0; is <= bucketSegs; is++) {
        const pt = evalHeadlightPointLocal(rNorm, (is / bucketSegs) * Math.PI * 2, 0.004);
        bucketPos.push(pt.x, pt.y, pt.z);
      }
    }
    headlightGroup.add(new THREE.Mesh(buildRingStripGeometry(bucketPos, bucketRings, bucketSegs), matMachinedAlloy));

    const bezelRings = 3;
    const bezelPos: number[] = [];
    for (let ir = 0; ir <= bezelRings; ir++) {
      const rNorm = 0.85 + (ir / bezelRings) * 0.17;
      const archLift = Math.sin((ir / bezelRings) * Math.PI) * 0.010 + 0.004;
      for (let is = 0; is <= bucketSegs; is++) {
        const pt = evalHeadlightPointLocal(rNorm, (is / bucketSegs) * Math.PI * 2, archLift);
        bezelPos.push(pt.x, pt.y, pt.z);
      }
    }
    headlightGroup.add(new THREE.Mesh(buildRingStripGeometry(bezelPos, bezelRings, bucketSegs), matPorscheBody));

    [0.85, 0.93, 1.02].forEach((rRing, idx) => {
      const ringPts: THREE.Vector3[] = [];
      for (let is = 0; is <= 36; is++) {
        ringPts.push(evalHeadlightPointLocal(rRing, (is / 36) * Math.PI * 2, 0.009));
      }
      headlightGroup.add(createPencilCurveLine(ringPts, true, idx === 1 ? lineMidMat : lineDarkMat));
    });

    const projectorUnit = new THREE.Group();
    projectorUnit.position.set(0, 0.015, -0.01);

    const shroudCyl = createSketchMesh(new THREE.CylinderGeometry(0.058, 0.070, 0.075, 24), matPorscheBody);
    shroudCyl.rotation.x = Math.PI / 2;
    shroudCyl.rotation.z = -side * 0.12;
    projectorUnit.add(shroudCyl);

    const shroudRim = createSketchMesh(new THREE.TorusGeometry(0.058, 0.010, 10, 24), matPorscheBody);
    shroudRim.position.z = 0.036;
    projectorUnit.add(shroudRim);

    const xenonEye = createSketchMesh(new THREE.SphereGeometry(0.045, 20, 16), matPorscheBody);
    xenonEye.position.z = 0.028;
    projectorUnit.add(xenonEye);

    const auxRing = createSketchMesh(new THREE.TorusGeometry(0.034, 0.006, 8, 20), matPorscheBody);
    auxRing.position.set(side * 0.012, -0.022, 0.068);
    auxRing.rotation.x = 0.45;
    projectorUnit.add(auxRing);

    [
      [-0.042, 0.026, 0.035],
      [0.042, 0.026, 0.035],
      [-0.042, -0.022, 0.052],
      [0.042, -0.022, 0.052],
    ].forEach(([lx, ly, lz]) => {
      const ledDot = createSketchMesh(new THREE.CylinderGeometry(0.009, 0.009, 0.018, 10), matPorscheBody);
      ledDot.rotation.x = Math.PI / 2;
      ledDot.position.set(lx, ly, lz);
      projectorUnit.add(ledDot);
    });

    headlightGroup.add(projectorUnit);

    const lensRings = 7;
    const lensPos: number[] = [];
    for (let ir = 0; ir <= lensRings; ir++) {
      const rNorm = (ir / lensRings) * 0.92;
      const domeHeight = Math.cos(rNorm * Math.PI * 0.5) * 0.030 + 0.006;
      for (let is = 0; is <= bucketSegs; is++) {
        const pt = evalHeadlightPointLocal(rNorm, (is / bucketSegs) * Math.PI * 2, domeHeight);
        lensPos.push(pt.x, pt.y, pt.z);
      }
    }
    headlightGroup.add(new THREE.Mesh(buildRingStripGeometry(lensPos, lensRings, bucketSegs), matHeadlightGlass));

    registerExplodable(
      headlightGroup,
      new THREE.Vector3(side * 1.45, 0.88, 1.25),
      new THREE.Euler(0.16, side * 0.22, 0),
      'exterior',
    );
  });

  // ==========================================================================
  // 6C. FRONT BUMPER, INTAKES, DRL STRIPS & LICENSE PLATE
  // ==========================================================================
  const frontBumperGroup = new THREE.Group();
  carRoot.add(frontBumperGroup);

  [-1, 1].forEach((side) => {
    const bumperGeo = buildLoftedPorschePatch(2.01, 2.25, 0.0, 1.0, 18, 18, side, (pt, z, v) => {
      if (z > 2.13 && v > 0.07 && v < 0.38) {
        pt.z -= 0.048;
      }
      return pt;
    });
    frontBumperGroup.add(new THREE.Mesh(bumperGeo, matPorscheBody));
    frontBumperGroup.add(buildPatchBoundaryLine(2.01, 2.25, 0.0, 0.68, 14, side, lineDarkMat));

    const sideIntakeGroup = new THREE.Group();
    sideIntakeGroup.position.set(side * 0.49, 0.255, 2.165);
    sideIntakeGroup.rotation.y = -side * 0.26;

    sideIntakeGroup.add(createSketchMesh(new THREE.BoxGeometry(0.39, 0.125, 0.085), matDarkCharcoal));

    [-0.024, 0.022].forEach((vy) => {
      const vane = createSketchMesh(new THREE.BoxGeometry(0.37, 0.010, 0.095), matMachinedAlloy);
      vane.position.set(0, vy, 0.01);
      sideIntakeGroup.add(vane);
    });

    const drlCurvePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) - 0.5;
      const xLocal = u * 0.38;
      const yLocal = 0.072 - Math.pow(u * 1.7, 2) * 0.026;
      const zLocal = 0.045 - Math.abs(u) * 0.015;
      drlCurvePts.push(new THREE.Vector3(xLocal, yLocal, zLocal));
    }
    const drlTubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(drlCurvePts), 16, 0.012, 8, false);
    sideIntakeGroup.add(createSketchMesh(drlTubeGeo, matPorscheBody, 20));

    frontBumperGroup.add(sideIntakeGroup);
  });

  {
    const centerIntake = createSketchMesh(new THREE.BoxGeometry(0.54, 0.092, 0.08), matDarkCharcoal);
    centerIntake.position.set(0, 0.21, 2.20);
    frontBumperGroup.add(centerIntake);
  }

  [-1, 1].forEach((s) => {
    const intakePillar = createSketchMesh(new THREE.BoxGeometry(0.045, 0.12, 0.07), matPorscheBody);
    intakePillar.position.set(s * 0.27, 0.23, 2.205);
    intakePillar.rotation.z = s * 0.22;
    frontBumperGroup.add(intakePillar);
  });

  {
    const frontChinLip = createSketchMesh(new THREE.BoxGeometry(1.56, 0.024, 0.18), matDarkCharcoal);
    frontChinLip.position.set(0, 0.145, 2.14);
    frontBumperGroup.add(frontChinLip);

    const frontPlateHolder = createSketchMesh(new THREE.BoxGeometry(0.46, 0.095, 0.035), matPorscheBody);
    frontPlateHolder.position.set(0, 0.285, 2.24);
    frontBumperGroup.add(frontPlateHolder);

    const blueEuroBand = createSketchMesh(new THREE.BoxGeometry(0.045, 0.082, 0.04), matDarkCharcoal);
    blueEuroBand.position.set(-0.195, 0.285, 2.242);
    frontBumperGroup.add(blueEuroBand);
  }

  registerExplodable(frontBumperGroup, new THREE.Vector3(0, -0.15, 1.65), new THREE.Euler(0.08, 0, 0), 'exterior');

  // ==========================================================================
  // 6D. DOORS, HANDLES, MIRRORS & TINTED DOOR GLASS
  // ==========================================================================
  [-1, 1].forEach((side) => {
    const doorGroup = new THREE.Group();
    carRoot.add(doorGroup);

    const doorGeo = buildLoftedPorschePatch(-0.48, 0.80, 0.05, 0.48, 22, 14, side);
    doorGroup.add(new THREE.Mesh(doorGeo, matPorscheBody));
    doorGroup.add(buildPatchBoundaryLine(-0.48, 0.80, 0.05, 0.48, 16, side, lineDarkMat));

    const creasePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const z = -0.45 + 1.22 * (i / 14);
      const pt = evalPorsche911Point(z, 0.14, side);
      pt.x += side * 0.005;
      creasePts.push(pt);
    }
    doorGroup.add(createPencilCurveLine(creasePts, false, lineDarkMat));

    const handlePos = evalPorsche911Point(-0.18, 0.39, side);
    const doorHandle = createSketchMesh(new THREE.BoxGeometry(0.025, 0.038, 0.165), matMachinedAlloy);
    doorHandle.position.set(handlePos.x + side * 0.008, handlePos.y, handlePos.z);
    doorGroup.add(doorHandle);

    const mirrorPos = evalPorsche911Point(0.56, 0.46, side);
    const mirrorAssy = new THREE.Group();
    mirrorAssy.position.set(mirrorPos.x, mirrorPos.y + 0.02, mirrorPos.z);

    const stalk = createSketchMesh(new THREE.BoxGeometry(0.09, 0.04, 0.07), matDarkCharcoal);
    stalk.position.set(side * 0.04, 0.02, 0);
    stalk.rotation.z = side * 0.35;
    mirrorAssy.add(stalk);

    const housingGeo = new THREE.SphereGeometry(0.085, 16, 14);
    housingGeo.scale(1.35, 0.72, 0.95);
    const mirrorHousing = createSketchMesh(housingGeo, matPorscheBody);
    mirrorHousing.position.set(side * 0.11, 0.055, -0.02);
    mirrorHousing.rotation.y = -side * 0.22;
    mirrorAssy.add(mirrorHousing);

    doorGroup.add(mirrorAssy);

    const doorGlassGeo = buildLoftedPorschePatch(-0.42, 0.74, 0.48, 0.72, 16, 8, side);
    doorGroup.add(new THREE.Mesh(doorGlassGeo, matPorscheGlass));
    doorGroup.add(buildPatchBoundaryLine(-0.42, 0.74, 0.48, 0.72, 12, side, lineDarkMat));

    registerExplodable(
      doorGroup,
      new THREE.Vector3(side * 1.65, 0.25, 0.12),
      new THREE.Euler(0, -side * 0.28, 0),
      'exterior',
    );
  });

  // ==========================================================================
  // 6E. REAR QUARTER PANELS, ROCKERS & TEARDROP DLO WINDOWS
  // ==========================================================================
  [-1, 1].forEach((side) => {
    const rearQuarterGroup = new THREE.Group();
    carRoot.add(rearQuarterGroup);

    const quarterGeo = buildLoftedPorschePatch(-1.94, -0.48, 0.0, 0.68, 28, 16, side);
    rearQuarterGroup.add(new THREE.Mesh(quarterGeo, matPorscheBody));
    rearQuarterGroup.add(buildPatchBoundaryLine(-1.94, -0.48, 0.0, 0.68, 18, side, lineDarkMat));

    const rockerGeo = buildLoftedPorschePatch(-0.52, 0.82, 0.0, 0.06, 16, 4, side);
    rearQuarterGroup.add(new THREE.Mesh(rockerGeo, matDarkCharcoal));

    const qWindowGeo = buildLoftedPorschePatch(-1.14, -0.42, 0.48, 0.72, 14, 8, side, (pt, z, _v, tz) => {
      const taper = Math.pow(tz, 0.65);
      const midPt = evalPorsche911Point(z, 0.54, side);
      pt.lerp(midPt, 1 - taper);
      return pt;
    });
    rearQuarterGroup.add(new THREE.Mesh(qWindowGeo, matPorscheGlass));

    const dloPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const tz = i / 14;
      const z = -1.14 + 0.72 * tz;
      const taper = Math.pow(tz, 0.65);
      dloPts.push(evalPorsche911Point(z, 0.54 + (0.72 - 0.54) * taper, side));
    }
    for (let i = 14; i >= 0; i--) {
      const tz = i / 14;
      const z = -1.14 + 0.72 * tz;
      const taper = Math.pow(tz, 0.65);
      dloPts.push(evalPorsche911Point(z, 0.54 - (0.54 - 0.48) * taper, side));
    }
    rearQuarterGroup.add(createPencilCurveLine(dloPts, true, lineDarkMat));

    registerExplodable(
      rearQuarterGroup,
      new THREE.Vector3(side * 1.55, 0.42, -0.45),
      new THREE.Euler(0, -side * 0.14, -side * 0.08),
      'exterior',
    );
  });

  // ==========================================================================
  // 6F. WINDSHIELD, FASTBACK ROOF & REAR GLASS
  // ==========================================================================
  const roofCanopyGroup = new THREE.Group();
  carRoot.add(roofCanopyGroup);

  [-1, 1].forEach((side) => {
    const windshieldGeo = buildLoftedPorschePatch(0.40, 0.88, 0.68, 1.0, 20, 14, side);
    roofCanopyGroup.add(new THREE.Mesh(windshieldGeo, matPorscheGlass));
    roofCanopyGroup.add(buildPatchBoundaryLine(0.40, 0.88, 0.68, 1.0, 16, side, lineDarkMat));

    const roofGeo = buildLoftedPorschePatch(-0.64, 0.40, 0.70, 1.0, 24, 14, side);
    roofCanopyGroup.add(new THREE.Mesh(roofGeo, matPorscheBody));
    roofCanopyGroup.add(buildPatchBoundaryLine(-0.64, 0.40, 0.70, 1.0, 18, side, lineDarkMat));

    const railSeamPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const z = -0.62 + 0.98 * (i / 14);
      const pt = evalPorsche911Point(z, 0.79, side);
      pt.y += 0.002;
      railSeamPts.push(pt);
    }
    roofCanopyGroup.add(createPencilCurveLine(railSeamPts, false, lineDarkMat));

    const rearGlassGeo = buildLoftedPorschePatch(-1.30, -0.64, 0.68, 1.0, 20, 14, side);
    roofCanopyGroup.add(new THREE.Mesh(rearGlassGeo, matPorscheGlass));
    roofCanopyGroup.add(buildPatchBoundaryLine(-1.30, -0.64, 0.68, 1.0, 16, side, lineDarkMat));
  });

  registerExplodable(roofCanopyGroup, new THREE.Vector3(0, 1.85, 0.05), new THREE.Euler(0.06, 0, 0), 'exterior');

  // ==========================================================================
  // 6G. REAR ENGINE DECKLID WITH COOLING LOUVERS
  // ==========================================================================
  const rearDecklidGroup = new THREE.Group();
  carRoot.add(rearDecklidGroup);

  [-1, 1].forEach((side) => {
    const deckGeo = buildLoftedPorschePatch(-1.94, -1.24, 0.68, 1.0, 16, 10, side);
    rearDecklidGroup.add(new THREE.Mesh(deckGeo, matPorscheBody));
    rearDecklidGroup.add(buildPatchBoundaryLine(-1.94, -1.24, 0.68, 1.0, 12, side, lineDarkMat));
  });

  for (let l = 0; l < 5; l++) {
    const zLouver = -1.36 - l * 0.095;
    const ptCenter = evalPorsche911Point(zLouver, 0.98, 1);
    const louverWidth = 0.86 - l * 0.025;
    const slat = createSketchMesh(new THREE.BoxGeometry(louverWidth, 0.018, 0.052), matDarkCharcoal);
    slat.position.set(0, ptCenter.y + 0.008, zLouver);
    slat.rotation.x = -0.34;
    rearDecklidGroup.add(slat);
  }

  registerExplodable(rearDecklidGroup, new THREE.Vector3(0, 1.65, -1.05), new THREE.Euler(0.28, 0, 0), 'exterior');

  // ==========================================================================
  // 6H. REAR BUMPER, TAILLIGHTS, LIGHT BAR & DIFFUSER
  // ==========================================================================
  const rearBumperGroup = new THREE.Group();
  carRoot.add(rearBumperGroup);

  [-1, 1].forEach((side) => {
    const rBumperGeo = buildLoftedPorschePatch(-2.25, -1.90, 0.0, 1.0, 16, 16, side);
    rearBumperGroup.add(new THREE.Mesh(rBumperGeo, matPorscheBody));
    rearBumperGroup.add(buildPatchBoundaryLine(-2.25, -1.90, 0.0, 0.68, 12, side, lineDarkMat));

    const tailLightAssy = new THREE.Group();
    const tlPos = evalPorsche911Point(-2.08, 0.56, side);
    tailLightAssy.position.set(side * 0.54, tlPos.y - 0.02, -2.11);
    tailLightAssy.rotation.y = side * 0.36;
    tailLightAssy.rotation.z = -side * 0.05;

    tailLightAssy.add(createSketchMesh(new THREE.BoxGeometry(0.42, 0.062, 0.14), matRedTaillight));

    const reverseStrip = createSketchMesh(new THREE.BoxGeometry(0.34, 0.016, 0.145), matPorscheBody);
    reverseStrip.position.y = -0.008;
    tailLightAssy.add(reverseStrip);

    rearBumperGroup.add(tailLightAssy);

    const reflector = createSketchMesh(new THREE.BoxGeometry(0.18, 0.016, 0.03), matRedTaillight);
    reflector.position.set(side * 0.48, 0.31, -2.21);
    reflector.rotation.y = side * 0.25;
    rearBumperGroup.add(reflector);
  });

  {
    const c4sLightStrip = createSketchMesh(new THREE.BoxGeometry(0.76, 0.022, 0.06), matRedTaillight);
    c4sLightStrip.position.set(0, 0.725, -2.165);
    c4sLightStrip.rotation.x = -0.15;
    rearBumperGroup.add(c4sLightStrip);

    const rearPlate = createSketchMesh(new THREE.BoxGeometry(0.48, 0.10, 0.03), matPorscheBody);
    rearPlate.position.set(0, 0.42, -2.235);
    rearBumperGroup.add(rearPlate);

    const rearValance = createSketchMesh(new THREE.BoxGeometry(1.42, 0.11, 0.14), matDarkCharcoal);
    rearValance.position.set(0, 0.21, -2.17);
    rearBumperGroup.add(rearValance);
  }

  registerExplodable(rearBumperGroup, new THREE.Vector3(0, 0.05, -1.75), new THREE.Euler(-0.1, 0, 0), 'exterior');

  // ==========================================================================
  // 7. MONOCOQUE CHASSIS, ROLL CAGE & COCKPIT INTERIOR
  // ==========================================================================
  const chassisGroup = new THREE.Group();
  carRoot.add(chassisGroup);

  {
    const floorPan = createSketchMesh(new THREE.BoxGeometry(1.48, 0.07, 3.15), matMachinedAlloy);
    floorPan.position.set(0, 0.16, 0.08);
    chassisGroup.add(floorPan);

    const centerTunnel = createSketchMesh(new THREE.BoxGeometry(0.28, 0.24, 2.75), matDarkCharcoal);
    centerTunnel.position.set(0, 0.28, 0.10);
    chassisGroup.add(centerTunnel);

    const frontBulkhead = createSketchMesh(new THREE.BoxGeometry(1.38, 0.46, 0.12), matMachinedAlloy);
    frontBulkhead.position.set(0, 0.42, 0.92);
    chassisGroup.add(frontBulkhead);

    const rearBulkhead = createSketchMesh(new THREE.BoxGeometry(1.44, 0.52, 0.12), matMachinedAlloy);
    rearBulkhead.position.set(0, 0.45, -0.68);
    chassisGroup.add(rearBulkhead);
  }

  function addChassisStrut(p1: THREE.Vector3, p2: THREE.Vector3, r = 0.024) {
    const len = new THREE.Vector3().subVectors(p2, p1).length();
    const geo = new THREE.CylinderGeometry(r, r, len, 8);
    geo.translate(0, len / 2, 0);
    geo.rotateX(Math.PI / 2);
    const mesh = createSketchMesh(geo, matMachinedAlloy, 24);
    mesh.position.copy(p1);
    mesh.lookAt(p2);
    chassisGroup.add(mesh);
  }

  [-1, 1].forEach((s) => {
    addChassisStrut(new THREE.Vector3(s * 0.62, 0.48, 0.92), new THREE.Vector3(s * 0.48, 0.56, 1.42), 0.028);
    addChassisStrut(new THREE.Vector3(s * 0.48, 0.56, 1.42), new THREE.Vector3(s * 0.44, 0.24, 1.92), 0.026);
    addChassisStrut(new THREE.Vector3(s * 0.66, 0.20, 0.92), new THREE.Vector3(s * 0.44, 0.20, 1.92), 0.032);
    addChassisStrut(new THREE.Vector3(s * 0.74, 0.20, 0.92), new THREE.Vector3(s * 0.74, 0.20, -0.68), 0.042);
    addChassisStrut(new THREE.Vector3(s * 0.64, 0.52, -0.68), new THREE.Vector3(s * 0.52, 0.54, -1.78), 0.028);
    addChassisStrut(new THREE.Vector3(s * 0.64, 0.22, -0.68), new THREE.Vector3(s * 0.52, 0.24, -1.85), 0.034);
  });
  addChassisStrut(new THREE.Vector3(-0.48, 0.56, 1.42), new THREE.Vector3(0.48, 0.56, 1.42), 0.024);
  addChassisStrut(new THREE.Vector3(-0.52, 0.54, -1.78), new THREE.Vector3(0.52, 0.54, -1.78), 0.026);

  const interiorGroup = new THREE.Group();
  carRoot.add(interiorGroup);

  [-1, 1].forEach((s) => {
    const seat = new THREE.Group();
    seat.position.set(s * 0.36, 0.26, 0.02);
    seat.add(createSketchMesh(new THREE.BoxGeometry(0.44, 0.09, 0.48), matMachinedAlloy));
    const backrest = createSketchMesh(new THREE.BoxGeometry(0.42, 0.64, 0.09), matPorscheBody);
    backrest.position.set(0, 0.32, -0.20);
    backrest.rotation.x = -0.22;
    seat.add(backrest);
    const headrest = createSketchMesh(new THREE.BoxGeometry(0.24, 0.18, 0.08), matMachinedAlloy);
    headrest.position.set(0, 0.68, -0.28);
    headrest.rotation.x = -0.18;
    seat.add(headrest);
    interiorGroup.add(seat);
  });

  {
    const dashBeam = createSketchMesh(new THREE.BoxGeometry(1.32, 0.24, 0.36), matMachinedAlloy);
    dashBeam.position.set(0, 0.68, 0.68);
    interiorGroup.add(dashBeam);

    const steeringWheel = createSketchMesh(new THREE.TorusGeometry(0.155, 0.02, 10, 24), matDarkCharcoal);
    steeringWheel.position.set(0.36, 0.72, 0.44);
    steeringWheel.rotation.x = -0.32;
    interiorGroup.add(steeringWheel);
  }

  registerExplodable(interiorGroup, new THREE.Vector3(0, 0.95, 0.10), new THREE.Euler(0, 0, 0), 'cooling');

  // ==========================================================================
  // 8. FRONT TRIPLE-RADIATOR & DUAL COOLING FANS
  // ==========================================================================
  const coolingGroup = new THREE.Group();
  coolingGroup.position.set(0, 0.32, 1.88);
  carRoot.add(coolingGroup);

  const centerRadGroup = new THREE.Group();
  centerRadGroup.add(createSketchMesh(new THREE.BoxGeometry(0.68, 0.28, 0.07), matMachinedAlloy));
  for (let f = -4; f <= 4; f++) {
    const fin = createSketchMesh(new THREE.BoxGeometry(0.64, 0.008, 0.075), matDarkCharcoal);
    fin.position.y = f * 0.028;
    centerRadGroup.add(fin);
  }
  centerRadGroup.rotation.x = -0.35;
  coolingGroup.add(centerRadGroup);

  registerExplodable(centerRadGroup, new THREE.Vector3(0, 0.55, 1.35), new THREE.Euler(0.25, 0, 0), 'cooling');

  [-1, 1].forEach((s) => {
    const sideRadAssy = new THREE.Group();
    sideRadAssy.position.set(s * 0.52, 0.02, 0.05);
    sideRadAssy.rotation.y = -s * 0.38;

    sideRadAssy.add(createSketchMesh(new THREE.BoxGeometry(0.36, 0.28, 0.065), matMachinedAlloy));

    for (let f = -4; f <= 4; f++) {
      const fin = createSketchMesh(new THREE.BoxGeometry(0.33, 0.008, 0.07), matDarkCharcoal);
      fin.position.y = f * 0.028;
      sideRadAssy.add(fin);
    }

    const fanUnit = new THREE.Group();
    fanUnit.position.set(0, 0, -0.06);
    fanUnit.add(createSketchMesh(new THREE.TorusGeometry(0.115, 0.014, 10, 24), matDarkCharcoal));

    const rotor = new THREE.Group();
    const hub = createSketchMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), matDarkCharcoal);
    hub.rotation.x = Math.PI / 2;
    rotor.add(hub);
    for (let b = 0; b < 7; b++) {
      const a = (b / 7) * Math.PI * 2;
      const blade = createSketchMesh(new THREE.BoxGeometry(0.095, 0.026, 0.008), matPorscheBody);
      blade.position.set(Math.cos(a) * 0.058, Math.sin(a) * 0.058, 0);
      blade.rotation.z = a;
      blade.rotation.y = 0.38;
      rotor.add(blade);
    }
    fanUnit.add(rotor);
    spinningParts.push({ obj: rotor, axis: 'z', speed: 0.075 });

    sideRadAssy.add(fanUnit);
    coolingGroup.add(sideRadAssy);

    registerExplodable(
      sideRadAssy,
      new THREE.Vector3(s * 1.15, 0.35, 1.15),
      new THREE.Euler(0, -s * 0.25, 0),
      'cooling',
    );
  });

  // ==========================================================================
  // 9. WHEELS, CROSS-DRILLED ROTORS, CALIPERS & SUSPENSION
  // ==========================================================================
  const wheelConfigs = [
    { side: 1, z: 1.32, y: 0.355, r: 0.355, w: 0.26, calAngle: -0.15 },
    { side: -1, z: 1.32, y: 0.355, r: 0.355, w: 0.26, calAngle: -0.15 },
    { side: 1, z: -1.13, y: 0.365, r: 0.365, w: 0.31, calAngle: Math.PI + 0.15 },
    { side: -1, z: -1.13, y: 0.365, r: 0.365, w: 0.31, calAngle: Math.PI + 0.15 },
  ];

  wheelConfigs.forEach((wc) => {
    const s = wc.side;
    const xWheel = s * (wc.z > 0 ? 0.78 : 0.82);

    const suspGroup = new THREE.Group();
    suspGroup.position.set(xWheel - s * 0.25, wc.y, wc.z);

    [-0.10, 0.08].forEach((ay) => {
      const arm1 = createSketchMesh(new THREE.CylinderGeometry(0.010, 0.010, 0.22, 8), matMachinedAlloy);
      arm1.rotation.z = Math.PI / 2;
      arm1.rotation.y = 0.28;
      arm1.position.set(0, ay, 0.06);
      suspGroup.add(arm1);

      const arm2 = createSketchMesh(new THREE.CylinderGeometry(0.010, 0.010, 0.22, 8), matMachinedAlloy);
      arm2.rotation.z = Math.PI / 2;
      arm2.rotation.y = -0.28;
      arm2.position.set(0, ay, -0.06);
      suspGroup.add(arm2);
    });

    const strut = new THREE.Group();
    strut.position.set(-s * 0.04, 0.18, 0);
    strut.rotation.z = s * 0.22;
    strut.add(createSketchMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 10), matPorscheBody));
    for (let c = -3; c <= 3; c++) {
      const coil = createSketchMesh(new THREE.TorusGeometry(0.042, 0.009, 8, 14), matDarkCharcoal);
      coil.rotation.x = Math.PI / 2 + 0.18;
      coil.position.y = c * 0.038;
      strut.add(coil);
    }
    suspGroup.add(strut);

    carRoot.add(suspGroup);
    registerExplodable(suspGroup, new THREE.Vector3(s * 0.65, 0.05, 0), new THREE.Euler(0, 0, -s * 0.08), 'chassis_sub');

    const brakeGroup = new THREE.Group();
    brakeGroup.position.set(xWheel - s * 0.03, wc.y, wc.z);

    const discR = wc.r * 0.68;
    const discThickness = 0.026;

    const rotorDisc = createSketchMesh(
      new THREE.CylinderGeometry(discR, discR, discThickness, 64, 1, false),
      matMachinedAlloy,
      22,
    );
    rotorDisc.rotation.z = Math.PI / 2;
    brakeGroup.add(rotorDisc);

    const rotorHat = createSketchMesh(
      new THREE.CylinderGeometry(discR * 0.38, discR * 0.38, 0.044, 32),
      matDarkCharcoal,
      18,
    );
    rotorHat.rotation.z = Math.PI / 2;
    brakeGroup.add(rotorHat);

    const holeRows = [
      { radius: discR * 0.72, count: 14, offset: 0 },
      { radius: discR * 0.84, count: 16, offset: Math.PI / 16 },
    ];
    const faceX = s * (discThickness / 2 + 0.0015);
    holeRows.forEach((row, rowIndex) => {
      const holeRadius = rowIndex === 0 ? 0.009 : 0.007;
      for (let d = 0; d < row.count; d++) {
        const a = (d / row.count) * Math.PI * 2 + row.offset;
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(holeRadius, holeRadius, 0.003, 10), matDarkCharcoal);
        hole.rotation.z = Math.PI / 2;
        hole.position.set(faceX, Math.sin(a) * row.radius, Math.cos(a) * row.radius);
        brakeGroup.add(hole);
      }
    });

    [discR * 0.56, discR * 0.60].forEach((ringRadius, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadius, 0.0025, 5, 64),
        idx === 0 ? matDarkCharcoal : lineMidMat,
      );
      ring.position.x = faceX;
      ring.rotation.y = Math.PI / 2;
      brakeGroup.add(ring);
    });

    const caliper = createSketchMesh(new THREE.BoxGeometry(0.060, 0.17, 0.095), matYellowCaliper, 12);
    const calAngle = wc.calAngle;
    const calRadius = discR * 0.80;
    caliper.position.set(s * 0.020, Math.sin(calAngle) * calRadius, -Math.cos(calAngle) * calRadius);
    caliper.rotation.x = calAngle;
    brakeGroup.add(caliper);

    carRoot.add(brakeGroup);
    registerExplodable(brakeGroup, new THREE.Vector3(s * 1.35, 0.02, 0), new THREE.Euler(0, 0, 0), 'chassis_sub');

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(xWheel, wc.y, wc.z);

    const rimR = wc.r * 0.79;
    const tread = createSketchMesh(new THREE.CylinderGeometry(wc.r, wc.r, wc.w, 36, 1, true), matDarkCharcoal, 14);
    tread.rotation.z = Math.PI / 2;
    wheelGroup.add(tread);

    [-1, 1].forEach((sw) => {
      const sidewall = createSketchMesh(
        new THREE.TorusGeometry((wc.r + rimR) * 0.5, (wc.r - rimR) * 0.52, 12, 36),
        matDarkCharcoal,
      );
      sidewall.rotation.y = Math.PI / 2;
      sidewall.position.x = sw * (wc.w * 0.42);
      wheelGroup.add(sidewall);
    });

    const rimLip = createSketchMesh(new THREE.TorusGeometry(rimR, 0.014, 10, 36), matPorscheBody);
    rimLip.rotation.y = Math.PI / 2;
    rimLip.position.x = s * (wc.w * 0.43);
    wheelGroup.add(rimLip);

    const innerBarrel = createSketchMesh(
      new THREE.CylinderGeometry(rimR - 0.012, rimR - 0.012, wc.w * 0.72, 48, 1, true),
      matDarkCharcoal,
    );
    innerBarrel.rotation.z = Math.PI / 2;
    wheelGroup.add(innerBarrel);

    const hubX = s * (wc.w * 0.31);
    const centerHub = createSketchMesh(new THREE.CylinderGeometry(0.071, 0.078, 0.055, 32), matMachinedAlloy);
    centerHub.rotation.z = Math.PI / 2;
    centerHub.position.x = hubX;
    wheelGroup.add(centerHub);

    const hubRing = createSketchMesh(new THREE.TorusGeometry(0.052, 0.004, 8, 32), matPorscheBody);
    hubRing.rotation.y = Math.PI / 2;
    hubRing.position.x = s * (wc.w * 0.31 + 0.029);
    wheelGroup.add(hubRing);

    const centerCap = createSketchMesh(new THREE.CylinderGeometry(0.039, 0.039, 0.025, 32), matDarkCharcoal);
    centerCap.rotation.z = Math.PI / 2;
    centerCap.position.x = s * (wc.w * 0.31 + 0.035);
    wheelGroup.add(centerCap);

    const spokeInner = 0.067;
    const spokeOuter = rimR * 0.925;
    const spokeFaceX = s * (wc.w * 0.315);
    const faceRotation = s > 0 ? Math.PI / 2 : -Math.PI / 2;
    for (let pair = 0; pair < 5; pair++) {
      const baseAngle = (pair / 5) * Math.PI * 2;
      [-0.105, 0.105].forEach((offsetAngle, spokeIndex) => {
        const a = baseAngle + offsetAngle;
        const shape = new THREE.Shape();
        shape.moveTo(spokeInner, -0.010);
        shape.quadraticCurveTo(spokeInner + 0.045, -0.013, spokeOuter * 0.58, -0.018);
        shape.lineTo(spokeOuter * 0.94, -0.030);
        shape.quadraticCurveTo(spokeOuter, -0.026, spokeOuter, -0.010);
        shape.lineTo(spokeOuter, 0.010);
        shape.quadraticCurveTo(spokeOuter * 0.98, 0.027, spokeOuter * 0.90, 0.029);
        shape.lineTo(spokeOuter * 0.56, 0.016);
        shape.quadraticCurveTo(spokeInner + 0.035, 0.013, spokeInner, 0.010);
        shape.closePath();

        const spokeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.020,
          bevelEnabled: true,
          bevelSegments: 1,
          steps: 1,
          bevelSize: 0.0025,
          bevelThickness: 0.0025,
          curveSegments: 4,
        });
        spokeGeo.rotateZ(a);
        spokeGeo.rotateY(faceRotation);
        const spoke = createSketchMesh(spokeGeo, matPorscheBody, 18);
        spoke.position.set(spokeFaceX, 0, 0);
        wheelGroup.add(spoke);

        const sign = spokeIndex === 0 ? -1 : 1;
        const highlightShape = new THREE.Shape();
        highlightShape.moveTo(spokeOuter * 0.52, sign * 0.009);
        highlightShape.lineTo(spokeOuter * 0.90, sign * 0.019);
        highlightShape.lineTo(spokeOuter * 0.91, sign * 0.014);
        highlightShape.lineTo(spokeOuter * 0.54, sign * 0.005);
        highlightShape.closePath();
        const highlightGeo = new THREE.ShapeGeometry(highlightShape);
        highlightGeo.rotateZ(a);
        highlightGeo.rotateY(faceRotation);
        const highlight = new THREE.Mesh(highlightGeo, lineMidMat);
        highlight.position.x = spokeFaceX + s * 0.021;
        wheelGroup.add(highlight);
      });
    }

    for (let lug = 0; lug < 5; lug++) {
      const a = (lug / 5) * Math.PI * 2;
      const bolt = createSketchMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.009, 8), matMachinedAlloy);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(s * (wc.w * 0.31 + 0.041), Math.sin(a) * 0.050, Math.cos(a) * 0.050);
      wheelGroup.add(bolt);
    }

    carRoot.add(wheelGroup);
    registerExplodable(wheelGroup, new THREE.Vector3(s * 2.25, 0.0, 0), new THREE.Euler(0, s * 0.12, 0), 'chassis_sub');
  });

  // ==========================================================================
  // 10. 8-CYLINDER TWIN-TURBO ENGINE & PDK POWERTRAIN
  // ==========================================================================
  const engineMasterGroup = new THREE.Group();
  engineMasterGroup.position.set(0, 0.38, -1.42);
  carRoot.add(engineMasterGroup);

  registerExplodable(engineMasterGroup, new THREE.Vector3(0, 1.38, -0.15), new THREE.Euler(0.06, 0, 0), 'engine_lift');

  const engineBlockGroup = new THREE.Group();
  engineMasterGroup.add(engineBlockGroup);

  {
    const lowerCrankcase = createSketchMesh(new THREE.BoxGeometry(0.46, 0.26, 0.78), matMachinedAlloy);
    lowerCrankcase.position.set(0, -0.06, 0);
    engineBlockGroup.add(lowerCrankcase);
  }

  [-1, 1].forEach((bankSide) => {
    const bankGroup = new THREE.Group();
    bankGroup.rotation.z = -bankSide * (Math.PI / 4);

    const bankDeck = createSketchMesh(new THREE.BoxGeometry(0.28, 0.30, 0.74), matMachinedAlloy);
    bankDeck.position.set(0, 0.17, 0);
    bankGroup.add(bankDeck);

    for (let c = 0; c < 4; c++) {
      const zCyl = -0.26 + c * 0.175 + bankSide * 0.018;
      const boreSleeve = createSketchMesh(
        new THREE.CylinderGeometry(0.074, 0.074, 0.32, 16, 1, true),
        matDarkCharcoal,
        15,
      );
      boreSleeve.position.set(0, 0.18, zCyl);
      bankGroup.add(boreSleeve);
    }
    engineBlockGroup.add(bankGroup);
  });

  [-1, 1].forEach((bankSide) => {
    const angle = -bankSide * (Math.PI / 4);
    const dirX = Math.sin(-angle);
    const dirY = Math.cos(-angle);

    for (let c = 0; c < 4; c++) {
      const zCyl = -0.26 + c * 0.175 + bankSide * 0.018;
      const pistonAssy = new THREE.Group();
      pistonAssy.position.set(dirX * 0.18, dirY * 0.18, zCyl);
      pistonAssy.rotation.z = angle;

      pistonAssy.add(createSketchMesh(new THREE.CylinderGeometry(0.068, 0.068, 0.085, 16), matPorscheBody, 15));

      [-0.018, 0.02].forEach((ry) => {
        const pRing = createSketchMesh(new THREE.TorusGeometry(0.070, 0.005, 8, 18), matDarkCharcoal);
        pRing.rotation.x = Math.PI / 2;
        pRing.position.y = ry;
        pistonAssy.add(pRing);
      });

      const wristPin = createSketchMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 10), matDarkCharcoal);
      wristPin.rotation.x = Math.PI / 2;
      wristPin.position.y = -0.015;
      pistonAssy.add(wristPin);

      const conRod = createSketchMesh(new THREE.BoxGeometry(0.026, 0.19, 0.018), matMachinedAlloy);
      conRod.position.y = -0.11;
      pistonAssy.add(conRod);

      const bigEnd = createSketchMesh(new THREE.TorusGeometry(0.034, 0.011, 8, 16), matDarkCharcoal);
      bigEnd.position.y = -0.21;
      pistonAssy.add(bigEnd);

      engineMasterGroup.add(pistonAssy);

      const stagger = 0.72 + c * 0.11;
      registerExplodable(
        pistonAssy,
        new THREE.Vector3(dirX * stagger, dirY * stagger, (c - 1.5) * 0.06),
        new THREE.Euler(0, 0, 0),
        'engine_parts',
      );
    }
  });

  const crankshaftGroup = new THREE.Group();
  crankshaftGroup.position.set(0, -0.11, 0);

  {
    const mainJournal = createSketchMesh(new THREE.CylinderGeometry(0.036, 0.036, 0.86, 14), matMachinedAlloy);
    mainJournal.rotation.x = Math.PI / 2;
    crankshaftGroup.add(mainJournal);

    for (let w = 0; w < 8; w++) {
      const web = createSketchMesh(new THREE.CylinderGeometry(0.095, 0.065, 0.026, 12), matDarkCharcoal);
      web.rotation.x = Math.PI / 2;
      web.position.set(Math.cos(w * 1.57) * 0.028, Math.sin(w * 1.57) * 0.028, -0.33 + w * 0.094);
      crankshaftGroup.add(web);
    }

    const flywheel = createSketchMesh(new THREE.CylinderGeometry(0.19, 0.19, 0.036, 24), matDarkCharcoal);
    flywheel.rotation.x = Math.PI / 2;
    flywheel.position.z = 0.45;
    crankshaftGroup.add(flywheel);
  }

  engineMasterGroup.add(crankshaftGroup);
  // Not added to spinningParts: as an explodable part its rotation is reset to the base pose
  // every frame, so in the original it never visibly spins.
  registerExplodable(crankshaftGroup, new THREE.Vector3(0, -0.58, 0), new THREE.Euler(0, 0, 0), 'engine_parts');

  const oilPanGroup = new THREE.Group();
  oilPanGroup.position.set(0, -0.24, 0);
  oilPanGroup.add(createSketchMesh(new THREE.BoxGeometry(0.44, 0.09, 0.74), matDarkCharcoal));
  for (let f = -3; f <= 3; f++) {
    const fin = createSketchMesh(new THREE.BoxGeometry(0.46, 0.016, 0.016), matMachinedAlloy);
    fin.position.set(0, -0.045, f * 0.095);
    oilPanGroup.add(fin);
  }
  engineMasterGroup.add(oilPanGroup);
  registerExplodable(oilPanGroup, new THREE.Vector3(0, -1.02, 0), new THREE.Euler(0, 0, 0), 'engine_parts');

  [-1, 1].forEach((bankSide) => {
    const angle = -bankSide * (Math.PI / 4);
    const dirX = Math.sin(-angle);
    const dirY = Math.cos(-angle);

    const cylHeadGroup = new THREE.Group();
    cylHeadGroup.position.set(dirX * 0.34, dirY * 0.34, 0);
    cylHeadGroup.rotation.z = angle;

    cylHeadGroup.add(createSketchMesh(new THREE.BoxGeometry(0.30, 0.13, 0.76), matPorscheBody));

    [-0.075, 0.075].forEach((cx) => {
      const camShaft = createSketchMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 10), matMachinedAlloy);
      camShaft.rotation.x = Math.PI / 2;
      camShaft.position.set(cx, 0.045, 0);
      cylHeadGroup.add(camShaft);

      const camGear = createSketchMesh(new THREE.CylinderGeometry(0.055, 0.055, 0.024, 16), matDarkCharcoal);
      camGear.rotation.x = Math.PI / 2;
      camGear.position.set(cx, 0.045, -0.40);
      cylHeadGroup.add(camGear);
    });

    engineMasterGroup.add(cylHeadGroup);
    registerExplodable(
      cylHeadGroup,
      new THREE.Vector3(dirX * 1.25, dirY * 1.25, 0),
      new THREE.Euler(0, 0, -bankSide * 0.10),
      'engine_parts',
    );

    const valveCoverGroup = new THREE.Group();
    valveCoverGroup.position.set(dirX * 0.44, dirY * 0.44, 0);
    valveCoverGroup.rotation.z = angle;

    valveCoverGroup.add(createSketchMesh(new THREE.BoxGeometry(0.28, 0.07, 0.74), matDarkCharcoal));

    for (let c = 0; c < 4; c++) {
      const coil = createSketchMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 10), matPorscheBody);
      coil.position.set(0, 0.045, -0.25 + c * 0.17);
      valveCoverGroup.add(coil);
    }

    engineMasterGroup.add(valveCoverGroup);
    registerExplodable(
      valveCoverGroup,
      new THREE.Vector3(dirX * 1.68, dirY * 1.68, 0),
      new THREE.Euler(0, 0, -bankSide * 0.16),
      'engine_parts',
    );
  });

  const intakeGroup = new THREE.Group();
  intakeGroup.position.set(0, 0.36, 0);

  [-0.11, 0.11].forEach((px) => {
    const plenum = createSketchMesh(new THREE.CylinderGeometry(0.072, 0.082, 0.76, 14), matDarkCharcoal);
    plenum.rotation.x = Math.PI / 2;
    plenum.position.set(px, 0, 0);
    intakeGroup.add(plenum);
  });

  for (let r = 0; r < 4; r++) {
    const zRunner = -0.25 + r * 0.17;
    [-1, 1].forEach((s) => {
      const runner = createSketchMesh(new THREE.CylinderGeometry(0.036, 0.032, 0.22, 10), matPorscheBody);
      runner.position.set(s * 0.09, 0.09, zRunner);
      runner.rotation.z = -s * 0.24;
      intakeGroup.add(runner);
    });
  }

  engineMasterGroup.add(intakeGroup);
  registerExplodable(intakeGroup, new THREE.Vector3(0, 1.72, 0.05), new THREE.Euler(0.12, 0, 0), 'engine_parts');

  [-1, 1].forEach((s) => {
    const headerGroup = new THREE.Group();
    headerGroup.position.set(s * 0.40, 0.12, 0);

    const collector = createSketchMesh(new THREE.CylinderGeometry(0.042, 0.055, 0.72, 12), matMachinedAlloy);
    collector.rotation.x = Math.PI / 2;
    headerGroup.add(collector);

    for (let p = 0; p < 4; p++) {
      const pipe = createSketchMesh(new THREE.TorusGeometry(0.10, 0.020, 8, 14, Math.PI), matPorscheBody);
      pipe.position.set(-s * 0.04, 0.04, -0.25 + p * 0.17);
      pipe.rotation.y = Math.PI / 2;
      headerGroup.add(pipe);
    }

    engineMasterGroup.add(headerGroup);
    registerExplodable(
      headerGroup,
      new THREE.Vector3(s * 1.18, 0.22, -0.10),
      new THREE.Euler(0, s * 0.22, 0),
      'engine_parts',
    );

    const turboGroup = new THREE.Group();
    turboGroup.position.set(s * 0.48, 0.06, -0.44);

    const coldSnail = createSketchMesh(new THREE.TorusGeometry(0.10, 0.044, 12, 20), matPorscheBody);
    coldSnail.position.z = 0.045;
    turboGroup.add(coldSnail);

    const hotSnail = createSketchMesh(new THREE.TorusGeometry(0.095, 0.040, 12, 20), matDarkCharcoal);
    hotSnail.position.z = -0.045;
    turboGroup.add(hotSnail);

    engineMasterGroup.add(turboGroup);
    registerExplodable(
      turboGroup,
      new THREE.Vector3(s * 1.65, 0.48, -0.58),
      new THREE.Euler(0.18, s * 0.38, 0),
      'engine_parts',
    );
  });

  const pdkGearboxGroup = new THREE.Group();
  pdkGearboxGroup.position.set(0, -0.05, 0.72);

  {
    const bellHousing = createSketchMesh(new THREE.CylinderGeometry(0.22, 0.17, 0.28, 16), matMachinedAlloy);
    bellHousing.rotation.x = Math.PI / 2;
    bellHousing.position.z = -0.18;
    pdkGearboxGroup.add(bellHousing);

    const gearCase = createSketchMesh(new THREE.BoxGeometry(0.36, 0.30, 0.56), matDarkCharcoal);
    gearCase.position.z = 0.18;
    pdkGearboxGroup.add(gearCase);

    const axleFlange = createSketchMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.56, 14), matPorscheBody);
    axleFlange.rotation.z = Math.PI / 2;
    axleFlange.position.z = 0.04;
    pdkGearboxGroup.add(axleFlange);
  }

  engineMasterGroup.add(pdkGearboxGroup);
  registerExplodable(pdkGearboxGroup, new THREE.Vector3(0, -0.15, 0.95), new THREE.Euler(0.08, 0, 0), 'engine_parts');

  const quadExhaustGroup = new THREE.Group();
  quadExhaustGroup.position.set(0, -0.17, -0.56);

  {
    const centerMuffler = createSketchMesh(new THREE.BoxGeometry(0.72, 0.18, 0.24), matMachinedAlloy);
    centerMuffler.position.set(0, 0.04, 0.08);
    quadExhaustGroup.add(centerMuffler);
  }

  [-1, 1].forEach((s) => {
    [0.41, 0.52].forEach((tx) => {
      const tip = createSketchMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.24, 16, 1, true), matDarkCharcoal);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(s * tx, 0, -0.14);
      quadExhaustGroup.add(tip);

      const tipRim = createSketchMesh(new THREE.TorusGeometry(0.042, 0.006, 8, 16), matPorscheBody);
      tipRim.position.set(s * tx, 0, -0.25);
      quadExhaustGroup.add(tipRim);
    });
  });

  engineMasterGroup.add(quadExhaustGroup);
  registerExplodable(quadExhaustGroup, new THREE.Vector3(0, -0.12, -1.15), new THREE.Euler(0, 0, 0), 'engine_parts');

  // ==========================================================================
  // 11. DASHED EXPLOSION TRAJECTORY LINES
  // ==========================================================================
  const guideLineCount = explodableParts.filter((p) => p.drawGuideLine).length;
  const guidePositions = new Float32Array(guideLineCount * 6);
  const guideGeometry = new THREE.BufferGeometry();
  const guidePositionAttr = new THREE.BufferAttribute(guidePositions, 3);
  guideGeometry.setAttribute('position', guidePositionAttr);

  const guideMaterial = new THREE.LineDashedMaterial({
    color: 0x38352e,
    dashSize: 0.11,
    gapSize: 0.07,
    transparent: true,
    opacity: 0.52,
  });

  const guideLinesMesh = new THREE.LineSegments(guideGeometry, guideMaterial);
  guideLinesMesh.frustumCulled = false;
  carRoot.add(guideLinesMesh);

  const tempOrigin = new THREE.Vector3();
  const tempCurrent = new THREE.Vector3();

  function updateExplodedTransforms() {
    for (let i = 0; i < explodableParts.length; i++) {
      const p = explodableParts[i];
      const t = p.progress;
      p.obj.position.set(
        p.basePos.x + p.offset.x * t,
        p.basePos.y + p.offset.y * t,
        p.basePos.z + p.offset.z * t,
      );
      p.obj.rotation.set(
        p.baseRot.x + p.rotOffset.x * t,
        p.baseRot.y + p.rotOffset.y * t,
        p.baseRot.z + p.rotOffset.z * t,
      );
    }

    carRoot.updateMatrixWorld(true);

    let lineIdx = 0;
    for (let i = 0; i < explodableParts.length; i++) {
      const p = explodableParts[i];
      if (!p.drawGuideLine) continue;
      const o = lineIdx * 6;

      if (p.progress > 0.015) {
        const parent = p.obj.parent!;
        tempOrigin.copy(p.basePos);
        parent.localToWorld(tempOrigin);
        carRoot.worldToLocal(tempOrigin);

        tempCurrent.copy(p.obj.position);
        parent.localToWorld(tempCurrent);
        carRoot.worldToLocal(tempCurrent);

        guidePositions[o] = tempOrigin.x;
        guidePositions[o + 1] = tempOrigin.y;
        guidePositions[o + 2] = tempOrigin.z;
        guidePositions[o + 3] = tempCurrent.x;
        guidePositions[o + 4] = tempCurrent.y;
        guidePositions[o + 5] = tempCurrent.z;
      } else {
        guidePositions.fill(0, o, o + 6);
      }
      lineIdx++;
    }

    guidePositionAttr.needsUpdate = true;
    guideLinesMesh.computeLineDistances();
  }

  // ==========================================================================
  // 12. RENDER LOOP
  // ==========================================================================
  const scrollState = createInitialScrollState();

  let pointerX = 0;
  let pointerY = 0;
  let userYaw = 0;
  let userPitch = 0;

  const lastProgress: Record<ExplodeCategory, number> = {
    exterior: NaN,
    chassis_sub: NaN,
    cooling: NaN,
    engine_lift: NaN,
    engine_parts: NaN,
  };

  function syncExplodeProgress() {
    const next: Record<ExplodeCategory, number> = {
      exterior: scrollState.exteriorProgress,
      chassis_sub: scrollState.chassisSubProgress,
      cooling: scrollState.coolingProgress,
      engine_lift: scrollState.engineLiftProgress,
      engine_parts: scrollState.enginePartsProgress,
    };
    let changed = false;
    for (const key in next) {
      const k = key as ExplodeCategory;
      if (next[k] !== lastProgress[k]) {
        lastProgress[k] = next[k];
        changed = true;
      }
    }
    if (!changed) return;

    for (let i = 0; i < explodableParts.length; i++) {
      explodableParts[i].progress = next[explodableParts[i].category];
    }
    updateExplodedTransforms();
  }

  let frameId = 0;
  let lastTime = 0;
  let active = false;

  function frame(time: number) {
    frameId = requestAnimationFrame(frame);
    // Motion constants are tuned per 60 Hz frame; scale by elapsed time so high-refresh
    // displays play at the same speed.
    const steps = lastTime ? Math.min((time - lastTime) / FRAME_MS, 4) : 1;
    lastTime = time;

    for (let s = 0; s < spinningParts.length; s++) {
      const sp = spinningParts[s];
      sp.obj.rotation[sp.axis] += sp.speed * steps;
    }

    syncExplodeProgress();

    const ease = 1 - Math.pow(0.95, steps);
    masterGroup.rotation.y += ((pointerX * 0.045) - masterGroup.rotation.y) * ease;
    masterGroup.rotation.x += ((pointerY * 0.02) - masterGroup.rotation.x) * ease;

    const angle = scrollState.camAngle + userYaw;
    const radius = scrollState.camRadius;
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = Math.max(0.28, scrollState.camHeight + userPitch);
    camera.lookAt(scrollState.lookX, scrollState.lookY, scrollState.lookZ);

    renderer.render(scene, camera);
  }

  return {
    scrollState,

    setSize(width, height) {
      if (width <= 0 || height <= 0) return;
      const aspect = width / height;
      camera.aspect = aspect;
      camera.fov = aspect >= REFERENCE_ASPECT
        ? BASE_FOV
        : THREE.MathUtils.radToDeg(
          2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * (REFERENCE_ASPECT / aspect)),
        );
      if (centerX === 0.5) {
        camera.clearViewOffset();
      } else {
        camera.setViewOffset(width, height, (0.5 - centerX) * width, 0, width, height);
      }
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
    },

    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },

    orbitBy(dx, dy) {
      userYaw -= dx * 0.0055;
      userPitch = Math.max(-0.6, Math.min(2.6, userPitch + dy * 0.01));
    },

    setActive(next) {
      if (next === active) return;
      active = next;
      if (active) {
        lastTime = 0;
        frameId = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(frameId);
      }
    },

    dispose() {
      cancelAnimationFrame(frameId);
      active = false;
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const renderable = obj as THREE.Mesh;
        if (renderable.geometry) geometries.add(renderable.geometry as THREE.BufferGeometry);
        if (renderable.material) {
          const mats = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
          mats.forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
