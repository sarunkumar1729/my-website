const canvas = document.getElementById("bg-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 8;

// Node + line groups
const nodes = new THREE.Group();
const nodeCount = 80;
let nodeMaterial, lineMaterial, lines;

// Function to set materials + background based on theme
function applyTheme() {
  const theme = document.body.getAttribute("data-theme");

  if (theme === "dark") {
    scene.background = new THREE.Color(0x0d0d0d);
    nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00bcd4 });
    lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.25, transparent: true });
  } else {
    scene.background = new THREE.Color(0xf5f5f5);
    nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x0077b6 });
    lineMaterial = new THREE.LineBasicMaterial({ color: 0x111111, opacity: 0.35, transparent: true });
  }
}

// Initialize theme
applyTheme();

// Create nodes
const positions = [];
const geometry = new THREE.SphereGeometry(0.05, 8, 8);
for (let i = 0; i < nodeCount; i++) {
  const mesh = new THREE.Mesh(geometry, nodeMaterial);
  mesh.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6
  );
  nodes.add(mesh);
  positions.push(mesh.position);
}
scene.add(nodes);

// Create connecting lines
function createLines() {
  if (lines) scene.remove(lines); // remove old lines if theme toggled
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[i].distanceTo(positions[j]) < 2.5) {
        linePositions.push(positions[i].x, positions[i].y, positions[i].z);
        linePositions.push(positions[j].x, positions[j].y, positions[j].z);
      }
    }
  }
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);
}
createLines();

// Animate background
function animate() {
  requestAnimationFrame(animate);
  nodes.rotation.y += 0.0015;
  if (lines) lines.rotation.y += 0.0015;
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// React to theme change
const observer = new MutationObserver(() => {
  applyTheme();
  // reapply materials
  nodes.children.forEach(mesh => mesh.material = nodeMaterial);
  createLines();
});
observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

// Tilt effect for PNG
const tiltImg = document.querySelector(".about-img img");
document.querySelector(".about-img").addEventListener("mousemove", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left; 
  const y = e.clientY - rect.top;  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * 8; 
  const rotateY = ((x - centerX) / centerX) * 8;
  tiltImg.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
});

document.querySelector(".about-img").addEventListener("mouseleave", () => {
  tiltImg.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
});
