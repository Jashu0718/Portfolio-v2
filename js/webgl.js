// Setup Scene
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;

// Post-Processing (Bloom)
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,  // strength
    0.5,  // radius
    0.2   // threshold
);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lighting - Cinematic Studio Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xd4af37, 2); // Gold accent light
directionalLight.position.set(5, 5, 2);
scene.add(directionalLight);

const blueLight = new THREE.DirectionalLight(0x4a90e2, 3); // Cool fill light
blueLight.position.set(-5, -5, 2);
scene.add(blueLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
camera.add(pointLight);
scene.add(camera);

// Objects - Array of PBR Meshes
const meshes = [];
const material = new THREE.MeshPhysicalMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    flatShading: false
});

// 1. Torus Knot (Hero)
const geom1 = new THREE.TorusKnotGeometry(1.5, 0.4, 256, 64);
const mesh1 = new THREE.Mesh(geom1, material);
mesh1.position.y = 0;
mesh1.position.x = 2;
scene.add(mesh1);
meshes.push(mesh1);

// 2. Icosahedron (About)
const geom2 = new THREE.IcosahedronGeometry(2, 0);
const mesh2 = new THREE.Mesh(geom2, material);
mesh2.position.y = -8;
mesh2.position.x = -2;
scene.add(mesh2);
meshes.push(mesh2);

// 3. Torus (Experience)
const geom3 = new THREE.TorusGeometry(1.8, 0.5, 32, 100);
const mesh3 = new THREE.Mesh(geom3, material);
mesh3.position.y = -16;
mesh3.position.x = 2.5;
scene.add(mesh3);
meshes.push(mesh3);

// 4. Cylinder/Robotic Joint (Projects)
const geom4 = new THREE.CylinderGeometry(1, 1, 3, 32);
const mesh4 = new THREE.Mesh(geom4, material);
mesh4.position.y = -24;
mesh4.position.x = -2.5;
scene.add(mesh4);
meshes.push(mesh4);

// 5. Octahedron (Footer)
const geom5 = new THREE.OctahedronGeometry(2, 0);
const mesh5 = new THREE.Mesh(geom5, material);
mesh5.position.y = -32;
mesh5.position.x = 0;
scene.add(mesh5);
meshes.push(mesh5);

// Data Dust Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15; // x, y, z spread
    if (i % 3 === 1) {
        // Spread Y massively down the scroll length
        posArray[i] = (Math.random() * 40) - 35; 
    }
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Scroll Interaction
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Mouse movement easing
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    // Rotate all meshes slowly
    meshes.forEach((mesh, index) => {
        mesh.rotation.y += 0.002 * (index % 2 === 0 ? 1 : -1);
        mesh.rotation.x += 0.001;
        
        mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);
        mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
    });
    
    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Move Camera based on scroll
    // Instead of moving the object off screen, we move the camera DOWN.
    // Map scroll depth so camera goes from y=0 to y=-35
    // Assume max scroll is roughly document height
    const scrollRatio = scrollY / (document.body.scrollHeight - window.innerHeight);
    
    // Ensure camera moves down through the objects
    camera.position.y = -scrollRatio * 32;
    
    // Add slight mouse parallax to camera
    camera.position.x += (mouseX * 0.002 - camera.position.x) * 0.05;

    composer.render();
}

animate();

// Resize Event
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
