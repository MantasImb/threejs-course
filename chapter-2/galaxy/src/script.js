import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI({
  width: 480,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 2,
  innerColor: 0xff6030,
  outterColor: 0x1b3984,
};

gui
  .add(parameters, "count", 100, 1_000_000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size", 0.001, 0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius", 0.1, 20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui.add(parameters, "branches", 1, 20).step(1).onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin", -Math.PI, Math.PI)
  .step(0.1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness", 0, 1)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower", 1, 10)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "innerColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outterColor").onFinishChange(generateGalaxy);

let geometry, material, points;

function generateGalaxy() {
  /**
   * Clean-up
   */
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  if (points) scene.remove(points);

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const innerColor = new THREE.Color(parameters.innerColor);
  const outterColor = new THREE.Color(parameters.outterColor);

  for (let i = 0; i < parameters.count * 3; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    if (i % 10000 == 1) {
      console.log(branchAngle + spinAngle);
    }
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = innerColor
      .clone()
      .lerp(outterColor, radius / parameters.radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
}

generateGalaxy();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
