import * as THREE from './vendor/three-0.185.1.module.min.js';

const COLORS = [0xd8ff36, 0x53e5ff, 0xff5d3d, 0xf3f0e8];

function createCloud(count, spread, pointSize) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const speeds = new Float32Array(count);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.pow(Math.random(), 0.72);
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius * spread.x + (Math.random() - 0.5) * 2;
    const y = Math.sin(angle) * radius * spread.y + (Math.random() - 0.5) * 1.5;
    const z = -32 + Math.random() * 40;

    positions[offset] = origins[offset] = x;
    positions[offset + 1] = origins[offset + 1] = y;
    positions[offset + 2] = origins[offset + 2] = z;
    sizes[index] = pointSize * (0.55 + Math.pow(Math.random(), 2) * 1.65);
    speeds[index] = 0.018 + Math.random() * 0.055;

    color.setHex(COLORS[Math.floor(Math.random() * COLORS.length)]);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0.78 },
      uScale: { value: 1 },
    },
    vertexShader: `
      attribute float aSize;
      uniform float uScale;
      varying vec3 vColor;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        gl_PointSize = aSize * uScale / max(-viewPosition.z, 1.0);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vColor;

      void main() {
        float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
        float edge = 1.0 - smoothstep(0.42, 0.5, distanceFromCenter);
        if (edge <= 0.0) discard;
        gl_FragColor = vec4(vColor, uOpacity * edge);
      }
    `,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
    positions,
    origins,
    speeds,
    count,
  };
}

