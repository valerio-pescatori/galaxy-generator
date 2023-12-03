import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Geometries
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  rotationActive: false,
  rotationSpeed: 0.001,
  rotationClockwise: true,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

const normalize = (val, max, min) => (val - min) / (max - min);

let points;
let pointsGeometry;
let pointsMaterial;

const generateGalaxy = () => {
  if (points) {
    scene.remove(points);
    pointsGeometry.dispose();
    pointsMaterial.dispose();
  }
  pointsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const branchesDistance = (Math.PI * 2) / parameters.branches;
  const angles = Array.from({ length: parameters.branches }, (_, i) => branchesDistance * i);

  const pointsInRay = Math.ceil(parameters.count / parameters.branches);

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let r = 0; r < parameters.branches; r++) {
    const offset = pointsInRay * r;
    for (let p = 0; p < pointsInRay; p++) {
      const p3 = (p + offset) * 3;

      const radius = Math.random() * parameters.radius;
      const spinAmount = radius * parameters.spin;
      const randomX =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        radius;

      positions[p3] = Math.cos(angles[r] + spinAmount) * radius + randomX;
      positions[p3 + 1] = randomY;
      positions[p3 + 2] = Math.sin(angles[r] + spinAmount) * radius + randomZ;

      const thisColor = new THREE.Color();
      thisColor.lerpColors(insideColor, outsideColor, radius / parameters.radius);

      colors[p3] = thisColor.r;
      colors[p3 + 1] = thisColor.g;
      colors[p3 + 2] = thisColor.b;
    }
  }

  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  pointsMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
};

gui.add(parameters, "count", 100000, 1000000, 10000).onFinishChange(generateGalaxy);
gui.add(parameters, "size", 0.001, 0.1, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius", 5, 20, 0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "branches", 3, 20, 1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin", -2, 2, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness", 0, 2, 0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnessPower", 1, 10, 0.01).onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
gui.add(parameters, "rotationSpeed", 0.0001, 0.005, 0.0001);
gui.add(parameters, "rotationClockwise");
gui.add(parameters, "rotationActive");
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 2000);
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

  if (parameters.rotationActive)
    points.rotation.y += parameters.rotationSpeed * (parameters.rotationClockwise ? -1 : 1);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
