import type { Pack } from "./frames";

/**
 * WebGL scena, sve u jednom platnu, redom kako se crta:
 *  1. kadar snimka (dva susjedna kadra se pretapaju) sa efektom brzine,
 *  2. prašina koja leti ka kameri i oblak šarenih čestica oko svjetlosne ose,
 *  3. stakleni prstenovi (žiroskop) koji prelamaju snimak iza sebe,
 *  4. stakleni paneli sa sajtovima klijenata, poređani u spiralu oko ose.
 */

export type PanelPose = {
  /** redni broj projekta (i teksture) */
  index: number;
  x: number;
  y: number;
  z: number;
  /** rotacije u radijanima */
  ry: number;
  rx: number;
  width: number;
  alpha: number;
  /** 0 oštro, 1 mutno staklo */
  frost: number;
  /** 0–1, koliko je panel u fokusu */
  focus: number;
};

export type RingPose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  /** poluprečnik prstena */
  radius: number;
  /** debljina cijevi */
  tube: number;
  alpha: number;
  /** broj podioka po obodu (0 = glatko staklo) */
  ticks: number;
};

export type Color = [number, number, number];

export type StageInput = {
  time: number;
  /** pozicija u snimku, u kadrovima (može biti decimalna) */
  frame: number;
  direction: number;
  /** 0–1, jačina efekta brzine */
  speed: number;
  mouseX: number;
  mouseY: number;
  /** 0–1, zatamnjenje pozadine */
  dim: number;
  /** pređeni put, pomjera prašinu */
  travel: number;
  panels: PanelPose[];
  rings: RingPose[];
  /** tri boje čestica i dva ugaona odsjaja za trenutnu epohu */
  palette: [Color, Color, Color];
  glow: [Color, Color];
  swarm: { spin: number; x: number; y: number; z: number; radius: number; height: number; alpha: number };
  /** dubina ose spirale: paneli iza nje crtaju se prije prstenova */
  axisZ: number;
  /** trag miša: do 12 tačaka (x, y u 0–1 ekrana, jačina 0–1) */
  trail: Float32Array;
};

export type Rect = { x: number; y: number; w: number; h: number };

/** Odnos stranica panela (širina / visina), zajedno sa trakom na vrhu. */
export const PANEL_ASPECT = 1.66;
const BAR = 0.062;
const FOV = (40 * Math.PI) / 180;
const FOCUS_Z = 5;

/** Vidljiva visina i širina svijeta na daljini fokusa. */
export function viewSize(aspect: number) {
  const height = 2 * FOCUS_Z * Math.tan(FOV / 2);
  return { width: height * aspect, height, z: -FOCUS_Z };
}

/** Čitanje kadra snimka; isto koriste pozadina i staklo. */
const FRAME_GLSL = `
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;
uniform vec2 uRes;
uniform vec2 uTex;
uniform vec2 uMouse;
uniform float uSpeed;

vec3 shot(vec2 uv) {
  vec2 t = vec2(uv.x, 1.0 - uv.y);
  return mix(texture2D(uA, t).rgb, texture2D(uB, t).rgb, uMix);
}
// tačka na ekranu (0–1) → koordinata u kadru, mjereno od centra
vec2 frameUv(vec2 s) {
  float ra = uRes.x / uRes.y;
  float ta = uTex.x / uTex.y;
  vec2 fit = ra > ta ? vec2(1.0, ta / ra) : vec2(ra / ta, 1.0);
  vec2 c = s - 0.5;
  float zoom = 1.07 + uSpeed * 0.05;
  vec2 cuv = c * fit / zoom;
  // ivice se pomjeraju za mišem više od centra
  cuv -= uMouse * vec2(0.011, -0.011) * (0.5 + dot(c, c) * 2.2) * fit;
  return cuv;
}`;

