/**
 * ShaderLibrary.ts
 *
 * Custom GLSL shaders for volumetric effects, aurora fields, and atmospheric rendering.
 * Each shader is crafted to evoke specific emotional responses.
 */

import * as THREE from 'three';

/**
 * Aurora Borealis Shader
 * Creates flowing, ethereal light curtains that shift with time
 */
export const auroraShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float intensity;

    varying vec2 vUv;
    varying vec3 vPosition;

    // Noise function for organic flow
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 5; i++) {
        value += amplitude * smoothNoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    void main() {
      // Create flowing aurora waves
      vec2 p = vUv * 3.0;
      p.x += time * 0.1;
      p.y += sin(p.x * 2.0 + time * 0.3) * 0.3;

      float n = fbm(p);

      // Layer multiple waves
      float wave1 = sin(vUv.y * 10.0 + time * 0.5 + n * 3.0) * 0.5 + 0.5;
      float wave2 = sin(vUv.y * 7.0 - time * 0.3 + n * 2.0) * 0.5 + 0.5;
      float wave3 = sin(vUv.y * 5.0 + time * 0.7 + n * 4.0) * 0.5 + 0.5;

      // Combine waves with different colors
      vec3 finalColor = color1 * wave1 + color2 * wave2 + color3 * wave3;

      // Fade at edges for ethereal effect
      float edgeFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

      float alpha = (wave1 + wave2 + wave3) * 0.33 * edgeFade * intensity;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,

  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color('#FFB6C1') },
    color2: { value: new THREE.Color('#8A4FFF') },
    color3: { value: new THREE.Color('#80F5FF') },
    intensity: { value: 0.6 }
  }
};

/**
 * Volumetric Light Rays Shader
 * God rays that emanate from a central point
 */
export const volumetricLightShader = {
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec2 lightPosition;
    uniform vec3 lightColor;
    uniform float intensity;
    uniform float rayDensity;

    varying vec2 vUv;

    void main() {
      vec2 toLight = lightPosition - vUv;
      float distance = length(toLight);
      vec2 direction = normalize(toLight);

      // Sample along the ray
      float illumination = 0.0;
      int samples = 50;

      for (int i = 0; i < 50; i++) {
        float t = float(i) / float(samples);
        vec2 samplePos = vUv + direction * t * distance;

        // Radial falloff
        float falloff = 1.0 - length(samplePos - lightPosition) / 1.5;
        falloff = max(0.0, falloff);

        // Animated rays
        float ray = sin(atan(samplePos.y - lightPosition.y, samplePos.x - lightPosition.x) * rayDensity + time) * 0.5 + 0.5;

        illumination += falloff * ray * (1.0 - t);
      }

      illumination /= float(samples);

      vec3 finalColor = lightColor * illumination * intensity;
      float alpha = illumination * 0.5;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,

  uniforms: {
    time: { value: 0 },
    lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
    lightColor: { value: new THREE.Color('#FFCBA4') },
    intensity: { value: 1.0 },
    rayDensity: { value: 12.0 }
  }
};

/**
 * Nebula Cloud Shader
 * Organic, swirling cosmic clouds
 */
export const nebulaShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float scale;
    uniform float density;

    varying vec2 vUv;

    // 3D Simplex-like noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float turbulence(vec3 p) {
      float value = 0.0;
      float amplitude = 1.0;
      float frequency = 1.0;

      for (int i = 0; i < 6; i++) {
        value += amplitude * abs(snoise(p * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    void main() {
      vec3 p = vec3(vUv * scale, time * 0.1);

      // Multiple layers of turbulence
      float n1 = turbulence(p);
      float n2 = turbulence(p * 2.0 + vec3(100.0));

      float combined = n1 * 0.6 + n2 * 0.4;

      // Color mixing based on noise
      vec3 finalColor = mix(color1, color2, combined);

      // Add swirling effect
      float swirl = sin(combined * 6.28 + time * 0.5) * 0.5 + 0.5;
      finalColor = mix(finalColor, color1 * 1.5, swirl * 0.3);

      float alpha = combined * density;
      alpha = smoothstep(0.2, 0.8, alpha);

      gl_FragColor = vec4(finalColor, alpha * 0.7);
    }
  `,

  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color('#8A4FFF') },
    color2: { value: new THREE.Color('#FFB6C1') },
    scale: { value: 2.0 },
    density: { value: 1.2 }
  }
};

/**
 * Particle Glow Shader
 * For individual glowing particles with soft falloff
 */
export const particleGlowShader = {
  vertexShader: `
    uniform float size;
    uniform float time;

    attribute float intensity;
    attribute float phase;

    varying float vIntensity;

    void main() {
      vIntensity = intensity * (0.8 + 0.2 * sin(time * 2.0 + phase));

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * vIntensity * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 color;
    uniform sampler2D texture;

    varying float vIntensity;

    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);

      // Soft circular gradient
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha = pow(alpha, 2.0);

      vec3 glowColor = color * (1.0 + vIntensity * 0.5);

      gl_FragColor = vec4(glowColor, alpha * vIntensity);
    }
  `,

  uniforms: {
    color: { value: new THREE.Color('#FFB6C1') },
    size: { value: 30.0 },
    time: { value: 0 },
    texture: { value: null }
  }
};

export default {
  auroraShader,
  volumetricLightShader,
  nebulaShader,
  particleGlowShader
};
