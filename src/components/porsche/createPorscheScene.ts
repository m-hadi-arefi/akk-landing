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
  /** Weight of the pencil hatching against the smooth light shading, 0..1. */
  hatchStrength?: number;
  /** How strongly the specular highlight lifts the colour toward paper white. */
  specBoost?: number;
  /** Strength of the crisp diagonal reflection streaks used on the glass, for non-glass surfaces. */
  reflection?: number;
  /** Strength of the Fresnel-weighted sky/ground horizon reflection. */
  envReflect?: number;
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
  lightYaw: number;
}

const INITIAL_CAM_ANGLE = 0.6;
const ORIGINAL_START_CAM_ANGLE = Math.PI * 0.5;

export const createInitialScrollState = (): PorscheScrollState => ({
  exteriorProgress: 0,
  chassisSubProgress: 0,
  coolingProgress: 0,
  engineLiftProgress: 0,
  enginePartsProgress: 0,
  // Front three-quarter view: camera ahead of the car (+z) and off to its right side (+x).
  camAngle: INITIAL_CAM_ANGLE,
  camHeight: 1.3,
  camRadius: 6.9,
  lookX: 0,
  lookY: 0.52,
  lookZ: 0.15,
  // The light rig is fixed in world space and the original starts in side profile; rotating it by the
  // camera offset lights the body exactly as the original's opening frame (same pencil hatching).
  lightYaw: INITIAL_CAM_ANGLE - ORIGINAL_START_CAM_ANGLE,
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
  uniform float uHatchStrength;
  uniform float uSpecBoost;
  uniform float uReflection;
  uniform float uEnvReflect;
  uniform float uGlassMode;
  uniform float uOpacity;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uOverlayCenterX;
  uniform float uLightYaw;

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

    float ly = sin(uLightYaw);
    float lc = cos(uLightYaw);
    mat3 lightYaw = mat3(lc, 0.0, -ly, 0.0, 1.0, 0.0, ly, 0.0, lc);
    vec3 L_top   = lightYaw * normalize(vec3(0.25, 0.92, 0.28));
    vec3 L_front = lightYaw * normalize(vec3(0.45, 0.40, 0.78));
    vec3 L_back  = lightYaw * normalize(vec3(-0.55, 0.45, -0.70));

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

    // Every layer shares one stroke direction, and the dense layers use exactly twice the base
    // frequency so their lines coincide; crossing angles or near-equal frequencies produce a
    // diamond / moire lattice instead of pencil shading.
    float h2H = pencilStroke(strokeCoord, 0.58, 1.10, 0.32);
    float hHB = pencilStroke(strokeCoord, 0.58, 1.10, 0.50);
    float h2B = pencilStroke(strokeCoord, 0.58, 2.20, 0.44);
    float h6B = pencilStroke(strokeCoord, 0.58, 2.20, 0.62);

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

    float reflCoord = vWorldPos.x * 4.2 + vWorldPos.z * 3.1 + vWorldPos.y * 5.2;
    float reflStreak = smoothstep(0.88, 0.92, sin(reflCoord * 2.8));

    if (uGlassMode > 0.5 && uGlassMode < 1.5) {
      float glassStreak = reflStreak;
      float thinStreak = smoothstep(0.975, 0.99, sin(reflCoord * 1.7 + 1.3));
      float rimSheen = pow(1.0 - ndotv, 3.0) * 0.12;
      lum = clamp(0.03 + spec * 0.9 + glassStreak * 0.40 + thinStreak * 0.25 + rimSheen, 0.0, 0.92);
      float glassShade = smoothstep(0.0, 0.90, lum);
      hatchMask = glassShade * mix(1.0, h2B, 0.45);
    }
    else if (uGlassMode >= 1.5) {
      float glassStreak = smoothstep(0.45, 0.85, sin((vWorldPos.x * 5.5 + vWorldPos.z * 3.8 + vWorldPos.y * 4.0) * 3.2));
      lum = clamp(lum + glassStreak * 0.32, 0.65, 0.96);
    }

    float paperGrain = (noise(gl_FragCoord.xy * 0.65) - 0.5) * 0.06;
    float smoothShade = smoothstep(0.0, 0.90, lum);
    float finalShade = clamp(mix(smoothShade, hatchMask, uHatchStrength) + paperGrain, uShadeFloor, 1.0);

    vec3 baseSketch = mix(uGraphiteColor, uPaperColor, finalShade);
    vec3 finalColor = mix(baseSketch, uAccentColor * (0.45 + 0.55 * finalShade), uAccentStrength);
    finalColor = mix(finalColor, uPaperColor, clamp(spec * uSpecBoost + reflStreak * uReflection, 0.0, 1.0));

    if (uEnvReflect > 0.0) {
      // Sky-over-ground environment reflection with a crisp horizon line, weighted by Fresnel
      // (Schlick) so it strengthens toward grazing angles like real clear-coat and glass.
      vec3 Vw = normalize(cameraPosition - vWorldPos);
      vec3 R = reflect(-Vw, WN);
      float fresnel = 0.04 + 0.96 * pow(1.0 - clamp(dot(WN, Vw), 0.0, 1.0), 5.0);
      float sky = smoothstep(-0.015, 0.015, R.y) * mix(0.82, 1.0, smoothstep(0.0, 0.7, R.y));
      vec3 groundColor = mix(uGraphiteColor, finalColor, 0.45);
      vec3 envColor = mix(groundColor, uPaperColor, sky);
      finalColor = mix(finalColor, envColor, clamp(uEnvReflect * (0.22 + 0.78 * fresnel), 0.0, 1.0));
    }

    // Original page's .paper-texture-overlay (vignette over 26px drafting lines, opacity 0.38,
    // mix-blend-mode: multiply), applied to the car's pixels only so the page background stays untouched.
    vec2 overlayCenter = vec2(uOverlayCenterX, 0.5) * uResolution;
    float farCorner = length(max(overlayCenter, uResolution - overlayCenter));
    float vignetteA = 0.16 * clamp((length(gl_FragCoord.xy - overlayCenter) / farCorner - 0.6) / 0.4, 0.0, 1.0);
    vec2 cssPx = mod(floor(gl_FragCoord.xy / uPixelRatio), 26.0);
    float lineA = 1.0 - (1.0 - 0.02 * step(cssPx.x, 0.5)) * (1.0 - 0.02 * step(cssPx.y, 0.5));
    float overlayA = vignetteA + lineA * (1.0 - vignetteA);
    vec3 overlayColor = overlayA > 0.0
      ? (vec3(36.0, 34.0, 29.0) / 255.0 * vignetteA + vec3(32.0, 30.0, 26.0) / 255.0 * lineA * (1.0 - vignetteA)) / overlayA
      : vec3(1.0);
    float blendA = 0.38 * overlayA;
    finalColor *= (1.0 - blendA) + blendA * overlayColor;

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
  // Shared by reference across every graphite material, so one write updates them all at once.
  const sharedGraphiteUniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uOverlayCenterX: { value: centerX },
    uLightYaw: { value: 0 },
  };

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
        uHatchStrength: { value: options.hatchStrength ?? 0.5 },
        uSpecBoost: { value: options.specBoost ?? 0.0 },
        uReflection: { value: options.reflection ?? 0.0 },
        uEnvReflect: { value: options.envReflect ?? 0.0 },
        uGlassMode: { value: options.glassMode ?? 0.0 },
        uOpacity: { value: options.opacity ?? 1.0 },
        ...sharedGraphiteUniforms,
      },
      transparent: (options.opacity ?? 1.0) < 1.0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  }

  const matPorscheBody = createGraphiteMat({ toneBias: -0.06, shadeFloor: 0.58, hatchScale: 0.92 });

  // Exterior paint in the site's brand blue (Tailwind blue-700), laid over the graphite hatching
  // the same way the caliper/taillight accents are.
  const matBrandPaint = createGraphiteMat({
    toneBias: 0.0,
    shadeFloor: 0.30,
    hatchScale: 0.92,
    hatchStrength: 0.22,
    specBoost: 1.4,
    envReflect: 0.55,
    accentHex: 0x1d4ed8,
    accentStrength: 0.86,
  });

  const matPorscheGlass = createGraphiteMat({
    graphiteHex: 0x0c0d10,
    accentHex: 0x151a24,
    accentStrength: 0.30,
    shadeFloor: 0.04,
    hatchScale: 1.25,
    hatchStrength: 0.30,
    envReflect: 0.6,
    glassMode: 1.0,
    opacity: 0.96,
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

  const matTireRubber = createGraphiteMat({
    graphiteHex: 0x0c0d10,
    toneBias: 0.40,
    shadeFloor: 0.05,
    hatchScale: 1.30,
    hatchStrength: 0.15,
    specBoost: 0.35,
    envReflect: 0.08,
  });

  const matBumperPaint = createGraphiteMat({
    toneBias: 0.0,
    shadeFloor: 0.30,
    hatchScale: 0.92,
    hatchStrength: 0.15,
    specBoost: 1.4,
    envReflect: 0.55,
    accentHex: 0x1d4ed8,
    accentStrength: 0.86,
  });

  const matBumperTrim = createGraphiteMat({
    graphiteHex: 0x0c0d10,
    toneBias: 0.42,
    shadeFloor: 0.05,
    hatchScale: 1.30,
    hatchStrength: 0.15,
    specBoost: 0.6,
    envReflect: 0.2,
  });

  const matWheelAlloy = createGraphiteMat({
    toneBias: -0.02,
    shadeFloor: 0.40,
    hatchScale: 1.05,
    hatchStrength: 0.30,
    specBoost: 1.2,
    envReflect: 0.45,
  });

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
    hoodGroup.add(new THREE.Mesh(unifiedHoodGeo, matBrandPaint));
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

  // Engraved "Akk" lettering. Text reads from the front of the car: texture u runs along +x and
  // texture v (letter up) points toward the windshield.
  const hoodLettering = (() => {
    const TEXT = 'Akk';
    const SUBTEXT = 'آریان خودرو خاورمیانه';
    const TEXT_FONT = '"Inter", "Segoe UI", system-ui, sans-serif';
    const SUBTEXT_FONT = '"Vazirmatn", "Segoe UI", Tahoma, sans-serif';
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 620;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;

    // Light lip on the lower edge sells the recessed, engraved look.
    const engrave = (text: string, x: number, y: number, lip: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillText(text, x, y + lip);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(text, x, y);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cx = canvas.width / 2;

      ctx.direction = 'ltr';
      ctx.font = `800 360px ${TEXT_FONT}`;
      engrave(TEXT, cx, 235, 8);

      ctx.direction = 'rtl';
      let subSize = 120;
      ctx.font = `700 ${subSize}px ${SUBTEXT_FONT}`;
      const maxWidth = canvas.width * 0.92;
      const measured = ctx.measureText(SUBTEXT).width;
      if (measured > maxWidth) {
        subSize = Math.floor(subSize * (maxWidth / measured));
        ctx.font = `700 ${subSize}px ${SUBTEXT_FONT}`;
      }
      engrave(SUBTEXT, cx, 505, 5);
      texture.needsUpdate = true;
    };
    draw();
    if (document.fonts) {
      Promise.all([
        document.fonts.load(`800 360px ${TEXT_FONT}`, TEXT),
        document.fonts.load(`700 120px ${SUBTEXT_FONT}`, SUBTEXT),
      ]).then(draw, draw);
    }

    const TZ0 = 0.40;
    const TZ1 = 0.70;
    const U_HALF = 0.62;
    const zSteps = 8;
    const uSteps = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let iz = 0; iz <= zSteps; iz++) {
      const tz = TZ0 + (TZ1 - TZ0) * (iz / zSteps);
      for (let iu = 0; iu <= uSteps; iu++) {
        const u = -U_HALF + 2 * U_HALF * (iu / uSteps);
        const pt = evalSmoothHoodSurface(tz, u);
        positions.push(pt.x, pt.y + 0.0025, pt.z);
        uvs.push(iu / uSteps, 1 - iz / zSteps);
      }
    }
    const stride = uSteps + 1;
    for (let iz = 0; iz < zSteps; iz++) {
      for (let iu = 0; iu < uSteps; iu++) {
        const a = iz * stride + iu;
        const b = (iz + 1) * stride + iu;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 1;
    return { mesh, texture };
  })();
  hoodGroup.add(hoodLettering.mesh);

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
    frontFenderGroup.add(new THREE.Mesh(fenderGeo, matBrandPaint));
    frontFenderGroup.add(buildPatchBoundaryLine(0.80, 2.06, 0.0, 0.68, 22, side, lineDarkMat));

    const markerPt = evalPorsche911Point(1.89, 0.31, side);
    const sideMarker = createSketchMesh(new THREE.BoxGeometry(0.018, 0.022, 0.13), matHeadlightGlass);
    sideMarker.position.set(markerPt.x + side * 0.005, markerPt.y, markerPt.z);
    sideMarker.rotation.y = -side * 0.18;
    frontFenderGroup.add(sideMarker);

    if (side === -1) {
      const capPt = evalPorsche911Point(1.18, 0.54, -1);
      const fuelCap = createSketchMesh(new THREE.CylinderGeometry(0.066, 0.066, 0.008, 24), matBrandPaint);
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
    frontBumperGroup.add(new THREE.Mesh(bumperGeo, matBumperPaint));
    frontBumperGroup.add(buildPatchBoundaryLine(2.01, 2.25, 0.0, 0.68, 14, side, lineDarkMat));

    const sideIntakeGroup = new THREE.Group();
    sideIntakeGroup.position.set(side * 0.49, 0.255, 2.165);
    sideIntakeGroup.rotation.y = -side * 0.26;

    sideIntakeGroup.add(createSketchMesh(new THREE.BoxGeometry(0.39, 0.125, 0.085), matBumperTrim));

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
    const centerIntake = createSketchMesh(new THREE.BoxGeometry(0.54, 0.092, 0.08), matBumperTrim);
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
    const frontChinLip = createSketchMesh(new THREE.BoxGeometry(1.56, 0.024, 0.18), matBumperTrim);
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
    doorGroup.add(new THREE.Mesh(doorGeo, matBrandPaint));
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
    const mirrorHousing = createSketchMesh(housingGeo, matBrandPaint);
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
  // 6E. REAR QUARTER PANELS, C-PILLARS & ROCKERS
  // ==========================================================================
  [-1, 1].forEach((side) => {
    const rearQuarterGroup = new THREE.Group();
    carRoot.add(rearQuarterGroup);

    // Solid C-pillar: the upper part runs forward to the door glass (z = -0.42) so no gap is left
    // between the quarter panel and the door window.
    const quarterGeo = buildLoftedPorschePatch(-1.94, -0.48, 0.0, 0.48, 28, 12, side);
    rearQuarterGroup.add(new THREE.Mesh(quarterGeo, matBrandPaint));
    const pillarGeo = buildLoftedPorschePatch(-1.94, -0.42, 0.48, 0.68, 28, 6, side);
    rearQuarterGroup.add(new THREE.Mesh(pillarGeo, matBrandPaint));
    rearQuarterGroup.add(buildPatchBoundaryLine(-1.94, -0.48, 0.0, 0.68, 18, side, lineDarkMat));

    const rockerGeo = buildLoftedPorschePatch(-0.52, 0.82, 0.0, 0.06, 16, 4, side);
    rearQuarterGroup.add(new THREE.Mesh(rockerGeo, matDarkCharcoal));

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
    roofCanopyGroup.add(new THREE.Mesh(roofGeo, matBrandPaint));
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
    rearDecklidGroup.add(new THREE.Mesh(deckGeo, matBrandPaint));
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
    rearBumperGroup.add(new THREE.Mesh(rBumperGeo, matBrandPaint));
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

  const extrudeZ = (shape: THREE.Shape, depth: number, curveSegments = 12) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  const roundedRectShape = (w: number, h: number, r: number) => {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  };

  // Horizontal slab: w along x, d along z, h along y.
  const roundedSlab = (w: number, d: number, h: number, r: number) => {
    const geo = extrudeZ(roundedRectShape(w, d, r), h, 8);
    geo.rotateX(-Math.PI / 2);
    return geo;
  };

  // Shape drawn in the (z, y) side view, extruded across the car's width.
  const extrudeAcrossX = (sideProfile: THREE.Shape, width: number) => {
    const geo = new THREE.ExtrudeGeometry(sideProfile, { depth: width, bevelEnabled: false, curveSegments: 10 });
    geo.rotateY(-Math.PI / 2);
    geo.translate(width / 2, 0, 0);
    return geo;
  };

  const lineTickMat = new THREE.LineBasicMaterial({ color: 0xd8d4c8, transparent: true, opacity: 0.9 });

  const interiorGroup = new THREE.Group();
  carRoot.add(interiorGroup);

  // --------------------------------------------------------------------------
  // 7A. CARBON-SHELL BUCKET SEATS
  // --------------------------------------------------------------------------
  const seatShellShape = (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.20, 0);
    shape.lineTo(0.20, 0);
    shape.lineTo(0.225, 0.48);
    shape.quadraticCurveTo(0.225, 0.56, 0.15, 0.58);
    shape.lineTo(0.13, 0.61);
    shape.lineTo(0.14, 0.72);
    shape.quadraticCurveTo(0.14, 0.78, 0.08, 0.78);
    shape.lineTo(-0.08, 0.78);
    shape.quadraticCurveTo(-0.14, 0.78, -0.14, 0.72);
    shape.lineTo(-0.13, 0.61);
    shape.lineTo(-0.15, 0.58);
    shape.quadraticCurveTo(-0.225, 0.56, -0.225, 0.48);
    shape.closePath();
    // Harness slots between the shoulder wings and the integrated headrest.
    [-0.065, 0.065].forEach((hx) => {
      const slot = new THREE.Path();
      slot.moveTo(hx - 0.025, 0.585);
      slot.lineTo(hx - 0.025, 0.605);
      slot.lineTo(hx + 0.025, 0.605);
      slot.lineTo(hx + 0.025, 0.585);
      slot.closePath();
      shape.holes.push(slot);
    });
    return shape;
  })();

  const seatWingShape = (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.04, 0);
    shape.lineTo(0.04, 0);
    shape.lineTo(0.03, 0.50);
    shape.quadraticCurveTo(0.0, 0.535, -0.035, 0.52);
    shape.closePath();
    return shape;
  })();

  [-1, 1].forEach((s) => {
    const seat = new THREE.Group();
    seat.position.set(s * 0.36, 0.205, 0.02);

    [-0.15, 0.15].forEach((rx) => {
      const rail = createSketchMesh(new THREE.BoxGeometry(0.022, 0.022, 0.46), matMachinedAlloy);
      rail.position.set(rx, 0.011, 0);
      seat.add(rail);
    });
    const frame = createSketchMesh(new THREE.BoxGeometry(0.40, 0.035, 0.44), matDarkCharcoal);
    frame.position.y = 0.04;
    seat.add(frame);

    const cushion = new THREE.Group();
    cushion.position.y = 0.06;
    cushion.rotation.x = -0.07;
    seat.add(cushion);

    const cushionCenter = createSketchMesh(roundedSlab(0.25, 0.40, 0.05, 0.04), matPorscheBody);
    cushionCenter.position.y = 0.035;
    cushion.add(cushionCenter);
    [-1, 1].forEach((bx) => {
      const bolster = createSketchMesh(roundedSlab(0.075, 0.42, 0.085, 0.03), matMachinedAlloy);
      bolster.position.set(bx * 0.165, 0.05, 0);
      cushion.add(bolster);
    });
    const frontRoll = createSketchMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 16), matPorscheBody, 30);
    frontRoll.rotation.z = Math.PI / 2;
    frontRoll.position.set(0, 0.045, 0.20);
    cushion.add(frontRoll);
    [-0.07, 0.07].forEach((sx) => {
      cushion.add(createPencilCurveLine(
        [new THREE.Vector3(sx, 0.061, -0.18), new THREE.Vector3(sx, 0.061, 0.17)],
        false,
        lineMidMat,
      ));
    });
    [-0.10, 0.0, 0.10].forEach((sz) => {
      cushion.add(createPencilCurveLine(
        [new THREE.Vector3(-0.07, 0.061, sz), new THREE.Vector3(0.07, 0.061, sz)],
        false,
        lineMidMat,
      ));
    });

    const back = new THREE.Group();
    back.position.set(0, 0.07, -0.21);
    back.rotation.x = -0.22;
    seat.add(back);

    const shell = createSketchMesh(extrudeZ(seatShellShape, 0.035, 10), matDarkCharcoal);
    shell.position.z = -0.03;
    back.add(shell);

    const backPanel = createSketchMesh(extrudeZ(roundedRectShape(0.25, 0.50, 0.05), 0.045, 8), matPorscheBody);
    backPanel.position.set(0, 0.29, 0.01);
    back.add(backPanel);
    for (let fy = 0.10; fy <= 0.49; fy += 0.065) {
      back.add(createPencilCurveLine(
        [new THREE.Vector3(-0.11, fy, 0.034), new THREE.Vector3(0.11, fy, 0.034)],
        false,
        lineMidMat,
      ));
    }

    [-1, 1].forEach((bx) => {
      const wing = createSketchMesh(extrudeZ(seatWingShape, 0.10, 8), matMachinedAlloy);
      wing.position.set(bx * 0.172, 0.02, 0.03);
      wing.rotation.y = -bx * 0.28;
      back.add(wing);
    });

    const headPad = createSketchMesh(extrudeZ(roundedRectShape(0.20, 0.13, 0.04), 0.04, 8), matPorscheBody);
    headPad.position.set(0, 0.69, 0.005);
    back.add(headPad);
    const crest = new THREE.Mesh(new THREE.CircleGeometry(0.018, 20), matYellowCaliper);
    crest.position.set(0, 0.69, 0.026);
    back.add(crest);

    const reclineKnob = createSketchMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), matMachinedAlloy, 30);
    reclineKnob.rotation.z = Math.PI / 2;
    reclineKnob.position.set(s * 0.21, 0.08, -0.19);
    seat.add(reclineKnob);

    interiorGroup.add(seat);
  });

  // --------------------------------------------------------------------------
  // 7B. DASHBOARD, FIVE-DIAL CLUSTER, STEERING WHEEL & CENTRE CONSOLE
  // --------------------------------------------------------------------------
  {
    const dashProfile = new THREE.Shape();
    dashProfile.moveTo(0.86, 0.56);
    dashProfile.lineTo(0.86, 0.79);
    dashProfile.lineTo(0.66, 0.815);
    dashProfile.quadraticCurveTo(0.52, 0.82, 0.49, 0.795);
    dashProfile.lineTo(0.465, 0.74);
    dashProfile.lineTo(0.475, 0.62);
    dashProfile.quadraticCurveTo(0.49, 0.57, 0.53, 0.56);
    dashProfile.closePath();
    interiorGroup.add(createSketchMesh(extrudeAcrossX(dashProfile, 1.30), matMachinedAlloy));

    [-1, 1].forEach((sx) => {
      const trimStrip = createSketchMesh(new THREE.BoxGeometry(0.48, 0.012, 0.01), matPorscheBody);
      trimStrip.position.set(sx * 0.385, 0.70, 0.462);
      interiorGroup.add(trimStrip);
    });

    // Driver's instrument cowl over the classic five round dials (driver sits at +x).
    const DRIVER_X = 0.36;
    const cowlGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.11, 32, 1, true, Math.PI / 2, Math.PI);
    cowlGeo.rotateX(Math.PI / 2);
    const cowl = createSketchMesh(cowlGeo, matDarkCharcoal, 30);
    cowl.position.set(DRIVER_X, 0.745, 0.455);
    interiorGroup.add(cowl);

    const clusterBack = createSketchMesh(extrudeZ(roundedRectShape(0.44, 0.15, 0.05), 0.01, 8), matDarkCharcoal);
    clusterBack.position.set(DRIVER_X, 0.75, 0.46);
    interiorGroup.add(clusterBack);

    const buildGauge = (r: number, needleAngle: number) => {
      const gauge = new THREE.Group();
      gauge.add(new THREE.Mesh(new THREE.CircleGeometry(r, 32), matDarkCharcoal));
      const bezel = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0045, 6, 32), matPorscheBody);
      gauge.add(bezel);

      const tickPositions: number[] = [];
      const ticks = 11;
      for (let t = 0; t < ticks; t++) {
        const a = Math.PI * 1.25 - (t / (ticks - 1)) * Math.PI * 1.5;
        const inner = t % 2 === 0 ? 0.72 : 0.8;
        tickPositions.push(Math.cos(a) * r * inner, Math.sin(a) * r * inner, 0.001);
        tickPositions.push(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 0.001);
      }
      const tickGeo = new THREE.BufferGeometry();
      tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
      gauge.add(new THREE.LineSegments(tickGeo, lineTickMat));

      const needle = new THREE.Mesh(new THREE.BoxGeometry(0.003, r * 0.8, 0.002), matRedTaillight);
      needle.geometry.translate(0, r * 0.4, 0.002);
      needle.rotation.z = needleAngle;
      gauge.add(needle);
      const hub = new THREE.Mesh(new THREE.CircleGeometry(r * 0.12, 12), matPorscheBody);
      hub.position.z = 0.004;
      gauge.add(hub);

      gauge.rotation.y = Math.PI;
      return gauge;
    };

    [
      { dx: 0, dy: 0.0, r: 0.052, needle: -0.6 },
      { dx: -0.095, dy: -0.005, r: 0.041, needle: 0.4 },
      { dx: 0.095, dy: -0.005, r: 0.041, needle: -0.2 },
      { dx: -0.165, dy: -0.015, r: 0.03, needle: 0.9 },
      { dx: 0.165, dy: -0.015, r: 0.03, needle: -0.9 },
    ].forEach(({ dx, dy, r, needle }) => {
      const gauge = buildGauge(r, needle);
      // Gauges face the driver (-z), so local +x points toward world -x.
      gauge.position.set(DRIVER_X + dx, 0.75 + dy, 0.452);
      interiorGroup.add(gauge);
    });

    // Steering column and three-spoke sport wheel.
    const wheelCenter = new THREE.Vector3(DRIVER_X, 0.70, 0.36);
    const columnBase = new THREE.Vector3(DRIVER_X, 0.62, 0.52);
    const column = createSketchMesh(
      new THREE.CylinderGeometry(0.03, 0.036, columnBase.distanceTo(wheelCenter), 16),
      matDarkCharcoal,
      30,
    );
    column.position.copy(columnBase).lerp(wheelCenter, 0.5);
    column.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(wheelCenter, columnBase).normalize(),
    );
    interiorGroup.add(column);

    const wheel = new THREE.Group();
    wheel.position.copy(wheelCenter);
    wheel.rotation.x = 0.35;
    wheel.add(createSketchMesh(new THREE.TorusGeometry(0.17, 0.02, 12, 48), matDarkCharcoal, 30));
    const topMarker = createSketchMesh(new THREE.BoxGeometry(0.014, 0.044, 0.044), matYellowCaliper);
    topMarker.position.y = 0.17;
    wheel.add(topMarker);
    const wheelHub = createSketchMesh(extrudeZ(roundedRectShape(0.13, 0.10, 0.035), 0.05, 8), matMachinedAlloy);
    wheelHub.position.z = -0.01;
    wheel.add(wheelHub);
    const wheelCrest = new THREE.Mesh(new THREE.CircleGeometry(0.018, 20), matYellowCaliper);
    wheelCrest.position.z = -0.0365;
    wheelCrest.rotation.y = Math.PI;
    wheel.add(wheelCrest);
    [-1, 1].forEach((sx) => {
      const spoke = createSketchMesh(new THREE.BoxGeometry(0.11, 0.035, 0.02), matMachinedAlloy);
      spoke.position.set(sx * 0.11, -0.005, 0);
      wheel.add(spoke);
      const paddle = createSketchMesh(new THREE.BoxGeometry(0.05, 0.08, 0.006), matMachinedAlloy);
      paddle.position.set(sx * 0.12, 0.03, 0.03);
      wheel.add(paddle);
    });
    const lowerSpoke = createSketchMesh(new THREE.BoxGeometry(0.035, 0.10, 0.02), matMachinedAlloy);
    lowerSpoke.position.set(0, -0.11, 0);
    wheel.add(lowerSpoke);
    interiorGroup.add(wheel);

    // Centre stack: twin vents, touchscreen and climate buttons.
    [-0.065, 0.065].forEach((vx) => {
      const vent = createSketchMesh(extrudeZ(roundedRectShape(0.11, 0.04, 0.01), 0.01, 6), matDarkCharcoal);
      vent.position.set(vx, 0.725, 0.466);
      interiorGroup.add(vent);
      for (let sl = 0; sl < 3; sl++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.003, 0.004), matPorscheBody);
        slat.position.set(vx, 0.713 + sl * 0.012, 0.46);
        interiorGroup.add(slat);
      }
    });

    const screen = createSketchMesh(extrudeZ(roundedRectShape(0.24, 0.11, 0.012), 0.012, 6), matPorscheGlass);
    screen.position.set(0, 0.635, 0.466);
    screen.rotation.x = 0.08;
    interiorGroup.add(screen);

    // Climate buttons on the console's upper slope, angled toward the occupants.
    for (let b = 0; b < 5; b++) {
      const button = createSketchMesh(new THREE.BoxGeometry(0.028, 0.008, 0.016), matPorscheBody);
      button.position.set(-0.08 + b * 0.04, 0.558, 0.42);
      button.rotation.x = -0.46;
      interiorGroup.add(button);
    }

    // Round side vents at each end of the dash.
    [-0.60, 0.60].forEach((vx) => {
      const sideVent = new THREE.Group();
      sideVent.position.set(vx, 0.72, 0.465);
      sideVent.rotation.y = Math.PI;
      sideVent.add(new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), matDarkCharcoal));
      sideVent.add(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.005, 6, 24), matMachinedAlloy));
      [0, Math.PI / 2].forEach((a) => {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.004, 0.004), matPorscheBody);
        slat.rotation.z = a;
        slat.position.z = 0.003;
        sideVent.add(slat);
      });
      interiorGroup.add(sideVent);
    });

    // Centre console rising from the tunnel into the dash, with the PDK selector.
    const consoleProfile = new THREE.Shape();
    consoleProfile.moveTo(-0.18, 0.40);
    consoleProfile.lineTo(0.34, 0.40);
    consoleProfile.lineTo(0.50, 0.56);
    consoleProfile.lineTo(0.48, 0.585);
    consoleProfile.lineTo(0.32, 0.505);
    consoleProfile.quadraticCurveTo(0.10, 0.475, -0.18, 0.47);
    consoleProfile.closePath();
    interiorGroup.add(createSketchMesh(extrudeAcrossX(consoleProfile, 0.22), matDarkCharcoal));

    const selectorBoot = createSketchMesh(new THREE.CylinderGeometry(0.032, 0.036, 0.016, 20), matMachinedAlloy, 30);
    selectorBoot.position.set(0, 0.488, 0.08);
    interiorGroup.add(selectorBoot);
    const selectorStem = createSketchMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 10), matMachinedAlloy, 30);
    selectorStem.position.set(0, 0.515, 0.08);
    interiorGroup.add(selectorStem);
    const selectorKnob = createSketchMesh(new THREE.SphereGeometry(0.022, 16, 12), matPorscheBody, 30);
    selectorKnob.scale.set(0.9, 1.15, 1.3);
    selectorKnob.position.set(0, 0.55, 0.08);
    interiorGroup.add(selectorKnob);

    // Two-pedal PDK footwell: brake and throttle.
    [
      { x: DRIVER_X - 0.04, w: 0.09 },
      { x: DRIVER_X + 0.09, w: 0.06 },
    ].forEach(({ x, w }) => {
      const arm = createSketchMesh(new THREE.BoxGeometry(0.014, 0.24, 0.014), matMachinedAlloy);
      arm.position.set(x, 0.44, 0.64);
      arm.rotation.x = 0.18;
      interiorGroup.add(arm);
      const pad = createSketchMesh(new THREE.BoxGeometry(w, 0.055, 0.012), matPorscheBody);
      pad.position.set(x, 0.32, 0.62);
      pad.rotation.x = -0.45;
      interiorGroup.add(pad);
    });
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
    const tread = createSketchMesh(new THREE.CylinderGeometry(wc.r, wc.r, wc.w, 36, 1, true), matTireRubber, 14);
    tread.rotation.z = Math.PI / 2;
    wheelGroup.add(tread);

    [-1, 1].forEach((sw) => {
      const sidewall = createSketchMesh(
        new THREE.TorusGeometry((wc.r + rimR) * 0.5, (wc.r - rimR) * 0.52, 12, 36),
        matTireRubber,
      );
      sidewall.rotation.y = Math.PI / 2;
      sidewall.position.x = sw * (wc.w * 0.42);
      wheelGroup.add(sidewall);
    });

    const rimLip = createSketchMesh(new THREE.TorusGeometry(rimR, 0.014, 10, 36), matWheelAlloy);
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
        const spoke = createSketchMesh(spokeGeo, matWheelAlloy, 18);
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
  // Real 90-degree V8 layout: the crank axis sits at the vertex of the V, the cross-plane crank
  // carries four pins at 90-degree steps, and each pin is shared by one rod from each bank.
  const engineMasterGroup = new THREE.Group();
  engineMasterGroup.position.set(0, 0.38, -1.42);
  carRoot.add(engineMasterGroup);

  registerExplodable(engineMasterGroup, new THREE.Vector3(0, 1.38, -0.15), new THREE.Euler(0.06, 0, 0), 'engine_lift');

  const CRANK_Y = -0.06;
  const CYL_PITCH = 0.175;
  const ROD_STAGGER = 0.021;
  const CRANK_THROW = 0.048;
  const ROD_LENGTH = 0.19;
  const DECK_DIST = 0.32;
  const HEAD_HEIGHT = 0.12;
  const CRANK_PIN_ANGLES = [0, Math.PI / 2, Math.PI * 1.5, Math.PI].map((a) => a + 0.35);

  const pinZ = (c: number) => (c - 1.5) * CYL_PITCH;
  const cylZ = (c: number, s: number) => pinZ(c) + s * ROD_STAGGER;
  const bankAngle = (s: number) => -s * (Math.PI / 4);
  // Unit vector up the bore and the unit vector toward the valley, in the engine's XY plane.
  const bankDir = (s: number) => new THREE.Vector2(s * Math.SQRT1_2, Math.SQRT1_2);
  const bankInner = (s: number) => new THREE.Vector2(-s * Math.SQRT1_2, Math.SQRT1_2);
  const bankPoint = (s: number, along: number, inward: number, z: number) => {
    const d = bankDir(s);
    const n = bankInner(s);
    return new THREE.Vector3(d.x * along + n.x * inward, CRANK_Y + d.y * along + n.y * inward, z);
  };

  const gearGeometry = (rOuter: number, rRoot: number, teeth: number, depth: number, holeR = 0) => {
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const profile: [number, number][] = [
        [rRoot, a],
        [rOuter, a + step * 0.18],
        [rOuter, a + step * 0.5],
        [rRoot, a + step * 0.68],
      ];
      profile.forEach(([r, ang], j) => {
        const x = r * Math.cos(ang);
        const y = r * Math.sin(ang);
        if (i === 0 && j === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    }
    shape.closePath();
    if (holeR > 0) {
      const hole = new THREE.Path();
      hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    return extrudeZ(shape, depth, 4);
  };

  const tubeMesh = (points: THREE.Vector3[], radius: number, mat: THREE.Material, tubular = 28, radial = 10) =>
    createSketchMesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), tubular, radius, radial, false),
      mat,
      40,
    );

  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const orientAlong = (obj: THREE.Object3D, dir: THREE.Vector3) => {
    obj.quaternion.setFromUnitVectors(Y_AXIS, dir.clone().normalize());
  };

  const addBolt = (parent: THREE.Object3D, pos: THREE.Vector3, dir: THREE.Vector3, r = 0.007, len = 0.008) => {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), matDarkCharcoal);
    bolt.position.copy(pos);
    orientAlong(bolt, dir);
    parent.add(bolt);
  };

  // --------------------------------------------------------------------------
  // 10A. CYLINDER BLOCK, TIMING COVER & ACCESSORIES (static)
  // --------------------------------------------------------------------------
  const engineBlockGroup = new THREE.Group();
  engineMasterGroup.add(engineBlockGroup);

  const vBlockShape = () => {
    const shape = new THREE.Shape();
    const pts = [
      new THREE.Vector2(-0.25, -0.17),
      new THREE.Vector2(0.25, -0.17),
      new THREE.Vector2(0.25, -0.02),
      ...[1, -1].flatMap((s) => {
        const outer = bankPoint(s, DECK_DIST, -0.135, 0);
        const inner = bankPoint(s, DECK_DIST, 0.135, 0);
        const valley = new THREE.Vector2(s * 0.06, 0.10);
        return s === 1
          ? [new THREE.Vector2(outer.x, outer.y), new THREE.Vector2(inner.x, inner.y), valley]
          : [valley, new THREE.Vector2(inner.x, inner.y), new THREE.Vector2(outer.x, outer.y)];
      }),
      new THREE.Vector2(-0.25, -0.02),
    ];
    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].y);
    shape.closePath();
    return shape;
  };

  engineBlockGroup.add(createSketchMesh(extrudeZ(vBlockShape(), 0.74), matMachinedAlloy));

  // Bulkhead ribs on the crankcase skirt, one per main bearing.
  [-1, 1].forEach((s) => {
    for (let m = 0; m < 5; m++) {
      const rib = createSketchMesh(new THREE.BoxGeometry(0.014, 0.15, 0.022), matMachinedAlloy);
      rib.position.set(s * 0.256, -0.095, (m - 2) * CYL_PITCH);
      engineBlockGroup.add(rib);
    }
  });

  // Bore openings on each deck face, visible once the heads lift off.
  [-1, 1].forEach((s) => {
    const deckNormal = new THREE.Vector3(bankDir(s).x, bankDir(s).y, 0);
    for (let c = 0; c < 4; c++) {
      const center = bankPoint(s, DECK_DIST + 0.002, 0, cylZ(c, s));
      const bore = new THREE.Mesh(new THREE.CircleGeometry(0.072, 28), matDarkCharcoal);
      bore.position.copy(center);
      bore.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), deckNormal);
      engineBlockGroup.add(bore);

      const liner = new THREE.Mesh(new THREE.TorusGeometry(0.074, 0.004, 6, 28), lineMidMat);
      liner.position.copy(center);
      liner.quaternion.copy(bore.quaternion);
      engineBlockGroup.add(liner);
    }
  });

  {
    const timingCover = createSketchMesh(extrudeZ(vBlockShape(), 0.028), matDarkCharcoal);
    timingCover.position.z = -0.386;
    engineBlockGroup.add(timingCover);

    const alternator = new THREE.Group();
    alternator.position.set(0.17, -0.03, -0.44);
    const altBody = createSketchMesh(new THREE.CylinderGeometry(0.052, 0.052, 0.09, 20), matMachinedAlloy, 30);
    altBody.rotation.x = Math.PI / 2;
    alternator.add(altBody);
    for (let f = 0; f < 6; f++) {
      const fin = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.003, 4, 20), lineMidMat);
      fin.position.z = -0.035 + f * 0.014;
      alternator.add(fin);
    }
    const altPulley = createSketchMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 16), matDarkCharcoal, 30);
    altPulley.rotation.x = Math.PI / 2;
    altPulley.position.z = -0.055;
    alternator.add(altPulley);
    engineBlockGroup.add(alternator);
  }

  // --------------------------------------------------------------------------
  // 10B. PISTONS & I-BEAM CONNECTING RODS (slider-crank kinematics)
  // --------------------------------------------------------------------------
  const rodShape = (() => {
    const shape = new THREE.Shape();
    const L = ROD_LENGTH;
    shape.moveTo(0.024 * Math.cos(-Math.PI * 0.25), 0.024 * Math.sin(-Math.PI * 0.25));
    shape.absarc(0, 0, 0.024, -Math.PI * 0.25, Math.PI * 1.25, false);
    shape.lineTo(-0.026, -L + 0.042);
    shape.absarc(0, -L, 0.048, Math.PI * 0.62, Math.PI * 2.38, false);
    shape.lineTo(0.026, -L + 0.042);
    shape.closePath();
    const smallEye = new THREE.Path();
    smallEye.absarc(0, 0, 0.0175, 0, Math.PI * 2, true);
    const bigEye = new THREE.Path();
    bigEye.absarc(0, -L, 0.031, 0, Math.PI * 2, true);
    shape.holes.push(smallEye, bigEye);
    return shape;
  })();
  const rodGeo = extrudeZ(rodShape, 0.02, 16);

  function buildPiston() {
    const piston = new THREE.Group();

    const crown = createSketchMesh(new THREE.CylinderGeometry(0.068, 0.068, 0.024, 28), matPorscheBody, 30);
    crown.position.y = 0.049;
    piston.add(crown);

    const dome = createSketchMesh(new THREE.CylinderGeometry(0.058, 0.068, 0.008, 28), matPorscheBody, 30);
    dome.position.y = 0.065;
    piston.add(dome);

    // Valve reliefs: two intake and two exhaust pockets in the crown.
    [[-0.028, -0.024], [-0.028, 0.024], [0.028, -0.024], [0.028, 0.024]].forEach(([px, pz]) => {
      const pocket = new THREE.Mesh(new THREE.CircleGeometry(0.017, 16), matDarkCharcoal);
      pocket.rotation.x = -Math.PI / 2;
      pocket.position.set(px, 0.0695, pz);
      piston.add(pocket);
    });

    const ringBelt = createSketchMesh(new THREE.CylinderGeometry(0.0675, 0.0675, 0.03, 28), matMachinedAlloy, 30);
    ringBelt.position.y = 0.022;
    piston.add(ringBelt);

    // Two compression rings and a thicker oil-control ring.
    [[0.032, 0.0028], [0.022, 0.0028], [0.011, 0.0042]].forEach(([ry, tube]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.068, tube, 6, 28), matDarkCharcoal);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ry;
      piston.add(ring);
    });

    // Short skirts only on the thrust faces, perpendicular to the wrist pin.
    [Math.PI / 2, Math.PI * 1.5].forEach((thetaCenter) => {
      const skirt = createSketchMesh(
        new THREE.CylinderGeometry(0.067, 0.067, 0.058, 14, 1, true, thetaCenter - 0.8, 1.6),
        matPorscheBody,
        30,
      );
      skirt.position.y = -0.021;
      piston.add(skirt);
    });

    [-1, 1].forEach((sz) => {
      const boss = createSketchMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), matMachinedAlloy, 30);
      boss.rotation.x = Math.PI / 2;
      boss.position.z = sz * 0.042;
      piston.add(boss);
    });

    const wristPin = createSketchMesh(new THREE.CylinderGeometry(0.017, 0.017, 0.11, 16), matDarkCharcoal, 30);
    wristPin.rotation.x = Math.PI / 2;
    piston.add(wristPin);

    return piston;
  }

  function buildRod() {
    const rod = new THREE.Group();
    rod.add(createSketchMesh(rodGeo, matMachinedAlloy, 25));

    // I-beam channel on both faces of the shank.
    [-1, 1].forEach((sz) => {
      const channel = new THREE.Mesh(new THREE.BoxGeometry(0.011, ROD_LENGTH - 0.1, 0.002), matDarkCharcoal);
      channel.position.set(0, -ROD_LENGTH / 2 - 0.004, sz * 0.0105);
      rod.add(channel);
    });

    // Split line between the rod and its bearing cap, plus the two cap bolts.
    const capLine = createPencilCurveLine(
      [new THREE.Vector3(-0.048, -ROD_LENGTH, 0.0105), new THREE.Vector3(0.048, -ROD_LENGTH, 0.0105)],
      false,
      lineDarkMat,
    );
    rod.add(capLine);
    [-1, 1].forEach((sx) => {
      const capBolt = createSketchMesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.07, 8), matDarkCharcoal, 30);
      capBolt.position.set(sx * 0.038, -ROD_LENGTH - 0.004, 0);
      rod.add(capBolt);
    });
    return rod;
  }

  [-1, 1].forEach((s) => {
    const angle = bankAngle(s);
    const d = bankDir(s);
    const n = bankInner(s);
    const cosA = Math.cos(-angle);
    const sinA = Math.sin(-angle);

    for (let c = 0; c < 4; c++) {
      const theta = CRANK_PIN_ANGLES[c];
      const pin = new THREE.Vector2(CRANK_THROW * Math.cos(theta), CRANK_THROW * Math.sin(theta));
      const along = pin.dot(d);
      const across = pin.dot(n);
      const wristDist = along + Math.sqrt(ROD_LENGTH * ROD_LENGTH - across * across);

      const pistonAssy = new THREE.Group();
      pistonAssy.position.set(d.x * wristDist, CRANK_Y + d.y * wristDist, cylZ(c, s));
      pistonAssy.rotation.z = angle;
      pistonAssy.add(buildPiston());

      const toPin = new THREE.Vector2(pin.x - d.x * wristDist, pin.y - d.y * wristDist);
      const localX = toPin.x * cosA - toPin.y * sinA;
      const localY = toPin.x * sinA + toPin.y * cosA;
      const rod = buildRod();
      rod.rotation.z = Math.atan2(localX, -localY);
      pistonAssy.add(rod);

      engineMasterGroup.add(pistonAssy);

      const stagger = 0.72 + c * 0.11;
      registerExplodable(
        pistonAssy,
        new THREE.Vector3(d.x * stagger, d.y * stagger, (c - 1.5) * 0.06),
        new THREE.Euler(0, 0, 0),
        'engine_parts',
      );
    }
  });

  // --------------------------------------------------------------------------
  // 10C. CROSS-PLANE CRANKSHAFT, TORSIONAL DAMPER & FLYWHEEL
  // --------------------------------------------------------------------------
  const crankshaftGroup = new THREE.Group();
  crankshaftGroup.position.set(0, CRANK_Y, 0);

  {
    const mainJournal = createSketchMesh(new THREE.CylinderGeometry(0.033, 0.033, 0.80, 20), matMachinedAlloy, 30);
    mainJournal.rotation.x = Math.PI / 2;
    crankshaftGroup.add(mainJournal);

    const webShape = (phi: number) => {
      const shape = new THREE.Shape();
      const cw = phi + Math.PI;
      const px = CRANK_THROW * Math.cos(phi);
      const py = CRANK_THROW * Math.sin(phi);
      shape.moveTo(0.088 * Math.cos(cw - 1.1), 0.088 * Math.sin(cw - 1.1));
      shape.absarc(0, 0, 0.088, cw - 1.1, cw + 1.1, false);
      shape.absarc(px, py, 0.036, phi - Math.PI / 2, phi + Math.PI / 2, false);
      shape.closePath();
      return shape;
    };

    for (let c = 0; c < 4; c++) {
      const phi = CRANK_PIN_ANGLES[c];
      const crankPin = createSketchMesh(new THREE.CylinderGeometry(0.030, 0.030, 0.10, 18), matMachinedAlloy, 30);
      crankPin.rotation.x = Math.PI / 2;
      crankPin.position.set(CRANK_THROW * Math.cos(phi), CRANK_THROW * Math.sin(phi), pinZ(c));
      crankshaftGroup.add(crankPin);

      [-1, 1].forEach((sz) => {
        const web = createSketchMesh(extrudeZ(webShape(phi), 0.022, 16), matDarkCharcoal, 25);
        web.position.z = pinZ(c) + sz * 0.05;
        crankshaftGroup.add(web);
      });
    }

    const snout = createSketchMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 14), matMachinedAlloy, 30);
    snout.rotation.x = Math.PI / 2;
    snout.position.z = -0.42;
    crankshaftGroup.add(snout);

    const damper = createSketchMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.035, 32), matMachinedAlloy, 30);
    damper.rotation.x = Math.PI / 2;
    damper.position.z = -0.448;
    crankshaftGroup.add(damper);
    [-0.008, 0.004].forEach((gz) => {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(0.0805, 0.0025, 4, 32), matDarkCharcoal);
      groove.position.z = -0.448 + gz;
      crankshaftGroup.add(groove);
    });

    const flywheel = createSketchMesh(gearGeometry(0.19, 0.181, 72, 0.028, 0.034), matDarkCharcoal, 25);
    flywheel.position.z = 0.42;
    crankshaftGroup.add(flywheel);

    const flywheelFace = createSketchMesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 40), matMachinedAlloy, 30);
    flywheelFace.rotation.x = Math.PI / 2;
    flywheelFace.position.z = 0.42;
    crankshaftGroup.add(flywheelFace);
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      addBolt(
        crankshaftGroup,
        new THREE.Vector3(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0.437),
        new THREE.Vector3(0, 0, 1),
        0.007,
        0.008,
      );
    }
  }

  engineMasterGroup.add(crankshaftGroup);
  // Not added to spinningParts: as an explodable part its rotation is reset to the base pose
  // every frame, so in the original it never visibly spins.
  registerExplodable(crankshaftGroup, new THREE.Vector3(0, -0.58, 0), new THREE.Euler(0, 0, 0), 'engine_parts');

  // --------------------------------------------------------------------------
  // 10D. STEPPED OIL SUMP
  // --------------------------------------------------------------------------
  const oilPanGroup = new THREE.Group();
  oilPanGroup.position.set(0, -0.17, 0);

  {
    const flange = createSketchMesh(new THREE.BoxGeometry(0.50, 0.012, 0.76), matMachinedAlloy);
    flange.position.y = -0.006;
    oilPanGroup.add(flange);

    // Side profile (x = engine z, y = height): shallow front section, deep sump at the timing end.
    const sumpShape = new THREE.Shape();
    sumpShape.moveTo(-0.36, -0.01);
    sumpShape.lineTo(0.36, -0.01);
    sumpShape.lineTo(0.345, -0.065);
    sumpShape.lineTo(0.03, -0.07);
    sumpShape.quadraticCurveTo(-0.01, -0.072, -0.03, -0.11);
    sumpShape.lineTo(-0.045, -0.13);
    sumpShape.lineTo(-0.32, -0.13);
    sumpShape.quadraticCurveTo(-0.355, -0.128, -0.36, -0.09);
    sumpShape.closePath();
    const sumpGeo = new THREE.ExtrudeGeometry(sumpShape, { depth: 0.40, bevelEnabled: false, curveSegments: 8 });
    sumpGeo.rotateY(-Math.PI / 2);
    sumpGeo.translate(0.20, 0, 0);
    oilPanGroup.add(createSketchMesh(sumpGeo, matDarkCharcoal));

    for (let f = -2; f <= 2; f++) {
      const fin = createSketchMesh(new THREE.BoxGeometry(0.012, 0.016, 0.24), matMachinedAlloy);
      fin.position.set(f * 0.065, -0.136, -0.185);
      oilPanGroup.add(fin);
    }

    const drainPlug = createSketchMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 6), matMachinedAlloy, 25);
    drainPlug.position.set(0.12, -0.137, -0.08);
    oilPanGroup.add(drainPlug);
  }

  engineMasterGroup.add(oilPanGroup);
  registerExplodable(oilPanGroup, new THREE.Vector3(0, -1.02, 0), new THREE.Euler(0, 0, 0), 'engine_parts');

  // --------------------------------------------------------------------------
  // 10E. DOHC CYLINDER HEADS & CAM COVERS WITH COIL-ON-PLUG
  // --------------------------------------------------------------------------
  const camLobeGeo = (() => {
    const shape = new THREE.Shape();
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const r = 0.019 + 0.013 * Math.pow(Math.max(0, Math.cos(t)), 3);
      if (i === 0) shape.moveTo(r * Math.cos(t), r * Math.sin(t));
      else shape.lineTo(r * Math.cos(t), r * Math.sin(t));
    }
    return extrudeZ(shape, 0.012, 1);
  })();

  const headShape = (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.15, -0.06);
    shape.lineTo(0.15, -0.06);
    shape.lineTo(0.15, 0.025);
    shape.lineTo(0.135, 0.06);
    shape.lineTo(-0.135, 0.06);
    shape.lineTo(-0.15, 0.025);
    shape.closePath();
    return shape;
  })();

  const camCoverShape = (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.135, -0.035);
    shape.lineTo(0.135, -0.035);
    shape.lineTo(0.135, 0.0);
    shape.quadraticCurveTo(0.135, 0.035, 0.10, 0.035);
    shape.lineTo(-0.10, 0.035);
    shape.quadraticCurveTo(-0.135, 0.035, -0.135, 0.0);
    shape.closePath();
    return shape;
  })();

  [-1, 1].forEach((s) => {
    const angle = bankAngle(s);
    const d = bankDir(s);

    const cylHeadGroup = new THREE.Group();
    cylHeadGroup.position.copy(bankPoint(s, DECK_DIST + HEAD_HEIGHT / 2, 0, 0));
    cylHeadGroup.rotation.z = angle;

    cylHeadGroup.add(createSketchMesh(extrudeZ(headShape, 0.76), matMachinedAlloy));

    // In the head's local frame the exhaust (outer) face is at x = +s, the intake (valley) face at x = -s.
    for (let c = 0; c < 4; c++) {
      const zc = cylZ(c, s);

      const exhaustPort = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), matDarkCharcoal);
      exhaustPort.scale.set(1, 0.72, 1);
      exhaustPort.position.set(s * 0.1505, -0.01, zc);
      exhaustPort.rotation.y = s * Math.PI / 2;
      cylHeadGroup.add(exhaustPort);

      [-0.026, 0.026].forEach((dz) => {
        const intakePort = new THREE.Mesh(new THREE.CircleGeometry(0.019, 16), matDarkCharcoal);
        intakePort.position.set(-s * 0.1505, -0.01, zc + dz);
        intakePort.rotation.y = -s * Math.PI / 2;
        cylHeadGroup.add(intakePort);
      });

      const plugWell = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), matDarkCharcoal);
      plugWell.rotation.x = -Math.PI / 2;
      plugWell.position.set(0, 0.0605, zc);
      cylHeadGroup.add(plugWell);

      [-1, 1].forEach((sx) => {
        [-1, 1].forEach((sz) => {
          addBolt(
            cylHeadGroup,
            new THREE.Vector3(sx * 0.118, 0.064, zc + sz * 0.0875),
            Y_AXIS,
            0.008,
            0.008,
          );
        });
      });
    }

    // Exhaust cam on the outer side, intake cam on the valley side; two lobes per cylinder.
    [s, -s].forEach((side, camIdx) => {
      const camX = side * 0.07;
      const camShaft = createSketchMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.78, 12), matMachinedAlloy, 30);
      camShaft.rotation.x = Math.PI / 2;
      camShaft.position.set(camX, 0.078, 0);
      cylHeadGroup.add(camShaft);

      for (let c = 0; c < 4; c++) {
        [-0.026, 0.026].forEach((dz) => {
          const lobe = createSketchMesh(camLobeGeo, matPorscheBody, 25);
          lobe.position.set(camX, 0.078, cylZ(c, s) + dz);
          lobe.rotation.z = c * (Math.PI / 2) + camIdx * 1.1 + (s > 0 ? 0.4 : 0);
          cylHeadGroup.add(lobe);
        });
      }

      for (let b = 0; b < 5; b++) {
        const cap = createSketchMesh(new THREE.BoxGeometry(0.044, 0.018, 0.022), matMachinedAlloy);
        cap.position.set(camX, 0.082, (b - 2) * CYL_PITCH + s * ROD_STAGGER);
        cylHeadGroup.add(cap);
      }

      // VarioCam phaser behind the timing chain sprocket.
      const sprocket = createSketchMesh(gearGeometry(0.052, 0.046, 26, 0.016), matDarkCharcoal, 25);
      sprocket.position.set(camX, 0.078, -0.392);
      cylHeadGroup.add(sprocket);
      const phaser = createSketchMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.028, 20), matMachinedAlloy, 30);
      phaser.rotation.x = Math.PI / 2;
      phaser.position.set(camX, 0.078, -0.41);
      cylHeadGroup.add(phaser);
    });

    engineMasterGroup.add(cylHeadGroup);
    registerExplodable(
      cylHeadGroup,
      new THREE.Vector3(d.x * 1.25, d.y * 1.25, 0),
      new THREE.Euler(0, 0, -s * 0.10),
      'engine_parts',
    );

    const valveCoverGroup = new THREE.Group();
    valveCoverGroup.position.copy(bankPoint(s, DECK_DIST + HEAD_HEIGHT + 0.035, 0, 0));
    valveCoverGroup.rotation.z = angle;

    valveCoverGroup.add(createSketchMesh(extrudeZ(camCoverShape, 0.74), matDarkCharcoal));

    [-0.085, -0.06, 0.06, 0.085].forEach((rx) => {
      const rib = createSketchMesh(new THREE.BoxGeometry(0.006, 0.006, 0.64), matMachinedAlloy);
      rib.position.set(rx, 0.037, 0);
      valveCoverGroup.add(rib);
    });

    for (let c = 0; c < 4; c++) {
      const zc = cylZ(c, s);
      const coil = new THREE.Group();
      coil.position.set(0, 0.035, zc);
      const coilBody = createSketchMesh(new THREE.BoxGeometry(0.044, 0.03, 0.07), matMachinedAlloy);
      coilBody.position.y = 0.015;
      coil.add(coilBody);
      const connector = createSketchMesh(new THREE.BoxGeometry(0.022, 0.018, 0.024), matPorscheBody);
      connector.position.set(0, 0.016, -0.046);
      coil.add(connector);
      addBolt(coil, new THREE.Vector3(0, 0.032, 0.026), Y_AXIS, 0.006, 0.006);
      valveCoverGroup.add(coil);
    }

    for (let b = 0; b < 6; b++) {
      [-1, 1].forEach((sx) => {
        addBolt(valveCoverGroup, new THREE.Vector3(sx * 0.122, 0.01, -0.33 + b * 0.132), Y_AXIS, 0.006, 0.012);
      });
    }

    if (s === -1) {
      const fillerCap = createSketchMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.022, 20), matPorscheBody, 30);
      fillerCap.position.set(0.0, 0.045, 0.31);
      valveCoverGroup.add(fillerCap);
    }

    engineMasterGroup.add(valveCoverGroup);
    registerExplodable(
      valveCoverGroup,
      new THREE.Vector3(d.x * 1.68, d.y * 1.68, 0),
      new THREE.Euler(0, 0, -s * 0.16),
      'engine_parts',
    );
  });

  // --------------------------------------------------------------------------
  // 10F. INTAKE PLENUM, RUNNERS, THROTTLE BODY & FUEL RAILS
  // --------------------------------------------------------------------------
  const intakeGroup = new THREE.Group();

  {
    const PLENUM_Y = 0.40;
    const plenum = createSketchMesh(new THREE.CylinderGeometry(0.065, 0.065, 0.62, 28), matMachinedAlloy, 30);
    plenum.rotation.x = Math.PI / 2;
    plenum.position.y = PLENUM_Y;
    intakeGroup.add(plenum);
    [-0.31, 0.31].forEach((ez) => {
      const endCap = createSketchMesh(new THREE.SphereGeometry(0.065, 20, 12), matMachinedAlloy, 30);
      endCap.scale.set(1, 1, 0.55);
      endCap.position.set(0, PLENUM_Y, ez);
      intakeGroup.add(endCap);
    });

    [-1, 1].forEach((s) => {
      const n = bankInner(s);
      for (let c = 0; c < 4; c++) {
        const zc = cylZ(c, s);
        const port = bankPoint(s, DECK_DIST + 0.05, 0.148, zc);
        const approach = port.clone().add(new THREE.Vector3(n.x * 0.05, n.y * 0.05, 0));
        intakeGroup.add(tubeMesh(
          [
            new THREE.Vector3(s * 0.02, PLENUM_Y + 0.02, zc),
            new THREE.Vector3(s * 0.10, PLENUM_Y + 0.05, zc),
            approach,
            port,
          ],
          0.02,
          matPorscheBody,
        ));
      }

      const railStart = bankPoint(s, 0.42, 0.175, -0.33);
      const rail = createSketchMesh(new THREE.CylinderGeometry(0.009, 0.009, 0.66, 10), matMachinedAlloy, 30);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(railStart.x, railStart.y, 0);
      intakeGroup.add(rail);
      for (let c = 0; c < 4; c++) {
        const injector = createSketchMesh(new THREE.CylinderGeometry(0.007, 0.006, 0.04, 8), matDarkCharcoal, 30);
        injector.position.copy(bankPoint(s, 0.40, 0.162, cylZ(c, s)));
        orientAlong(injector, new THREE.Vector3(-n.x, -n.y, 0));
        intakeGroup.add(injector);
      }
    });

    const throttleBody = createSketchMesh(new THREE.CylinderGeometry(0.044, 0.044, 0.06, 24), matMachinedAlloy, 30);
    throttleBody.rotation.x = Math.PI / 2;
    throttleBody.position.set(0, PLENUM_Y, -0.41);
    intakeGroup.add(throttleBody);
    const throttleFlange = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.005, 6, 24), matDarkCharcoal);
    throttleFlange.position.set(0, PLENUM_Y, -0.38);
    intakeGroup.add(throttleFlange);
    const throttleMotor = createSketchMesh(new THREE.BoxGeometry(0.04, 0.05, 0.05), matDarkCharcoal);
    throttleMotor.position.set(0.055, PLENUM_Y, -0.41);
    intakeGroup.add(throttleMotor);
    intakeGroup.add(tubeMesh(
      [
        new THREE.Vector3(0, PLENUM_Y, -0.43),
        new THREE.Vector3(0, PLENUM_Y - 0.02, -0.48),
        new THREE.Vector3(0, PLENUM_Y - 0.07, -0.52),
      ],
      0.042,
      matDarkCharcoal,
      16,
      16,
    ));
  }

  engineMasterGroup.add(intakeGroup);
  registerExplodable(intakeGroup, new THREE.Vector3(0, 1.72, 0.05), new THREE.Euler(0.12, 0, 0), 'engine_parts');

  // --------------------------------------------------------------------------
  // 10G. TUBULAR EXHAUST MANIFOLDS & TWIN TURBOCHARGERS
  // --------------------------------------------------------------------------
  [-1, 1].forEach((s) => {
    const n = bankInner(s);
    const outward = new THREE.Vector3(-n.x, -n.y, 0);
    const turboPos = new THREE.Vector3(s * 0.48, 0.0, -0.56);

    const headerGroup = new THREE.Group();
    const collectorStart = new THREE.Vector3(s * 0.475, -0.10, -0.53);
    const collectorEnd = new THREE.Vector3(s * 0.48, -0.10, -0.60);

    for (let c = 0; c < 4; c++) {
      const zc = cylZ(c, s);
      const port = bankPoint(s, DECK_DIST + 0.05, -0.148, zc);
      headerGroup.add(tubeMesh(
        [
          port,
          port.clone().addScaledVector(outward, 0.06),
          new THREE.Vector3(s * 0.46, -0.02, zc - 0.04),
          new THREE.Vector3(s * 0.47, -0.08, zc * 0.4 - 0.29),
          collectorStart,
        ],
        0.016,
        matMachinedAlloy,
        36,
      ));

      const portFlange = createSketchMesh(new THREE.BoxGeometry(0.012, 0.05, 0.066), matMachinedAlloy);
      portFlange.position.copy(port.clone().addScaledVector(outward, 0.006));
      portFlange.rotation.z = bankAngle(s);
      headerGroup.add(portFlange);
    }
    headerGroup.add(tubeMesh([collectorStart, collectorStart.clone().lerp(collectorEnd, 0.5), collectorEnd], 0.032, matMachinedAlloy, 8, 14));

    engineMasterGroup.add(headerGroup);
    registerExplodable(
      headerGroup,
      new THREE.Vector3(s * 1.18, 0.22, -0.10),
      new THREE.Euler(0, s * 0.22, 0),
      'engine_parts',
    );

    // Shaft along z: turbine (cast iron, rear) at -z, compressor (aluminium) at +z.
    const turboGroup = new THREE.Group();
    turboGroup.position.copy(turboPos);

    const turbineHousing = createSketchMesh(new THREE.TorusGeometry(0.058, 0.036, 14, 24), matDarkCharcoal, 30);
    turbineHousing.position.z = -0.05;
    turboGroup.add(turbineHousing);
    const turbineOutlet = createSketchMesh(new THREE.CylinderGeometry(0.038, 0.04, 0.07, 20, 1, true), matDarkCharcoal, 30);
    turbineOutlet.rotation.x = Math.PI / 2;
    turbineOutlet.position.z = -0.11;
    turboGroup.add(turbineOutlet);

    const chra = createSketchMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 20), matMachinedAlloy, 30);
    chra.rotation.x = Math.PI / 2;
    turboGroup.add(chra);

    const compressorHousing = createSketchMesh(new THREE.TorusGeometry(0.064, 0.038, 14, 24), matMachinedAlloy, 30);
    compressorHousing.position.z = 0.055;
    turboGroup.add(compressorHousing);
    const compressorInlet = createSketchMesh(new THREE.CylinderGeometry(0.046, 0.042, 0.07, 24, 1, true), matMachinedAlloy, 30);
    compressorInlet.rotation.x = Math.PI / 2;
    compressorInlet.position.z = 0.115;
    turboGroup.add(compressorInlet);
    const inletLip = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.005, 6, 24), matMachinedAlloy);
    inletLip.position.z = 0.15;
    turboGroup.add(inletLip);

    const compressorWheel = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), matDarkCharcoal);
    compressorWheel.position.z = 0.09;
    turboGroup.add(compressorWheel);
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.003, 0.03), matPorscheBody);
      const a = (b / 7) * Math.PI * 2;
      blade.position.set(Math.cos(a) * 0.018, Math.sin(a) * 0.018, 0.1);
      blade.rotation.set(0, 0.5, a);
      turboGroup.add(blade);
    }

    turboGroup.add(tubeMesh(
      [
        new THREE.Vector3(0, 0.07, 0.055),
        new THREE.Vector3(-s * 0.03, 0.13, 0.07),
        new THREE.Vector3(-s * 0.09, 0.18, 0.12),
      ],
      0.028,
      matMachinedAlloy,
      12,
      14,
    ));

    turboGroup.add(tubeMesh(
      [
        new THREE.Vector3(0, 0.04, 0),
        new THREE.Vector3(-s * 0.02, 0.09, 0.0),
        new THREE.Vector3(-s * 0.06, 0.12, 0.03),
      ],
      0.005,
      matDarkCharcoal,
      10,
      6,
    ));

    const wastegateCan = createSketchMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.035, 18), matMachinedAlloy, 30);
    wastegateCan.position.set(s * 0.09, 0.07, 0.04);
    wastegateCan.rotation.z = Math.PI / 2;
    turboGroup.add(wastegateCan);
    const wastegateRod = createSketchMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.11, 6), matDarkCharcoal, 30);
    wastegateRod.position.set(s * 0.075, 0.045, -0.01);
    orientAlong(wastegateRod, new THREE.Vector3(-s * 0.01, -0.05, -0.1));
    turboGroup.add(wastegateRod);

    const downpipeLocal = (p: THREE.Vector3) => p.clone().sub(turboPos);
    turboGroup.add(tubeMesh(
      [
        downpipeLocal(new THREE.Vector3(s * 0.48, 0.0, -0.65)),
        downpipeLocal(new THREE.Vector3(s * 0.48, -0.04, -0.71)),
        downpipeLocal(new THREE.Vector3(s * 0.40, -0.10, -0.70)),
        downpipeLocal(new THREE.Vector3(s * 0.33, -0.13, -0.66)),
      ],
      0.034,
      matMachinedAlloy,
      18,
      14,
    ));

    engineMasterGroup.add(turboGroup);
    registerExplodable(
      turboGroup,
      new THREE.Vector3(s * 1.65, 0.48, -0.58),
      new THREE.Euler(0.18, s * 0.38, 0),
      'engine_parts',
    );
  });

  // --------------------------------------------------------------------------
  // 10H. PDK DUAL-CLUTCH TRANSAXLE
  // --------------------------------------------------------------------------
  const pdkGearboxGroup = new THREE.Group();
  pdkGearboxGroup.position.set(0, -0.05, 0.72);

  {
    const bellHousing = createSketchMesh(new THREE.CylinderGeometry(0.17, 0.23, 0.20, 32), matMachinedAlloy, 30);
    bellHousing.rotation.x = Math.PI / 2;
    bellHousing.position.z = -0.24;
    pdkGearboxGroup.add(bellHousing);
    const bellFlange = createSketchMesh(new THREE.TorusGeometry(0.232, 0.01, 8, 40), matMachinedAlloy, 30);
    bellFlange.position.z = -0.338;
    pdkGearboxGroup.add(bellFlange);
    for (let b = 0; b < 12; b++) {
      const a = (b / 12) * Math.PI * 2;
      addBolt(pdkGearboxGroup, new THREE.Vector3(Math.cos(a) * 0.232, Math.sin(a) * 0.232, -0.33), new THREE.Vector3(0, 0, 1), 0.008, 0.016);
    }

    const caseGeo = extrudeZ(roundedRectShape(0.34, 0.30, 0.06), 0.48);
    const gearCase = createSketchMesh(caseGeo, matDarkCharcoal);
    gearCase.position.z = 0.10;
    pdkGearboxGroup.add(gearCase);
    [-0.06, 0.08, 0.22].forEach((rz) => {
      const rib = createSketchMesh(extrudeZ(roundedRectShape(0.355, 0.315, 0.065), 0.012), matMachinedAlloy);
      rib.position.z = rz;
      pdkGearboxGroup.add(rib);
    });

    const diffHousing = createSketchMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.30, 32), matMachinedAlloy, 30);
    diffHousing.rotation.z = Math.PI / 2;
    diffHousing.position.set(0, -0.04, 0.02);
    pdkGearboxGroup.add(diffHousing);

    [-1, 1].forEach((sx) => {
      const outputFlange = createSketchMesh(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 24), matMachinedAlloy, 30);
      outputFlange.rotation.z = Math.PI / 2;
      outputFlange.position.set(sx * 0.16, -0.04, 0.02);
      pdkGearboxGroup.add(outputFlange);
      for (let b = 0; b < 6; b++) {
        const a = (b / 6) * Math.PI * 2;
        addBolt(
          pdkGearboxGroup,
          new THREE.Vector3(sx * 0.172, -0.04 + Math.sin(a) * 0.04, 0.02 + Math.cos(a) * 0.04),
          new THREE.Vector3(1, 0, 0),
          0.006,
          0.008,
        );
      }
      const cvJoint = createSketchMesh(new THREE.SphereGeometry(0.045, 18, 12), matDarkCharcoal, 30);
      cvJoint.scale.set(0.8, 1, 1);
      cvJoint.position.set(sx * 0.21, -0.04, 0.02);
      pdkGearboxGroup.add(cvJoint);
    });

    const mechatronicsPan = createSketchMesh(new THREE.BoxGeometry(0.26, 0.04, 0.34), matMachinedAlloy);
    mechatronicsPan.position.set(0, -0.17, 0.12);
    pdkGearboxGroup.add(mechatronicsPan);
    for (let f = -3; f <= 3; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.008, 0.008), matDarkCharcoal);
      fin.position.set(0, -0.192, 0.12 + f * 0.045);
      pdkGearboxGroup.add(fin);
    }

    const oilCooler = createSketchMesh(new THREE.BoxGeometry(0.03, 0.12, 0.16), matMachinedAlloy);
    oilCooler.position.set(0.186, 0.06, 0.20);
    pdkGearboxGroup.add(oilCooler);
    for (let f = 0; f < 6; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.004, 0.15), matDarkCharcoal);
      fin.position.set(0.186, 0.012 + f * 0.019, 0.20);
      pdkGearboxGroup.add(fin);
    }
  }

  engineMasterGroup.add(pdkGearboxGroup);
  registerExplodable(pdkGearboxGroup, new THREE.Vector3(0, -0.15, 0.95), new THREE.Euler(0.08, 0, 0), 'engine_parts');

  // --------------------------------------------------------------------------
  // 10I. REAR SILENCER & QUAD TAILPIPES
  // --------------------------------------------------------------------------
  const quadExhaustGroup = new THREE.Group();
  quadExhaustGroup.position.set(0, -0.17, -0.60);

  {
    const muffler = createSketchMesh(extrudeZ(roundedRectShape(0.72, 0.18, 0.07), 0.24), matMachinedAlloy);
    muffler.position.z = -0.06;
    quadExhaustGroup.add(muffler);
    [-0.18, 0.06].forEach((sz) => {
      const seam = createSketchMesh(extrudeZ(roundedRectShape(0.732, 0.192, 0.076), 0.012), matMachinedAlloy);
      seam.position.z = sz;
      quadExhaustGroup.add(seam);
    });
  }

  [-1, 1].forEach((s) => {
    [0.20, 0.30].forEach((tx) => {
      const tip = createSketchMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.08, 24, 1, true), matMachinedAlloy, 30);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(s * tx, 0, -0.22);
      quadExhaustGroup.add(tip);

      const tipRim = createSketchMesh(new THREE.TorusGeometry(0.042, 0.006, 8, 24), matPorscheBody, 30);
      tipRim.position.set(s * tx, 0, -0.26);
      quadExhaustGroup.add(tipRim);

      const innerPipe = new THREE.Mesh(new THREE.CircleGeometry(0.034, 20), matDarkCharcoal);
      innerPipe.position.set(s * tx, 0, -0.245);
      innerPipe.rotation.y = Math.PI;
      quadExhaustGroup.add(innerPipe);
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

    sharedGraphiteUniforms.uLightYaw.value = scrollState.lightYaw;

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
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      const drawingBuffer = renderer.getDrawingBufferSize(new THREE.Vector2());
      sharedGraphiteUniforms.uResolution.value.copy(drawingBuffer);
      sharedGraphiteUniforms.uPixelRatio.value = pixelRatio;
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
      hoodLettering.texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