const SCREEN_VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const SCREEN_FS = `
precision highp float;
${FRAME_GLSL}
uniform float uHas;
uniform float uTime;
uniform float uDim;
uniform vec3 uGlowA;
uniform vec3 uGlowB;
uniform vec3 uTrail[12];
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  // tečni trag miša: slika se razmiče oko tačaka kuda je miš prošao
  vec2 bend = vec2(0.0);
  float wake = 0.0;
  float ra0 = uRes.x / uRes.y;
  for (int i = 0; i < 12; i++) {
    vec3 tp = uTrail[i];
    if (tp.z <= 0.001) continue;
    vec2 dd = (vUv - tp.xy) * vec2(ra0, 1.0);
    float rr = dot(dd, dd);
    float f = exp(-rr * 90.0) * tp.z;
    bend += dd * f * 0.55;
    wake += f;
  }
  vec2 cuv = frameUv(vUv - bend / vec2(ra0, 1.0));

  // brzina: radijalno razvlačenje sa razdvajanjem boja
  float amount = uSpeed * (0.05 + r2 * 0.16);
  vec3 sum = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float k = float(i) / 4.0;
    vec3 w = vec3(1.0 - k, 1.0 - abs(2.0 * k - 1.0), k) + 0.3;
    sum += shot(cuv * (1.0 - amount * k) + 0.5) * w;
    weight += w;
  }
  vec3 col = sum / weight * uHas;

  col *= 1.0 + uSpeed * 0.25;
  float vignette = smoothstep(1.05, 0.2, length(c * vec2(1.05, 0.95)) * 1.25);
  col *= mix(0.55, 1.0, vignette);
  col *= 1.0 - uDim;
  // trag blago posvijetli i oboji ivicu talasa
  col += vec3(0.25, 0.45, 0.7) * smoothstep(0.0, 1.0, wake) * 0.12;
  // obojeni odsjaji u uglovima, boja prati epohu
  col += uGlowA * exp(-distance(vUv, vec2(1.0, 1.0)) * 2.4);
  col += uGlowB * exp(-distance(vUv, vec2(0.0, 0.0)) * 2.8);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * 0.045;
  gl_FragColor = vec4(col, 1.0);
}`;

const PANEL_VS = `
attribute vec2 aPos;
uniform mat4 uMvp;
uniform vec2 uSize;
uniform float uBend;
varying vec2 vUv;
void main() {
  vec3 p = vec3(aPos * uSize, 0.0);
  p.z += uBend * aPos.x * aPos.x * uSize.x;
  vUv = aPos + 0.5;
  gl_Position = uMvp * vec4(p, 1.0);
}`;

const PANEL_FS = `
precision highp float;
uniform sampler2D uTex;
uniform float uAlpha;
uniform float uFrost;
uniform float uFocus;
uniform float uSpeed;
uniform float uAa;
uniform vec2 uCrop;
uniform vec3 uTint;
varying vec2 vUv;

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 asp = vec2(${PANEL_ASPECT.toFixed(3)}, 1.0);
  vec2 p = (vUv - 0.5) * asp;
  float d = box(p, 0.5 * asp, 0.045);
  float mask = 1.0 - smoothstep(-uAa, uAa, d);

  vec3 col;
  float bar = ${BAR.toFixed(3)};
  if (!gl_FrontFacing) {
    // poleđina: tamno mutno staklo
    col = vec3(0.05, 0.065, 0.09) + uTint * 0.12;
  } else if (vUv.y > 1.0 - bar) {
    col = vec3(0.045, 0.058, 0.078);
    vec2 q = vec2(vUv.x * asp.x, vUv.y - (1.0 - bar * 0.5));
    for (int i = 0; i < 3; i++) {
      float dotd = length(q - vec2(0.05 + float(i) * 0.03, 0.0));
      col += (1.0 - smoothstep(0.007, 0.007 + uAa, dotd)) * vec3(0.2, 0.26, 0.34);
    }
  } else {
    vec2 t = vec2(vUv.x, 1.0 - vUv.y / (1.0 - bar));
    t = vec2((t.x - 0.5) * uCrop.x + 0.5, t.y * uCrop.y);
    float shift = uSpeed * 0.012;
    // mutno staklo: čita se manja, zamućena verzija slike
    float blur = uFrost * 4.5;
    col.r = texture2D(uTex, t + vec2(0.0, shift), blur).r;
    col.g = texture2D(uTex, t, blur).g;
    col.b = texture2D(uTex, t - vec2(0.0, shift), blur).b;
    col = mix(col, col * 0.55 + uTint * 0.16, uFrost);
  }

  // svijetla staklena ivica, jača kad je panel u fokusu
  float rim = smoothstep(-0.02, -0.002, d);
  col += rim * mix(vec3(0.42, 0.6, 0.85), uTint, 0.35) * (0.3 + uFocus * 0.4);
  // odsjaj koji klizi preko stakla
  float sweep = smoothstep(0.12, 0.0, abs(vUv.x + vUv.y * 0.35 - 0.25 - uFocus * 0.35));
  col += sweep * 0.05;

  float a = uAlpha * mask;
  gl_FragColor = vec4(col * a, a);
}`;

