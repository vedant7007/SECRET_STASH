/**
 * RainShader.ts
 *
 * Volumetric rain effect with water ripples and reflections.
 * Each droplet carries weight, emotion, and gentle sorrow.
 */

import * as THREE from 'three';

export const rainShader = {
  vertexShader: `
    uniform float time;
    uniform float speed;

    attribute float size;
    attribute float phase;

    varying float vPhase;

    void main() {
      vPhase = phase;

      // Falling motion
      vec3 pos = position;
      pos.y -= mod(time * speed + phase * 100.0, 20.0);

      // Slight horizontal drift
      pos.x += sin(time * 0.5 + phase) * 0.3;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    varying float vPhase;

    void main() {
      // Elongated raindrop shape
      vec2 uv = gl_PointCoord;
      float dist = length(uv - vec2(0.5, 0.5));

      // Vertical stretch
      float elongation = abs(uv.y - 0.5) * 2.0;
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist + elongation * 0.5);

      // Subtle shimmer
      alpha *= 0.6 + 0.4 * sin(vPhase * 10.0);

      gl_FragColor = vec4(0.6, 0.7, 0.9, alpha * 0.4);
    }
  `,

  uniforms: {
    time: { value: 0 },
    speed: { value: 2.0 }
  }
};

export const waterRippleShader = {
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 reflectionColor;

    varying vec2 vUv;

    // Generate ripples at impact points
    float ripple(vec2 uv, vec2 center, float time, float speed) {
      float dist = distance(uv, center);
      float wave = sin(dist * 20.0 - time * speed) * 0.5 + 0.5;
      float falloff = 1.0 - smoothstep(0.0, 0.5, dist);

      return wave * falloff;
    }

    void main() {
      vec2 uv = vUv;

      // Multiple ripple sources
      float r1 = ripple(uv, vec2(0.3, 0.7), time, 5.0);
      float r2 = ripple(uv, vec2(0.7, 0.4), time + 1.5, 4.5);
      float r3 = ripple(uv, vec2(0.5, 0.5), time + 3.0, 6.0);

      float ripples = (r1 + r2 + r3) * 0.33;

      // Distort UV for reflection
      vec2 distortedUV = uv + vec2(
        ripples * 0.02 * sin(uv.y * 10.0),
        ripples * 0.02 * cos(uv.x * 10.0)
      );

      // Reflection with distortion
      vec3 reflection = reflectionColor * (0.5 + ripples * 0.5);

      // Add subtle water tint
      vec3 waterTint = mix(reflection, vec3(0.2, 0.3, 0.4), 0.3);

      float alpha = 0.6 + ripples * 0.2;

      gl_FragColor = vec4(waterTint, alpha);
    }
  `,

  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    reflectionColor: { value: new THREE.Color('#FFB6C1') }
  }
};

export default { rainShader, waterRippleShader };
