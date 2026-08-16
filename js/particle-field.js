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

export function initParticleField(container, { reducedMotion = false } = {}) {
  if (!container) return null;

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
  scene.add(dust.points, asteroids.points);

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

  function resize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const pointScale = height * renderer.getPixelRatio() * 0.5;
    dust.material.uniforms.uScale.value = pointScale;
    asteroids.material.uniforms.uScale.value = pointScale;
  }

  function movePointer(event) {
    if (event.pointerType === 'touch' && !touchActive) return;
    pointerTarget.x = (event.clientX / width) * 2 - 1;
    pointerTarget.y = -(event.clientY / height) * 2 + 1;
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

  function updateCloud(cloud, delta, intensity) {
    const cursorX = pointer.x * camera.aspect * 8.6;
    const cursorY = pointer.y * 5.1;
    const interactionRadius = cloud === asteroids ? 3.2 : 2.6;

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

      const perspective = THREE.MathUtils.clamp((z + 32) / 40, 0.2, 1);
      const deltaX = x - cursorX * perspective;
      const deltaY = y - cursorY * perspective;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (distanceSquared < interactionRadius * interactionRadius) {
        const distance = Math.max(Math.sqrt(distanceSquared), 0.05);
        const force = (1 - distance / interactionRadius) * 0.23 * intensity;
        x += (deltaX / distance) * force * delta;
        y += (deltaY / distance) * force * delta;
      }

      x += (cloud.origins[offset] - x) * 0.014 * delta;
      y += (cloud.origins[offset + 1] - y) * 0.014 * delta;
      cloud.positions[offset] = x;
      cloud.positions[offset + 1] = y;
      cloud.positions[offset + 2] = z;
    }

    cloud.geometry.attributes.position.needsUpdate = true;
  }

  function render(time) {
    const delta = Math.min((time - previousTime) / 16.67, 2.2);
    previousTime = time;
    pointer.lerp(pointerTarget, 0.08);
    interactionBoost += (1 - interactionBoost) * 0.045 * delta;
    updateCloud(dust, delta, interactionBoost);
    updateCloud(asteroids, delta, 0.75 * interactionBoost);
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
    window.removeEventListener('pointerup', endPointerInteraction);
    window.removeEventListener('pointercancel', endPointerInteraction);
    window.removeEventListener('resize', resize);
    dust.geometry.dispose();
    dust.material.dispose();
    asteroids.geometry.dispose();
    asteroids.material.dispose();
    renderer.dispose();
  };
}