const GLOW_FS = `
precision mediump float;
uniform float uAlpha;
uniform vec3 uTint;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float g = exp(-dot(p, p) * 3.2);
  gl_FragColor = vec4(uTint * g * uAlpha, 0.0);
}`;

const DUST_VS = `
attribute vec3 aPos;
attribute float aSeed;
uniform float uTime;
uniform float uTravel;
uniform float uAspect;
uniform float uSpeed;
uniform float uScale;
uniform vec2 uMouse;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec4 vCol;
void main() {
  float z = fract(aPos.z - uTravel);
  float depth = mix(9.0, 0.45, z * z);
  vec2 xy = aPos.xy * vec2(uAspect, 1.0) * 2.4;
  xy += vec2(sin(uTime * 0.21 + aSeed * 6.2831), cos(uTime * 0.17 + aSeed * 4.0)) * 0.05;
  xy -= uMouse * (0.08 + z * 0.5);
  vec2 projected = xy / depth;
  gl_Position = vec4(projected.x / uAspect, projected.y, 0.0, 1.0);
  float size = (1.2 + aSeed * 2.4) / depth * uScale * (1.0 + uSpeed * 2.5);
  gl_PointSize = clamp(size, 1.0, 90.0);
  float fade = smoothstep(0.0, 0.12, z) * (1.0 - smoothstep(0.9, 1.0, z));
  float defocus = 1.0 / (1.0 + size * size * 0.012);
  vCol = vec4(mix(uColA, uColB, step(0.6, aSeed)), fade * defocus * (0.35 + aSeed * 0.65));
}`;

/** Oblak čestica koji kruži oko svjetlosne ose, sa pravom perspektivom. */
const SWARM_VS = `
attribute vec4 aP;
uniform mat4 uProj;
uniform float uSpin;
uniform vec3 uAxis;
uniform float uRadius;
uniform float uHeight;
uniform float uTime;
uniform float uPx;
uniform float uAlpha;
uniform vec2 uRange;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
varying vec4 vCol;
void main() {
  float seed = aP.w;
  float angle = aP.x + uSpin * (0.55 + 0.9 * fract(seed * 7.31)) + uTime * 0.04 * (seed - 0.5);
  float radius = uRadius * (0.22 + aP.y * aP.y * 1.5);
  vec3 p = uAxis + vec3(
    sin(angle) * radius,
    aP.z * uHeight + sin(uTime * 0.2 + seed * 40.0) * 0.06,
    cos(angle) * radius
  );
  gl_Position = uProj * vec4(p, 1.0);
  float depth = -p.z;
  float blur = abs(depth - ${FOCUS_Z.toFixed(1)});
  float size = (1.6 + 4.4 * fract(seed * 3.7)) * (1.0 + blur * 0.85);
  gl_PointSize = clamp(size * uPx * 5.0 / max(depth, 0.3), 1.0, 64.0 * uPx);
  float a = (0.25 + 0.75 * fract(seed * 5.3)) / (1.0 + blur * blur * 0.4);
  a *= smoothstep(0.3, 1.4, depth) * step(uRange.x, depth) * step(depth, uRange.y);
  vec3 col = seed < 0.34 ? uColA : (seed < 0.67 ? uColB : uColC);
  vCol = vec4(col, a * uAlpha);
}`;

const BOKEH_FS = `
precision mediump float;
varying vec4 vCol;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float disc = smoothstep(1.0, 0.8, d);
  float edge = 0.55 + 0.6 * smoothstep(0.5, 0.95, d);
  float a = disc * edge * vCol.a;
  gl_FragColor = vec4(vCol.rgb * a, 0.0);
}`;

