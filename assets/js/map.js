import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Get the canvas and set up the renderer.
const canvas = document.getElementById('wardleyMapCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

const width = window.innerHeight;
const height = 800;
renderer.setSize(width, height);

// Create the scene.
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF4F4F4 );

// Use an orthographic camera so that 1 unit = 1 pixel in our 2D layout.
// left, right, top, bottom, near, far are set based on our canvas dimensions.
const camera = new THREE.OrthographicCamera(-width, width, height, -height, -2000, 2000);
camera.position.set(0, 0, 0);
camera.lookAt(new THREE.Vector3(width / 2, height / 2, 0));

// Setup OrbitControls with rotation disabled (2D zoom only).
const controls = new OrbitControls(camera, canvas);
controls.enableRotate = false;  // Lock rotation for now.
controls.enablePan = false;     // Optionally lock panning.

// --- Draw 5 vertical lines evenly spaced ---
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const numVerticalLines = 5;
for (let i = 0; i < numVerticalLines; i++) {
  // Calculate x positions
  const x = i * (width / (numVerticalLines - 1));
  const points = [
    new THREE.Vector3(x, height, 0),
    new THREE.Vector3(x, 0, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, lineMaterial);
  scene.add(line);
}

// --- Add axis labels via HTML overlays ---
const container = document.getElementById('wardley-map-container');

const xAxisLabel = document.createElement('div');
xAxisLabel.textContent = 'Evolution';
xAxisLabel.style.position = 'absolute';
xAxisLabel.style.bottom = '10px';
xAxisLabel.style.left = '50%';
xAxisLabel.style.transform = 'translateX(-50%)';
xAxisLabel.style.fontFamily = 'sans-serif';
xAxisLabel.style.fontSize = '20px';
container.appendChild(xAxisLabel);

const yAxisLabel = document.createElement('div');
yAxisLabel.textContent = 'Visibility';
yAxisLabel.style.position = 'absolute';
yAxisLabel.style.top = '50%';
yAxisLabel.style.left = '10px';
yAxisLabel.style.transform = 'translateY(-50%) rotate(-90deg)';
yAxisLabel.style.fontFamily = 'sans-serif';
yAxisLabel.style.fontSize = '20px';
container.appendChild(yAxisLabel);

// --- Create 7 nodes as white circles with black outlines ---
const nodesGroup = new THREE.Group();
const numNodes = 7;
for (let i = 0; i < numNodes; i++) {
  // Create the circle (node) with radius 10.
  const circleGeometry = new THREE.CircleGeometry(10, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);

  // Create a slightly larger circle for the outline.
  const outlineGeometry = new THREE.CircleGeometry(11, 32);
  const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);

  // Group the outline behind the white circle.
  const node = new THREE.Group();
  outline.position.set(0, 0, -0.1);
  node.add(outline);
  node.add(circle);

  // Place the node at a random position within our coordinate system:
  // x: between -400 and 400, y: between -600 and 600.
  node.position.x = Math.random() * width;
  node.position.y = Math.random() * height;

  nodesGroup.add(node);
}
scene.add(nodesGroup);

// --- Connect nodes with 10 random lines ---
const connectionsGroup = new THREE.Group();
// Get the positions from the nodes.
const nodePositions = nodesGroup.children.map(node => node.position);
for (let i = 0; i < 10; i++) {
  let idxA = Math.floor(Math.random() * nodePositions.length);
  let idxB = Math.floor(Math.random() * nodePositions.length);
  // Ensure we don’t connect a node to itself.
  while (idxB === idxA) {
    idxB = Math.floor(Math.random() * nodePositions.length);
  }
  const posA = nodePositions[idxA];
  const posB = nodePositions[idxB];
  const points = [
    new THREE.Vector3(posA.x, posA.y, 0),
    new THREE.Vector3(posB.x, posB.y, 0)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const connectionLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
  connectionsGroup.add(connectionLine);
}
scene.add(connectionsGroup);

// --- Animation loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