function createExplosionDust(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uScale: { value: 1 },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      uniform float uScale;
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        vOpacity = aOpacity;
        gl_PointSize = aSize * uScale / max(-viewPosition.z, 1.0);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
        float edge = 1.0 - smoothstep(0.22, 0.5, distanceFromCenter);
        if (edge <= 0.0) discard;
        gl_FragColor = vec4(vColor, vOpacity * edge);
      }
    `,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
    positions,
    colors,
    sizes,
    opacities,
    velocities: new Float32Array(count * 3),
    winds: new Float32Array(count * 2),
    turbulence: new Float32Array(count),
    phases: new Float32Array(count),
    ages: new Float32Array(count),
    lifetimes: new Float32Array(count),
    cursor: 0,
    count,
  };
}

function createExplosionFlashes(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uScale: { value: 1 },
      uColor: { value: new THREE.Color(0xfff5a6) },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      uniform float uScale;
      varying float vOpacity;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vOpacity = aOpacity;
        gl_PointSize = aSize * uScale / max(-viewPosition.z, 1.0);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vOpacity;

      void main() {
        float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
        float glow = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
        gl_FragColor = vec4(uColor, vOpacity * glow * glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    geometry,
    material,
    positions,
    sizes,
    opacities,
    ages: new Float32Array(count),
    lifetimes: new Float32Array(count),
    cursor: 0,
    count,
  };
}

export function initParticleField(container, { reducedMotion = false } = {}) {
  if (!container) return null;

  const interactionTarget = container.closest('.hero') || container;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
  } catch {
    container.dataset.webgl = 'unavailable';
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 80);
  camera.position.set(0, 0, 10);
  scene.fog = new THREE.FogExp2(0x090909, 0.026);

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const dust = createCloud(mobile ? 2200 : 5200, { x: 15, y: 9 }, mobile ? 0.075 : 0.095);
  const asteroids = createCloud(mobile ? 45 : 90, { x: 13, y: 8 }, mobile ? 0.18 : 0.26);
  asteroids.material.uniforms.uOpacity.value = 0.68;
  const explosionDust = createExplosionDust(mobile ? 2000 : 4800);
  const explosionFlashes = createExplosionFlashes(8);
  scene.add(dust.points, asteroids.points, explosionDust.points, explosionFlashes.points);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const pointer = new THREE.Vector2(0.68, 0.04);
  const pointerTarget = new THREE.Vector2(0.68, 0.04);
  let width = 1;
  let height = 1;
  let active = true;
  let frameId = 0;
  let previousTime = performance.now();
  let touchActive = false;
  let interactionBoost = 1;
  const explosions = [];

  function resize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const pointScale = height * renderer.getPixelRatio() * 0.5;
    dust.material.uniforms.uScale.value = pointScale;
    asteroids.material.uniforms.uScale.value = pointScale;
    explosionDust.material.uniforms.uScale.value = pointScale;
    explosionFlashes.material.uniforms.uScale.value = pointScale;
  }

  function movePointer(event) {
    if (event.pointerType === 'touch' && !touchActive) return;
    const bounds = container.getBoundingClientRect();
    pointerTarget.x = ((event.clientX - bounds.left) / width) * 2 - 1;
    pointerTarget.y = -((event.clientY - bounds.top) / height) * 2 + 1;
    if (event.pointerType === 'touch') interactionBoost = 2.25;
  }

  function startPointerInteraction(event) {
    if (event.pointerType !== 'touch') return;
    touchActive = true;
    interactionBoost = 2.75;
    movePointer(event);
  }

  function endPointerInteraction(event) {
    if (event.pointerType === 'touch') touchActive = false;
  }

  function burstDust(x, y) {
    const particleCount = mobile ? 360 : 1000;
    const color = new THREE.Color();

    for (let index = 0; index < particleCount; index += 1) {
      const particle = explosionDust.cursor;
      const offset = particle * 3;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.28 + Math.pow(Math.random(), 0.38) * 1.12;
      const elevation = (Math.random() - 0.5) * 0.15;
      const windOffset = particle * 2;

      explosionDust.positions[offset] = x + (Math.random() - 0.5) * 0.14;
      explosionDust.positions[offset + 1] = y + (Math.random() - 0.5) * 0.14;
      explosionDust.positions[offset + 2] = elevation;
      explosionDust.velocities[offset] = Math.cos(angle) * speed;
      explosionDust.velocities[offset + 1] = Math.sin(angle) * speed;
      explosionDust.velocities[offset + 2] = (Math.random() - 0.5) * 0.12;
      explosionDust.winds[windOffset] = (Math.random() - 0.5) * 0.003;
      explosionDust.winds[windOffset + 1] = (Math.random() - 0.5) * 0.003;
      explosionDust.turbulence[particle] = 0.0008 + Math.random() * 0.0018;
      explosionDust.phases[particle] = Math.random() * Math.PI * 2;
      explosionDust.ages[particle] = 0;
      explosionDust.lifetimes[particle] = 88 + Math.random() * 74;
      explosionDust.sizes[particle] = 0.018 + Math.random() * 0.072;
      color.setHex(COLORS[Math.floor(Math.random() * COLORS.length)]);
      explosionDust.colors[offset] = color.r;
      explosionDust.colors[offset + 1] = color.g;
      explosionDust.colors[offset + 2] = color.b;
      explosionDust.opacities[particle] = 0.95;
      explosionDust.cursor = (particle + 1) % explosionDust.count;
    }

    explosionDust.geometry.attributes.position.needsUpdate = true;
    explosionDust.geometry.attributes.color.needsUpdate = true;
    explosionDust.geometry.attributes.aSize.needsUpdate = true;
    explosionDust.geometry.attributes.aOpacity.needsUpdate = true;
  }

  function flashExplosion(x, y) {
    const flash = explosionFlashes.cursor;
    const offset = flash * 3;

    explosionFlashes.positions[offset] = x;
    explosionFlashes.positions[offset + 1] = y;
    explosionFlashes.positions[offset + 2] = 0.18;
    explosionFlashes.sizes[flash] = mobile ? 2.5 : 3.8;
    explosionFlashes.opacities[flash] = 1;
    explosionFlashes.ages[flash] = 0;
    explosionFlashes.lifetimes[flash] = 18;
    explosionFlashes.cursor = (flash + 1) % explosionFlashes.count;
    explosionFlashes.geometry.attributes.position.needsUpdate = true;
    explosionFlashes.geometry.attributes.aSize.needsUpdate = true;
    explosionFlashes.geometry.attributes.aOpacity.needsUpdate = true;
  }

  function explode(event) {
    if (event.button !== 0 || event.pointerType === 'touch' || event.target.closest('a, button, input, textarea, select, label')) return;

    movePointer(event);
    const distance = camera.position.z;
    const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const x = camera.position.x + pointerTarget.x * distance * halfFovTangent * camera.aspect;
    const y = camera.position.y + pointerTarget.y * distance * halfFovTangent;

    explosions.push({ x, y, age: 0 });
    burstDust(x, y);
    flashExplosion(x, y);
    interactionBoost = 4;
  }

  function updateCloud(cloud, delta, intensity) {
    const halfFovTangent = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const interactionRadius = cloud === asteroids ? 4.4 : 3.7;

    for (let index = 0; index < cloud.count; index += 1) {
      const offset = index * 3;
      let x = cloud.positions[offset];
      let y = cloud.positions[offset + 1];
      let z = cloud.positions[offset + 2] + cloud.speeds[index] * delta * intensity;

      if (z > 8) {
        z = -32;
        cloud.origins[offset] = cloud.positions[offset] = (Math.random() - 0.5) * 30;
        cloud.origins[offset + 1] = cloud.positions[offset + 1] = (Math.random() - 0.5) * 18;
      }

      const cameraDistance = Math.max(camera.position.z - z, 0.1);
      const cursorX = camera.position.x + pointer.x * cameraDistance * halfFovTangent * camera.aspect;
      const cursorY = camera.position.y + pointer.y * cameraDistance * halfFovTangent;
      const deltaX = x - cursorX;
      const deltaY = y - cursorY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (distanceSquared < interactionRadius * interactionRadius) {
        const distance = Math.max(Math.sqrt(distanceSquared), 0.05);
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const falloff = 1 - distance / interactionRadius;
        const orbitRadius = interactionRadius * 0.48;
        const swirlForce = falloff * 0.075 * intensity;
        const orbitForce = (orbitRadius - distance) * 0.016 * intensity;
        const centerPressure = Math.max(0, 1 - distance / (orbitRadius * 0.55)) * 0.07 * intensity;

        x += (-normalY * swirlForce + normalX * (centerPressure + orbitForce)) * delta;
        y += (normalX * swirlForce + normalY * (centerPressure + orbitForce)) * delta;
      }

      for (const explosion of explosions) {
        const explosionDeltaX = x - explosion.x;
        const explosionDeltaY = y - explosion.y;
        const explosionDistanceSquared = explosionDeltaX * explosionDeltaX + explosionDeltaY * explosionDeltaY;
        const explosionRadius = cloud === asteroids ? 11.5 : 8.6;

        if (explosionDistanceSquared < explosionRadius * explosionRadius) {
          const explosionDistance = Math.max(Math.sqrt(explosionDistanceSquared), 0.08);
          const explosionFalloff = 1 - explosionDistance / explosionRadius;
          const explosionStrength = (cloud === asteroids ? 0.37 : 0.21) * explosionFalloff * (1 - explosion.age / 42);
          x += (explosionDeltaX / explosionDistance) * explosionStrength * delta;
          y += (explosionDeltaY / explosionDistance) * explosionStrength * delta;
        }
      }

      x += (cloud.origins[offset] - x) * 0.014 * delta;
      y += (cloud.origins[offset + 1] - y) * 0.014 * delta;
      cloud.positions[offset] = x;
      cloud.positions[offset + 1] = y;
      cloud.positions[offset + 2] = z;
    }

    cloud.geometry.attributes.position.needsUpdate = true;
  }

  function updateExplosionDust(delta) {
    for (let index = 0; index < explosionDust.count; index += 1) {
      const lifetime = explosionDust.lifetimes[index];
      if (!lifetime || explosionDust.ages[index] >= lifetime) continue;

      const offset = index * 3;
      const age = explosionDust.ages[index] + delta;
      const drag = Math.pow(0.975, delta);
      const windOffset = index * 2;
      explosionDust.velocities[offset] *= drag;
      explosionDust.velocities[offset + 1] *= drag;
      explosionDust.velocities[offset + 2] *= drag;
      explosionDust.velocities[offset] += (explosionDust.winds[windOffset] + Math.sin(age * 0.18 + explosionDust.phases[index]) * explosionDust.turbulence[index]) * delta;
      explosionDust.velocities[offset + 1] += (explosionDust.winds[windOffset + 1] + Math.cos(age * 0.15 + explosionDust.phases[index]) * explosionDust.turbulence[index]) * delta;
      explosionDust.positions[offset] += explosionDust.velocities[offset] * delta;
      explosionDust.positions[offset + 1] += explosionDust.velocities[offset + 1] * delta;
      explosionDust.positions[offset + 2] += explosionDust.velocities[offset + 2] * delta;
      explosionDust.ages[index] = age;
      explosionDust.opacities[index] = Math.max(0, 1 - age / lifetime);
    }

    explosionDust.geometry.attributes.position.needsUpdate = true;
    explosionDust.geometry.attributes.aOpacity.needsUpdate = true;
  }

  function updateExplosionFlashes(delta) {
    for (let index = 0; index < explosionFlashes.count; index += 1) {
      const lifetime = explosionFlashes.lifetimes[index];
      if (!lifetime || explosionFlashes.ages[index] >= lifetime) continue;

      const age = explosionFlashes.ages[index] + delta;
      explosionFlashes.ages[index] = age;
      explosionFlashes.opacities[index] = Math.max(0, 1 - age / lifetime);
      explosionFlashes.sizes[index] *= Math.pow(0.95, delta);
    }

    explosionFlashes.geometry.attributes.aSize.needsUpdate = true;
    explosionFlashes.geometry.attributes.aOpacity.needsUpdate = true;
  }

  function render(time) {
    const delta = Math.min((time - previousTime) / 16.67, 2.2);
    previousTime = time;
    pointer.lerp(pointerTarget, 0.08);
    interactionBoost += (1 - interactionBoost) * 0.045 * delta;
    for (let index = explosions.length - 1; index >= 0; index -= 1) {
      explosions[index].age += delta;
      if (explosions[index].age > 42) explosions.splice(index, 1);
    }
    updateCloud(dust, delta, interactionBoost);
    updateCloud(asteroids, delta, 0.75 * interactionBoost);
    updateExplosionDust(delta);
    updateExplosionFlashes(delta);
    dust.points.rotation.z = Math.sin(time * 0.00008) * 0.08;
    asteroids.points.rotation.z = -Math.sin(time * 0.00006) * 0.05;
    camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.025;
    camera.position.y += (pointer.y * 0.22 - camera.position.y) * 0.025;
    renderer.render(scene, camera);
    if (active && !reducedMotion) frameId = requestAnimationFrame(render);
  }

  resize();
  renderer.render(scene, camera);

  if (!reducedMotion) {
    window.addEventListener('pointermove', movePointer, { passive: true });
    window.addEventListener('pointerdown', startPointerInteraction, { passive: true });
    interactionTarget.addEventListener('pointerdown', explode, { passive: true });
    window.addEventListener('pointerup', endPointerInteraction, { passive: true });
    window.addEventListener('pointercancel', endPointerInteraction, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const shouldRun = entry.isIntersecting && !document.hidden;
      if (shouldRun === active) return;
      active = shouldRun;
      if (active) {
        previousTime = performance.now();
        frameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frameId);
      }
    });
    visibilityObserver.observe(container);
    frameId = requestAnimationFrame(render);
  }

  container.dataset.webgl = 'ready';

  return () => {
    active = false;
    cancelAnimationFrame(frameId);
    window.removeEventListener('pointermove', movePointer);
    window.removeEventListener('pointerdown', startPointerInteraction);
    interactionTarget.removeEventListener('pointerdown', explode);
    window.removeEventListener('pointerup', endPointerInteraction);
    window.removeEventListener('pointercancel', endPointerInteraction);
    window.removeEventListener('resize', resize);
    dust.geometry.dispose();
    dust.material.dispose();
    asteroids.geometry.dispose();
    asteroids.material.dispose();
    explosionDust.geometry.dispose();
    explosionDust.material.dispose();
    explosionFlashes.geometry.dispose();
    explosionFlashes.material.dispose();
    renderer.dispose();
  };
}