const RING_VS = `
attribute vec3 aRing;
attribute vec3 aNormal;
uniform mat4 uProj;
uniform mat4 uModel;
uniform float uRadius;
uniform float uTube;
varying vec3 vN;
varying vec3 vP;
varying vec3 vRim;
void main() {
  vec4 world = uModel * vec4(aRing * uRadius + aNormal * uTube, 1.0);
  vN = (uModel * vec4(aNormal, 0.0)).xyz;
  vP = world.xyz;
  // smjer po obodu i koliko tačka gleda ka spolja
  vRim = vec3(aRing.xy, dot(aNormal, aRing));
  gl_Position = uProj * world;
}`;

/** Staklo: prelama snimak iza sebe, sa duginim prelivima na ivicama. */
const RING_FS = `
precision highp float;
${FRAME_GLSL}
uniform float uTime;
uniform float uAlpha;
uniform float uDim;
uniform float uClip;
uniform float uClipZ;
uniform float uTicks;
uniform vec3 uTint;
varying vec3 vN;
varying vec3 vP;
varying vec3 vRim;
void main() {
  if (uClip > 0.5 && vP.z < uClipZ) discard;
  if (uClip < -0.5 && vP.z >= uClipZ) discard;
  vec3 n = normalize(vN);
  vec3 v = normalize(-vP);
  float facing = max(dot(n, v), 0.0);
  float fresnel = pow(1.0 - facing, 2.2);

  vec2 s = gl_FragCoord.xy / uRes;
  vec2 bend = n.xy * (0.035 + 0.07 * fresnel);
  vec3 back;
  back.r = shot(frameUv(s + bend * 1.25) + 0.5).r;
  back.g = shot(frameUv(s + bend) + 0.5).g;
  back.b = shot(frameUv(s + bend * 0.75) + 0.5).b;

  vec3 rainbow = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + facing * 1.7 + n.y * 0.45 + uTime * 0.03));
  vec3 h1 = normalize(normalize(vec3(0.5, 0.8, 0.6)) + v);
  vec3 h2 = normalize(normalize(vec3(-0.7, -0.35, 0.5)) + v);
  float spec = pow(max(dot(n, h1), 0.0), 70.0) + 0.5 * pow(max(dot(n, h2), 0.0), 40.0);

  vec3 col = back * (0.9 + 0.5 * fresnel) * (1.0 - uDim * 0.5);
  col += rainbow * fresnel * 0.5;
  col += uTint * (0.08 + fresnel * 0.35);
  col += vec3(1.0) * spec * 0.9;
  // podioci na spoljnoj strani prstena, kao na brojčaniku sata
  if (uTicks > 0.5) {
    float around = atan(vRim.y, vRim.x) / 6.2831853;
    float tick = smoothstep(0.34, 0.46, abs(fract(around * uTicks) - 0.5));
    col *= 1.0 - tick * 0.5 * smoothstep(0.1, 0.7, vRim.z);
  }
  gl_FragColor = vec4(col * uAlpha, uAlpha);
}`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;

function program(gl: GL, vs: string, fs: string) {
  const make = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("[WebEra] shader:", gl.getShaderInfoLog(shader));
    }
    return shader;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(prog, i);
    if (info) uniforms[info.name] = gl.getUniformLocation(prog, info.name);
  }
  return { prog, u: uniforms };
}

