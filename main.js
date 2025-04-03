import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a202c);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Add confetti script
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
document.head.appendChild(confettiScript);

// Game variables
let letters = [];
let score = 0;
let timeLeft = 300;
let lastKey = null;

// Score display
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
document.body.appendChild(scoreElement);

// Timer display
const timerElement = document.createElement('div');
timerElement.style.position = 'absolute';
timerElement.style.top = '60px';
timerElement.style.left = '20px';
timerElement.style.color = 'white';
timerElement.style.fontSize = '24px';
document.body.appendChild(timerElement);

// Confetti and background change
function fireConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
        shapes: ['star', 'circle', 'square'],
        zIndex: 100
    });
}

function visual() {
    fireConfetti();
    changeBackgroundColor();
}

function changeBackgroundColor() {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    scene.background = new THREE.Color(randomColor);
}

// Font loader
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    function createLetter(letter) {
        const geometry = new TextGeometry(letter, {
            font: font,
            size: 10,                // Larger size
            height: 2,               // More depth
            curveSegments: 12,       // Smoother curves
            bevelEnabled: true,      // Enable beveling for better 3D look
            bevelThickness: 0.4,     // Bevel depth
            bevelSize: 0.3,          // Bevel width
            bevelSegments: 5         // Smooth bevel
        });
    
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            shininess: 100,          // Add some shine
            specular: 0x444444       // Specular highlights
        });
    
        const mesh = new THREE.Mesh(geometry, material);
        geometry.center();
    
        letters.forEach(old => scene.remove(old));
        letters = [mesh];
        scene.add(mesh);
    }

    // Keyboard event
    document.addEventListener('keydown', (event) => {
        if (timeLeft <= 0) return;

        const letter = event.key.toUpperCase();
        if (!/^[A-Z0-9]$/.test(letter)) {
            visual();
            return;
        }

        if (letter === lastKey) {
            visual();
            return;
        }
        lastKey = letter;

        createLetter(letter);

        // Speech
        const speech = new SpeechSynthesisUtterance(letter.toLowerCase());
        speech.lang = 'en-US';
        speech.rate = 0.8;
        speech.pitch = 1.2;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);

        score++;
        scoreElement.textContent = `Score: ${score}`;

        visual();
    });

    // Timer
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time Left: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            const gameOverElement = document.createElement('div');
            gameOverElement.style.position = 'absolute';
            gameOverElement.style.top = '50%';
            gameOverElement.style.left = '50%';
            gameOverElement.style.transform = 'translate(-50%, -50%)';
            gameOverElement.style.color = 'white';
            gameOverElement.style.fontSize = '48px';
            gameOverElement.textContent = `Game Over! Final Score: ${score}`;
            document.body.appendChild(gameOverElement);
        }
    }, 1000);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});