// 4x4 matrice, po kolonama
function multiply(a: Float32Array, b: Float32Array, out: Float32Array) {
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

export function createStage(canvas: HTMLCanvasElement) {
  const options = { alpha: false, antialias: true, powerPreference: "high-performance" } as const;
  const gl = (canvas.getContext("webgl2", options) || canvas.getContext("webgl", options)) as GL | null;
  if (!gl) return null;
  const gl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
  const small = window.innerWidth < 768;

  const screen = program(gl, SCREEN_VS, SCREEN_FS);
  const panel = program(gl, PANEL_VS, PANEL_FS);
  const glow = program(gl, PANEL_VS, GLOW_FS);
  const dust = program(gl, DUST_VS, BOKEH_FS);
  const swarm = program(gl, SWARM_VS, BOKEH_FS);
  const ring = program(gl, RING_VS, RING_FS);

  const buffer = (data: number[] | Float32Array) => {
    const handle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, handle);
    gl.bufferData(gl.ARRAY_BUFFER, data instanceof Float32Array ? data : new Float32Array(data), gl.STATIC_DRAW);
    return handle;
  };

  // geometrija
  const triangle = buffer([-1, -1, 3, -1, -1, 3]);

  const SEG = 24;
  const gridData: number[] = [];
  for (let i = 0; i < SEG; i++) {
    const x0 = i / SEG - 0.5;
    const x1 = (i + 1) / SEG - 0.5;
    gridData.push(x0, -0.5, x1, -0.5, x0, 0.5, x0, 0.5, x1, -0.5, x1, 0.5);
  }
  const grid = buffer(gridData);

  const dustCount = small ? 320 : 700;
  const dustData = new Float32Array(dustCount * 4);
  for (let i = 0; i < dustData.length; i++) {
    dustData[i] = i % 4 < 2 ? Math.random() * 2 - 1 : Math.random();
  }
  const dustBuffer = buffer(dustData);

  const swarmCount = small ? 700 : 1700;
  const swarmData = new Float32Array(swarmCount * 4);
  for (let i = 0; i < swarmCount; i++) {
    swarmData[i * 4] = Math.random() * Math.PI * 2;
    swarmData[i * 4 + 1] = Math.random();
    // gušće oko sredine visine
    swarmData[i * 4 + 2] = (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
    swarmData[i * 4 + 3] = Math.random();
  }
  const swarmBuffer = buffer(swarmData);

  // prsten: tačka na kružnici + smjer od ose cijevi
  const MAJOR = small ? 72 : 110;
  const MINOR = 14;
  const ringData: number[] = [];
  const ringPoint = (i: number, j: number) => {
    const a = (i / MAJOR) * Math.PI * 2;
    const b = (j / MINOR) * Math.PI * 2;
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    ringData.push(cx, cy, 0, cx * Math.cos(b), cy * Math.cos(b), Math.sin(b));
  };
  for (let i = 0; i < MAJOR; i++) {
    for (let j = 0; j < MINOR; j++) {
      ringPoint(i, j);
      ringPoint(i + 1, j);
      ringPoint(i, j + 1);
      ringPoint(i, j + 1);
      ringPoint(i + 1, j);
      ringPoint(i + 1, j + 1);
    }
  }
  const ringBuffer = buffer(ringData);
  const ringVertices = MAJOR * MINOR * 6;

  // teksture
  const makeTexture = () => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([5, 6, 8, 255]));
    return texture;
  };
  const upload = (texture: WebGLTexture, source: TexImageSource) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  /** Dva mjesta za kadrove snimka. -1 znači prazno, -2 je početna slika. */
  const slots = [
    { texture: makeTexture(), index: -1, width: 16, height: 9 },
    { texture: makeTexture(), index: -1, width: 16, height: 9 },
  ];
  const shown = { a: 0, b: 0, mix: 0, has: 0 };

  const works: { texture: WebGLTexture; aspect: number; ready: boolean }[] = [];
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");

  let pack: Pack | null = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  const projection = new Float32Array(16);
  const model = new Float32Array(16);
  const mvp = new Float32Array(16);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, w < 768 ? 2 : 1.5);
    if (w === width && h === height && ratio === dpr) return;
    width = w;
    height = h;
    dpr = ratio;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const f = 1 / Math.tan(FOV / 2);
    const near = 0.1;
    const far = 80;
    projection.fill(0);
    projection[0] = f / (w / h);
    projection[5] = f;
    projection[10] = (far + near) / (near - far);
    projection[11] = -1;
    projection[14] = (2 * far * near) / (near - far);
  }

  /** model = pomjeranje * rotacija oko Y * rotacija oko X */
  function place(x: number, y: number, z: number, ry: number, rx: number) {
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    model[0] = cy;
    model[1] = 0;
    model[2] = -sy;
    model[3] = 0;
    model[4] = sy * sx;
    model[5] = cx;
    model[6] = cy * sx;
    model[7] = 0;
    model[8] = sy * cx;
    model[9] = -sx;
    model[10] = cy * cx;
    model[11] = 0;
    model[12] = x;
    model[13] = y;
    model[14] = z;
    model[15] = 1;
    multiply(projection, model, mvp);
  }

  /** Gdje je panel na ekranu (u CSS pikselima). */
  function project(pose: PanelPose): Rect | null {
    place(pose.x, pose.y, pose.z, pose.ry, pose.rx);
    const hw = pose.width / 2;
    const hh = pose.width / PANEL_ASPECT / 2;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 4; i++) {
      const px = i % 2 ? hw : -hw;
      const py = i < 2 ? hh : -hh;
      const cw = mvp[3] * px + mvp[7] * py + mvp[15];
      if (cw <= 0.01) return null;
      const sx = ((mvp[0] * px + mvp[4] * py + mvp[12]) / cw) * 0.5 + 0.5;
      const sy = 0.5 - ((mvp[1] * px + mvp[5] * py + mvp[13]) / cw) * 0.5;
      minX = Math.min(minX, sx);
      maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy);
      maxY = Math.max(maxY, sy);
    }
    return {
      x: minX * width,
      y: minY * height,
      w: (maxX - minX) * width,
      h: (maxY - minY) * height,
    };
  }

  function pickFrames(input: StageInput) {
    if (!pack || pack.count === 0 || pack.available === 0) return;
    const last = pack.available - 1;
    const position = Math.min(Math.max(input.frame, 0), last);
    const i0 = Math.floor(position);
    const i1 = Math.min(i0 + 1, last);
    pack.want(i0, input.direction);

    const find = (index: number) =>
      slots[0].index === index ? 0 : slots[1].index === index ? 1 : -1;
    let s0 = find(i0);
    let s1 = find(i1);
    if (s0 < 0) {
      const bitmap = pack.get(i0);
      if (bitmap) {
        s0 = s1 === 0 ? 1 : 0;
        upload(slots[s0].texture, bitmap);
        Object.assign(slots[s0], { index: i0, width: bitmap.width, height: bitmap.height });
      }
    }
    if (s1 < 0 && i1 !== i0) {
      const bitmap = pack.get(i1);
      if (bitmap && s0 >= 0) {
        s1 = s0 === 0 ? 1 : 0;
        upload(slots[s1].texture, bitmap);
        Object.assign(slots[s1], { index: i1, width: bitmap.width, height: bitmap.height });
      }
    }
    if (s0 >= 0 && s1 >= 0 && s0 !== s1) {
      shown.a = s0;
      shown.b = s1;
      shown.mix = position - i0;
      shown.has = 1;
    } else if (s0 >= 0 || s1 >= 0) {
      shown.a = shown.b = s0 >= 0 ? s0 : s1;
      shown.mix = 0;
      shown.has = 1;
    }
  }

  function attribute(prog: WebGLProgram, name: string, size: number, stride: number, offset: number) {
    const location = gl!.getAttribLocation(prog, name);
    if (location < 0) return;
    gl!.enableVertexAttribArray(location);
    gl!.vertexAttribPointer(location, size, gl!.FLOAT, false, stride, offset);
  }

  /** Uniforme za čitanje kadra (pozadina i staklo). */
  function frameUniforms(u: Record<string, WebGLUniformLocation | null>, input: StageInput) {
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, slots[shown.a].texture);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, slots[shown.b].texture);
    gl!.uniform1i(u.uA, 0);
    gl!.uniform1i(u.uB, 1);
    gl!.uniform1f(u.uMix, shown.mix);
    gl!.uniform2f(u.uRes, canvas.width, canvas.height);
    gl!.uniform2f(u.uTex, slots[shown.a].width, slots[shown.a].height);
    gl!.uniform2f(u.uMouse, input.mouseX, input.mouseY);
    gl!.uniform1f(u.uSpeed, input.speed);
  }

  function drawSwarm(input: StageInput, near: number, far: number) {
    gl!.blendFunc(gl!.ONE, gl!.ONE);
    gl!.useProgram(swarm.prog);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, swarmBuffer);
    attribute(swarm.prog, "aP", 4, 0, 0);
    gl!.uniformMatrix4fv(swarm.u.uProj, false, projection);
    gl!.uniform1f(swarm.u.uSpin, input.swarm.spin);
    gl!.uniform3f(swarm.u.uAxis, input.swarm.x, input.swarm.y, input.swarm.z);
    gl!.uniform1f(swarm.u.uRadius, input.swarm.radius);
    gl!.uniform1f(swarm.u.uHeight, input.swarm.height);
    gl!.uniform1f(swarm.u.uTime, input.time);
    gl!.uniform1f(swarm.u.uPx, canvas.height / 900);
    gl!.uniform1f(swarm.u.uAlpha, input.swarm.alpha);
    gl!.uniform2f(swarm.u.uRange, near, far);
    gl!.uniform3fv(swarm.u.uColA, input.palette[0]);
    gl!.uniform3fv(swarm.u.uColB, input.palette[1]);
    gl!.uniform3fv(swarm.u.uColC, input.palette[2]);
    gl!.drawArrays(gl!.POINTS, 0, swarmCount);
  }

  function drawRings(input: StageInput, clip: number) {
    gl!.enable(gl!.CULL_FACE);
    gl!.cullFace(gl!.BACK);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(ring.prog);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, ringBuffer);
    attribute(ring.prog, "aRing", 3, 24, 0);
    attribute(ring.prog, "aNormal", 3, 24, 12);
    frameUniforms(ring.u, input);
    gl!.uniformMatrix4fv(ring.u.uProj, false, projection);
    gl!.uniform1f(ring.u.uTime, input.time);
    gl!.uniform1f(ring.u.uDim, input.dim);
    gl!.uniform1f(ring.u.uClip, clip);
    gl!.uniform3fv(ring.u.uTint, input.palette[0]);
    for (const pose of input.rings) {
      if (pose.alpha < 0.004) continue;
      place(pose.x, pose.y, pose.z, pose.ry, pose.rx);
      gl!.uniformMatrix4fv(ring.u.uModel, false, model);
      gl!.uniform1f(ring.u.uRadius, pose.radius);
      gl!.uniform1f(ring.u.uTube, pose.tube);
      gl!.uniform1f(ring.u.uAlpha, pose.alpha);
      gl!.uniform1f(ring.u.uClipZ, pose.z);
      gl!.uniform1f(ring.u.uTicks, pose.ticks);
      gl!.drawArrays(gl!.TRIANGLES, 0, ringVertices);
    }
    gl!.disable(gl!.CULL_FACE);
  }

  function drawPanels(input: StageInput, panels: PanelPose[]) {
    gl!.bindBuffer(gl!.ARRAY_BUFFER, grid);
    for (const pose of panels) {
      place(pose.x, pose.y, pose.z, pose.ry, pose.rx);
      const h = pose.width / PANEL_ASPECT;
      const bend = 0.07 + input.speed * 0.3;

      if (pose.focus > 0.02) {
        gl!.blendFunc(gl!.ONE, gl!.ONE);
        gl!.useProgram(glow.prog);
        attribute(glow.prog, "aPos", 2, 0, 0);
        gl!.uniformMatrix4fv(glow.u.uMvp, false, mvp);
        gl!.uniform2f(glow.u.uSize, pose.width * 1.9, h * 2.1);
        gl!.uniform1f(glow.u.uBend, 0);
        gl!.uniform1f(glow.u.uAlpha, pose.focus * pose.alpha * 0.3);
        gl!.uniform3fv(glow.u.uTint, input.palette[1]);
        gl!.drawArrays(gl!.TRIANGLES, 0, SEG * 6);
      }

      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.useProgram(panel.prog);
      attribute(panel.prog, "aPos", 2, 0, 0);
      const work = works[pose.index];
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, work.texture);
      gl!.uniform1i(panel.u.uTex, 0);
      gl!.uniformMatrix4fv(panel.u.uMvp, false, mvp);
      gl!.uniform2f(panel.u.uSize, pose.width, h);
      gl!.uniform1f(panel.u.uBend, bend);
      gl!.uniform1f(panel.u.uAlpha, pose.alpha);
      gl!.uniform1f(panel.u.uFrost, gl2 ? pose.frost : pose.frost * 0.4);
      gl!.uniform1f(panel.u.uFocus, pose.focus);
      gl!.uniform1f(panel.u.uSpeed, input.speed);
      gl!.uniform3fv(panel.u.uTint, input.palette[1]);
      // visina panela na ekranu u pikselima, za meke ivice
      const pixels = (h / Math.max(0.5, -pose.z)) * (canvas.height / (2 * Math.tan(FOV / 2)));
      gl!.uniform1f(panel.u.uAa, Math.min(0.02, 1.2 / Math.max(pixels, 1)));
      // slika popunjava panel bez razvlačenja: višak se sječe odozdo ili sa strana
      const area = PANEL_ASPECT / (1 - BAR);
      gl!.uniform2f(panel.u.uCrop, Math.min(1, area / work.aspect), Math.min(1, work.aspect / area));
      gl!.drawArrays(gl!.TRIANGLES, 0, SEG * 6);
    }
  }

  function render(input: StageInput) {
    resize();
    pickFrames(input);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.disable(gl!.DEPTH_TEST);
    gl!.disable(gl!.CULL_FACE);

    // 1. kadar snimka
    gl!.disable(gl!.BLEND);
    gl!.useProgram(screen.prog);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, triangle);
    attribute(screen.prog, "aPos", 2, 0, 0);
    frameUniforms(screen.u, input);
    gl!.uniform1f(screen.u.uHas, shown.has);
    gl!.uniform1f(screen.u.uTime, input.time);
    gl!.uniform1f(screen.u.uDim, input.dim);
    gl!.uniform3fv(screen.u.uGlowA, input.glow[0]);
    gl!.uniform3fv(screen.u.uGlowB, input.glow[1]);
    gl!.uniform3fv(screen.u['uTrail[0]'] ?? screen.u.uTrail, input.trail);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    // 2. prašina i daleke čestice
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE);
    gl!.useProgram(dust.prog);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, dustBuffer);
    attribute(dust.prog, "aPos", 3, 16, 0);
    attribute(dust.prog, "aSeed", 1, 16, 12);
    gl!.uniform1f(dust.u.uTime, input.time);
    gl!.uniform1f(dust.u.uTravel, input.travel);
    gl!.uniform1f(dust.u.uAspect, canvas.width / canvas.height);
    gl!.uniform1f(dust.u.uSpeed, input.speed);
    gl!.uniform1f(dust.u.uScale, (canvas.height / 900) * 1.6);
    gl!.uniform2f(dust.u.uMouse, input.mouseX, -input.mouseY);
    gl!.uniform3fv(dust.u.uColA, input.palette[2]);
    gl!.uniform3fv(dust.u.uColB, input.palette[0]);
    gl!.drawArrays(gl!.POINTS, 0, dustCount);
    const split = FOCUS_Z - 0.6;
    drawSwarm(input, split, 60);

    // 3. i 4. staklo i paneli, od najdaljeg ka najbližem
    const visible = input.panels
      .filter((pose) => pose.alpha > 0.003 && works[pose.index]?.ready)
      .sort((a, b) => a.z - b.z);
    drawRings(input, -1);
    drawPanels(input, visible.filter((pose) => pose.z < input.axisZ));
    drawRings(input, 1);
    drawPanels(input, visible.filter((pose) => pose.z >= input.axisZ));

    // čestice ispred svega, blizu kamere
    drawSwarm(input, 0, split);
  }

  return {
    render,
    project,
    setPack(next: Pack) {
      pack = next;
    },
    /** Slika koja se vidi dok kadrovi ne stignu. */
    setPoster(image: HTMLImageElement) {
      if (shown.has) return;
      upload(slots[0].texture, image);
      Object.assign(slots[0], { index: -2, width: image.naturalWidth, height: image.naturalHeight });
      shown.a = shown.b = 0;
      shown.has = 1;
    },
    setWork(index: number, image: HTMLImageElement) {
      const texture = works[index]?.texture || makeTexture();
      upload(texture, image);
      if (gl2) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      }
      if (anisotropy) {
        gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      }
      works[index] = { texture, aspect: image.naturalWidth / image.naturalHeight, ready: true };
    },
  };
}

export type Stage = NonNullable<ReturnType<typeof createStage>>;
