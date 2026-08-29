import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===================================================================
// CONSTANTS & DEFINITIONS
// ===================================================================
const PLATE_RADIUS   = 3.2;
const PLATE_HEIGHT   = 0.14;
const CAKE_RADIUS    = 2.55;
const CAKE_HEIGHT    = 2.1;
const FROSTING_H     = 0.32;
const CANDLE_RADIUS  = 0.085;
const CANDLE_HEIGHT  = 1.05;
const CANDLE_COUNT   = 6; // 6 candles as requested

const NOTE = {
    G4:392.00, A4:440.00, B4:493.88, C5:523.25,
    D5:587.33, E5:659.25, F5:698.46, G5:783.99
};
const MELODY = [
    ['G4',.5],['G4',.25],['A4',.75],['G4',.75],['C5',.75],['B4',1.5],
    ['G4',.5],['G4',.25],['A4',.75],['G4',.75],['D5',.75],['C5',1.5],
    ['G4',.5],['G4',.25],['G5',.75],['E5',.75],['C5',.75],['B4',.75],['A4',1.5],
    ['F5',.5],['F5',.25],['E5',.75],['C5',.75],['D5',.75],['C5',2.0]
];
const TEMPO = 0.62;
const SONG_SEC = Math.ceil(MELODY.reduce((s,[,d])=>s+d,0) * TEMPO) + 1;

function getAgeWish(ageNum) {
    if (!ageNum || isNaN(ageNum)) {
        return "✨ May your year ahead be filled with magic, laughter, and endless adventure! ✨";
    }
    const age = parseInt(ageNum, 10);
    if (age <= 12) {
        return `✨ Level ${age} Wizard! May your wand spark with incredible magic, fun, and wonders every single day! ✨`;
    } else if (age <= 19) {
        return `✨ Happy ${age}th Birthday! May your teenage years shine bright with magical triumphs and brilliant dreams! ✨`;
    } else if (age <= 29) {
        return `✨ Welcome to Chapter ${age}! May your 20s be an epic quest filled with greatness, joy, and success! ✨`;
    } else if (age <= 49) {
        return `✨ Cheers to ${age} Years of Greatness! Wisest wizard in the room—may your days be filled with happiness and prosperity! ✨`;
    } else {
        return `✨ ${age} Magical Years! Honored Archmage, may your life remain blessed with joy, health, and legendary stories! ✨`;
    }
}

// ===================================================================
// SCENE SETUP
// ===================================================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x040410, 0.015);
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 600);
const TARGET_CAM_POS = new THREE.Vector3(0, 9, 15);
camera.position.copy(TARGET_CAM_POS); // Start directly upfront!

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true; // Orbit controls enabled upfront!
controls.enablePan = false;
controls.minPolarAngle = THREE.MathUtils.degToRad(18);
controls.maxPolarAngle = THREE.MathUtils.degToRad(88);
controls.minDistance = 5;
controls.maxDistance = 26;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.target.set(0, 2.8, 0);

// Intro animation state (camera zoom + unboxing reveal)
let isCameraAnimating = false;
let camAnimStartTime = 0;
const CAM_ANIM_DURATION = 3200; // 3.2s full reveal

// Box animation references
let giftBoxGroup = null;
let boxLidMesh = null;
let cakeGroupRef = null;

function triggerCameraIntro() {
    isCameraAnimating = true;
    camAnimStartTime = performance.now();
    playMagicChimeSound();
}

// ===================================================================
// LIGHTING & AMBIENT HP GREAT HALL ATMOSPHERE
// ===================================================================
scene.add(new THREE.AmbientLight(0x7755aa, 0.45));

const moonDir = new THREE.DirectionalLight(0x9999ff, 0.22);
moonDir.position.set(-6, 15, -6);
scene.add(moonDir);

const fillLight = new THREE.PointLight(0xffcc88, 1.5, 20);
fillLight.position.set(0, 5.5, 5);
scene.add(fillLight);

const torchLights = [
    new THREE.PointLight(0xff7722, 0.8, 25),
    new THREE.PointLight(0xff9933, 0.8, 25),
    new THREE.PointLight(0xff6611, 0.8, 25),
    new THREE.PointLight(0xff8822, 0.8, 25)
];
torchLights[0].position.set(-12, 8, -10);
torchLights[1].position.set(12, 8, -10);
torchLights[2].position.set(-12, 8, 10);
torchLights[3].position.set(12, 8, 10);
torchLights.forEach(tl => scene.add(tl));

// ===================================================================
// FLOATING CANDLES
// ===================================================================
const floatingCandleGroup = new THREE.Group();
const floatingCandleData = [];

function buildFloatingCandles() {
    const N = 16;
    const cGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
    const cMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E6, roughness: 0.7 });

    for (let i = 0; i < N; i++) {
        const rad = 6 + Math.random() * 8;
        const ang = (i / N) * Math.PI * 2 + Math.random() * 0.4;
        const baseH = 4 + Math.random() * 6;

        const mesh = new THREE.Mesh(cGeo, cMat);
        const x = Math.cos(ang) * rad;
        const z = Math.sin(ang) * rad;
        mesh.position.set(x, baseH, z);

        const fLight = new THREE.PointLight(0xffaa44, 0.35, 4);
        fLight.position.set(x, baseH + 0.45, z);
        floatingCandleGroup.add(fLight);

        const fMat = makeFlameMat();
        const fGeo = new THREE.SphereGeometry(0.05, 12, 12);
        fGeo.translate(0, 0.05, 0);
        const flame = new THREE.Mesh(fGeo, fMat);
        flame.position.set(x, baseH + 0.4, z);
        floatingCandleGroup.add(flame);

        floatingCandleGroup.add(mesh);

        floatingCandleData.push({
            mesh, fLight, flame, baseH,
            speed: 0.8 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            fMat
        });
    }
    scene.add(floatingCandleGroup);
}

let broomMeshGroup = null;

// ===================================================================
// HARRY POTTER THEMED GIFTS & ARTIFACTS ON THE TABLE (BRIGHT & VISIBLE)
// ===================================================================
let snitchWingL = null;
let snitchWingR = null;

function buildHogwartsGifts() {
    const giftsGroup = new THREE.Group();

    // Vibrant Self-Illuminated Materials (Guaranteed 100% visibility in dark scenes!)
    const goldMat   = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0x775500 });
    const woodMat   = new THREE.MeshLambertMaterial({ color: 0xD35400, emissive: 0x662200 }); // Bright Mahogany
    const strawMat  = new THREE.MeshLambertMaterial({ color: 0xF1C40F, emissive: 0x664400 }); // Golden Straw Twigs
    const leatherMat= new THREE.MeshLambertMaterial({ color: 0xBA4A00, emissive: 0x552200 });

    // ── 1. Golden Snitch with Metallic GOLD Wings ──────────────────
    const snitchGroup = new THREE.Group();
    const snitchBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), goldMat);
    snitchGroup.add(snitchBody);

    snitchWingL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.25), goldMat);
    snitchWingL.position.set(-0.42, 0.15, 0);
    snitchWingR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.25), goldMat);
    snitchWingR.position.set(0.42, 0.15, 0);
    snitchGroup.add(snitchWingL, snitchWingR);

    snitchGroup.position.set(-3.5, 0.45, 3.8);
    giftsGroup.add(snitchGroup);

    // ── 3. Elder Wand / Magic Wand ───────────────────────────────
    const wandGroup = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 3.6, 12), woodMat);
    shaft.rotation.z = Math.PI / 2;
    wandGroup.add(shaft);
    for (let k = 0; k < 5; k++) {
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), goldMat);
        node.position.x = -1.3 + k * 0.28;
        wandGroup.add(node);
    }
    wandGroup.position.set(-0.5, 0.08, 5.2);
    wandGroup.rotation.y = -0.25;
    giftsGroup.add(wandGroup);

    // ── 4. The Sorting Hat ─────────────────────────────────────────
    const hatGroup = new THREE.Group();
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.1, 16), leatherMat);
    hatGroup.add(brim);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.9, 12), leatherMat);
    cone.position.y = 0.95;
    cone.rotation.z = -0.18;
    hatGroup.add(cone);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.85, 10), leatherMat);
    tip.position.set(-0.25, 1.9, 0);
    tip.rotation.z = -0.45;
    hatGroup.add(tip);

    hatGroup.position.set(-5.5, 0.05, -3.2);
    hatGroup.rotation.y = 0.4;
    giftsGroup.add(hatGroup);

    // ── 5. Bright & Colorful House Gift Boxes ─────────────────────
    const boxSpecs = [
        // [x, z, rot, w, h, d, mainCol, ribCol]
        [-5.8,  1.2,  0.35, 2.2, 1.5, 2.2, 0xE74C3C, 0xFFD700], // Bright Gryffindor Red/Gold
        [ 5.8, -1.0, -0.45, 1.9, 1.3, 1.9, 0x3498DB, 0xFFFFFF], // Bright Ravenclaw Blue/White
        [-4.8, -1.8,  0.60, 1.7, 1.1, 1.7, 0x2ECC71, 0xFFD700], // Bright Slytherin Green/Gold
        [ 5.2,  1.8, -0.25, 2.0, 1.4, 2.0, 0xF1C40F, 0x222222], // Bright Hufflepuff Yellow/Black
        [ 2.2, -4.8,  0.15, 1.6, 1.0, 1.6, 0x9B59B6, 0xFFD700], // Bright Purple/Gold
        [-2.5, -5.2, -0.30, 1.8, 1.2, 1.8, 0xE67E22, 0xFFFFFF], // Bright Orange/White
        [ 4.8, -4.2,  0.40, 1.5, 0.9, 1.5, 0x1ABC9C, 0xF1C40F], // Bright Turquoise/Gold
        [-5.2,  3.8, -0.50, 1.9, 1.2, 1.9, 0x95A5A6, 0xE74C3C], // Bright Silver/Red
    ];

    boxSpecs.forEach(([x, z, rot, w, h, d, mCol, rCol]) => {
        const bGroup = new THREE.Group();
        const bMat = new THREE.MeshLambertMaterial({ color: mCol, emissive: 0x222222 });
        const rMat = new THREE.MeshLambertMaterial({ color: rCol, emissive: 0x333333 });

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
        mesh.position.y = h / 2;
        bGroup.add(mesh);

        const rx = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.32), rMat);
        rx.position.y = h / 2;
        const rz = new THREE.Mesh(new THREE.BoxGeometry(0.32, h + 0.05, d + 0.05), rMat);
        rz.position.y = h / 2;
        bGroup.add(rx, rz);

        // Ribbon Bow
        const bowL = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 10, 18), rMat);
        bowL.rotation.y = Math.PI / 4;
        bowL.position.set(-0.2, h + 0.18, 0);
        const bowR = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 10, 18), rMat);
        bowR.rotation.y = -Math.PI / 4;
        bowR.position.set(0.2, h + 0.18, 0);
        bGroup.add(bowL, bowR);

        bGroup.position.set(x, 0, z);
        bGroup.rotation.y = rot;
        giftsGroup.add(bGroup);
    });

    // ── 6. Hogwarts Acceptance Letter ──────────────────────────────
    const letterGroup = new THREE.Group();
    const envMat  = new THREE.MeshLambertMaterial({ color: 0xFFF8DC, emissive: 0x554422 });
    const sealMat = new THREE.MeshLambertMaterial({ color: 0xE74C3C, emissive: 0x661111 });

    const envelope = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 1.2), envMat);
    letterGroup.add(envelope);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.09, 16), sealMat);
    seal.position.set(0, 0.04, 0);
    letterGroup.add(seal);

    letterGroup.position.set(-3.2, 0.04, 3.2);
    letterGroup.rotation.y = 0.6;
    giftsGroup.add(letterGroup);

    // ── 7. Harry's Glasses & Golden Galleon Coins ───────────────────
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0x111111 });
    [-0.34, 0.34].forEach(x => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 12, 24), frameMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.x = x;
        glassesGroup.add(rim);
    });
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 8), frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.y = 0.13;
    glassesGroup.add(bridge);

    glassesGroup.position.set(-1.8, 0.06, -4.8);
    glassesGroup.rotation.y = 0.2;
    giftsGroup.add(glassesGroup);

    // Golden Galleon Coins
    for (let c = 0; c < 15; c++) {
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), goldMat);
        const ang = Math.random() * Math.PI * 2;
        const rad = 3.5 + Math.random() * 2.8;
        coin.position.set(Math.cos(ang) * rad, 0.04, Math.sin(ang) * rad);
        coin.rotation.y = Math.random() * Math.PI;
        giftsGroup.add(coin);
    }

    // Dedicated Key Spotlight directly above the Table Decor
    const tableLight = new THREE.PointLight(0xFFF5E0, 6.0, 25);
    tableLight.position.set(0, 6.5, 2.5);
    giftsGroup.add(tableLight);

    scene.add(giftsGroup);
}

// ===================================================================
// REALISTIC HEDWIG SNOWY OWL MODEL
// ===================================================================
let owlGroup = null;
let headMesh = null;
let leftWing = null;
let rightWing = null;
let owlFlying = false;
let owlFlightStart = 0;
const OWL_FLIGHT_DURATION = 4200;

function buildOwl() {
    owlGroup = new THREE.Group();

    // High detail materials with subtle feather texture emission
    const owlMat  = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0x444444, roughness: 0.5 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const eyeMat  = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0x665500, roughness: 0.1 });
    const pupMat  = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const talonMat= new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });

    // Body (Aerodynamic shape)
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 12, 16), owlMat);
    body.rotation.x = Math.PI * 0.14;
    owlGroup.add(body);

    // Feather speckles (Dark brown/black spots on back)
    for (let i = 0; i < 20; i++) {
        const spot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), darkMat);
        const ang  = (Math.random() - .5) * 1.8;
        const hy   = (Math.random() - .5) * 0.6;
        spot.position.set(Math.sin(ang) * 0.42, hy, -Math.cos(ang) * 0.42);
        spot.rotation.set(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3);
        owlGroup.add(spot);
    }

    // Head
    headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), owlMat);
    headMesh.position.set(0, 0.7, 0.15);
    owlGroup.add(headMesh);

    // Owl Heart-Shaped Facial Disc (Iconic Snowy Owl feature!)
    const faceDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 }));
    faceDisc.rotation.x = Math.PI * 0.5;
    faceDisc.position.set(0, 0.72, 0.45);
    owlGroup.add(faceDisc);

    // Eyes (Big Yellow Iris + Black Pupil)
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat);
    eyeL.position.set(-0.16, 0.76, 0.54);
    const pupL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupMat);
    pupL.position.set(-0.16, 0.76, 0.64);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat);
    eyeR.position.set(0.16, 0.76, 0.54);
    const pupR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupMat);
    pupR.position.set(0.16, 0.76, 0.64);

    owlGroup.add(eyeL, pupL, eyeR, pupR);

    // Beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), beakMat);
    beak.rotation.x = Math.PI * 0.68;
    beak.position.set(0, 0.65, 0.62);
    owlGroup.add(beak);

    // Layered Wings with Primary Feather Tips
    leftWing = new THREE.Group();
    const wBaseL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.7), owlMat);
    wBaseL.position.x = -0.75;
    leftWing.add(wBaseL);
    // Primary Feathers
    for (let f = 0; f < 5; f++) {
        const feather = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.15), owlMat);
        feather.position.set(-1.3 - f * 0.12, 0, 0.2 - f * 0.1);
        leftWing.add(feather);
    }
    leftWing.position.set(-0.4, 0.38, 0);
    owlGroup.add(leftWing);

    rightWing = new THREE.Group();
    const wBaseR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.7), owlMat);
    wBaseR.position.x = 0.75;
    rightWing.add(wBaseR);
    for (let f = 0; f < 5; f++) {
        const feather = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.15), owlMat);
        feather.position.set(1.3 + f * 0.12, 0, 0.2 - f * 0.1);
        rightWing.add(feather);
    }
    rightWing.position.set(0.4, 0.38, 0);
    owlGroup.add(rightWing);

    // Talons / Feet
    const talonL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), talonMat);
    talonL.position.set(-0.2, -0.6, 0.1);
    const talonR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), talonMat);
    talonR.position.set(0.2, -0.6, 0.1);
    owlGroup.add(talonL, talonR);

    // Dedicated Key Spotlight for Hedwig!
    const owlLight = new THREE.PointLight(0xFFFFFF, 4.0, 12);
    owlLight.position.set(0, 2.5, 2.0);
    owlGroup.add(owlLight);

    owlGroup.scale.set(1.25, 1.25, 1.25);
    // Perch directly on top of the gift box lid bow!
    owlGroup.position.set(0, 5.3, 0);
    scene.add(owlGroup);
}
function buildStars() {
    const N = 3500;
    const pos = new Float32Array(N * 3);
    const sz = new Float32Array(N);
    const ph = new Float32Array(N);

    for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        pos[i3] = (Math.random() - .5) * 350;
        pos[i3 + 1] = (Math.random() - .5) * 350;
        pos[i3 + 2] = (Math.random() - .5) * 350;
        sz[i] = Math.random() * 2.8 + 0.6;
        ph[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
            attribute float aSize;
            attribute float aPhase;
            uniform float uTime;
            varying float vAlpha;
            void main() {
                float tw = 0.55 + 0.45 * sin(uTime * 1.8 + aPhase);
                vAlpha = tw;
                gl_PointSize = aSize * tw;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if (d > 0.5) discard;
                float a = smoothstep(0.5, 0.0, d) * vAlpha;
                vec3 col = mix(vec3(0.85,0.9,1.0), vec3(1.0,0.96,0.88), vAlpha);
                gl_FragColor = vec4(col, a);
            }
        `,
        transparent: true,
        depthWrite: false,
    });

    return new THREE.Points(geo, mat);
}
const stars = buildStars();
scene.add(stars);

function buildSparkles() {
    const N = 750;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const sz = new Float32Array(N);
    const ph = new Float32Array(N);

    const palette = [
        [1.0, 0.4, 0.85], [0.7, 0.4, 1.0], [1.0, 0.88, 0.3], [0.45, 0.8, 1.0], [1.0, 1.0, 0.75]
    ];

    for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const r = 2.2 + Math.random() * 6.5;
        const ang = Math.random() * Math.PI * 2;
        const h = Math.random() * 9.0 + 0.1;
        pos[i3] = Math.cos(ang) * r;
        pos[i3 + 1] = h;
        pos[i3 + 2] = Math.sin(ang) * r;

        const c = palette[Math.floor(Math.random() * palette.length)];
        col[i3] = c[0]; col[i3 + 1] = c[1]; col[i3 + 2] = c[2];

        sz[i] = Math.random() * 5.5 + 1.2;
        ph[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSz', new THREE.BufferAttribute(sz, 1));
    geo.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));

    const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
            attribute vec3 aCol;
            attribute float aSz;
            attribute float aPh;
            varying vec3 vCol;
            varying float vA;
            uniform float uTime;
            void main(){
                vCol = aCol;
                float p = 0.35 + 0.65 * abs(sin(uTime * 1.6 + aPh));
                vA = p;
                gl_PointSize = aSz * p;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
            }
        `,
        fragmentShader: `
            varying vec3 vCol;
            varying float vA;
            void main(){
                float d = distance(gl_PointCoord, vec2(.5));
                if(d>.5) discard;
                float a = smoothstep(.5,0.,d) * vA * 0.8;
                gl_FragColor = vec4(vCol, a);
            }
        `,
        transparent: true,
        depthWrite: false,
    });
    return new THREE.Points(geo, mat);
}
const sparkles = buildSparkles();
scene.add(sparkles);

// ===================================================================
// FLAME SHADER
// ===================================================================
function makeFlameMat() {
    return new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOut: { value: 0 } },
        vertexShader: `
            uniform float uTime;
            uniform float uOut;
            varying vec2 vUv;
            varying float vH;

            float rnd(vec2 s){ return fract(sin(dot(s, vec2(12.9898,78.233)))*43758.5453); }
            float nse(vec2 s){
                vec2 i=floor(s), f=fract(s);
                float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+vec2(1,1));
                vec2 u=f*f*(3.-2.*f);
                return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
            }

            void main(){
                vUv = uv;
                vH = position.y;
                float fs = 1.0 - uOut * 0.95;
                vec3 pos = position * vec3(0.88, 2.0*fs, 0.88);
                float pxz = length(position.xz);
                pos.y *= 1.0+(cos((pxz+.25)*3.14159)*.25
                            + nse(vec2(0.,uTime))*.125
                            + nse(vec2(position.x+uTime, position.z+uTime))*.5)
                            * position.y * fs;
                pos.x += nse(vec2(uTime*2., (position.y-uTime)*4.))*vH*.06*fs;
                pos.z += nse(vec2((position.y-uTime)*4., uTime*2.))*vH*.06*fs;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
            }
        `,
        fragmentShader: `
            varying float vH;
            varying vec2 vUv;

            vec3 heat(float t){
                return clamp((pow(t,1.5)*.8+.2)*vec3(
                    smoothstep(0.,.35,t)+t*.5,
                    smoothstep(.5,1.,t),
                    max(1.-t*1.7, t*7.-6.)
                ), 0., 1.);
            }

            void main(){
                float v = abs(smoothstep(0.,.4,vH)-1.);
                float a = (1.-v)*.99 - (1.-smoothstep(1.,.97,vH));
                vec3 c = heat(smoothstep(0.,.3,vH)) * vec3(.95,.95,.4);
                c = mix(vec3(.05,.05,1.), c, smoothstep(0.,.3,vH));
                c += vec3(1.,.9,.5) * (1.25-vUv.y);
                c = mix(c, vec3(.66,.32,.03), smoothstep(.95,1.,vH));
                gl_FragColor = vec4(c, max(a, 0.0));
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
}

// ===================================================================
// HOGWARTS GREAT HALL WOODEN TABLE TEXTURE & MODEL
// ===================================================================
function makeHogwartsTableTex() {
    const S = 1024;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = S;
    const ctx = cvs.getContext('2d');

    // Rich Dark Oak Base
    ctx.fillStyle = '#2A1608';
    ctx.fillRect(0, 0, S, S);

    // Radial Wood Planks & Grain
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, '#4A2A12');
    g.addColorStop(0.5, '#351D0A');
    g.addColorStop(0.85, '#221105');
    g.addColorStop(1, '#150A02');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    // Wood Grain Rings & Planks
    ctx.strokeStyle = 'rgba(75, 42, 18, 0.35)';
    for (let r = 20; r < S / 2; r += 16) {
        ctx.lineWidth = Math.random() * 4 + 2;
        ctx.beginPath();
        ctx.arc(S / 2 + (Math.random() - .5) * 8, S / 2 + (Math.random() - .5) * 8, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Concentric Hogwarts Brass Ring Trim
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 38, 0, Math.PI * 2);
    ctx.stroke();

    // Hogwarts Runes / Star Accents around rim
    ctx.fillStyle = '#D4AF37';
    for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const rx = S / 2 + Math.cos(ang) * (S / 2 - 29);
        const ry = S / 2 + Math.sin(ang) * (S / 2 - 29);
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(cvs);
}
const activeSmokePuffs = [];

function spawnSmokePuff(posVector) {
    const N = 35;
    const pos = new Float32Array(N * 3);
    const vel = [];
    const sizes = new Float32Array(N);

    for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        pos[i3] = posVector.x + (Math.random() - 0.5) * 0.15;
        pos[i3 + 1] = posVector.y + Math.random() * 0.1;
        pos[i3 + 2] = posVector.z + (Math.random() - 0.5) * 0.15;

        vel.push({
            x: (Math.random() - 0.5) * 0.015,
            y: Math.random() * 0.025 + 0.02,
            z: (Math.random() - 0.5) * 0.015
        });

        sizes[i] = Math.random() * 6 + 4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 0.7 } },
        vertexShader: `
            uniform float uOpacity;
            void main() {
                gl_PointSize = 12.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if (d > 0.5) discard;
                float a = smoothstep(0.5, 0.0, d) * uOpacity;
                gl_FragColor = vec4(0.85, 0.85, 0.85, a);
            }
        `,
        transparent: true,
        depthWrite: false
    });

    const mesh = new THREE.Points(geo, mat);
    scene.add(mesh);

    activeSmokePuffs.push({
        mesh, geo, mat, vel, pos,
        startTime: performance.now(),
        duration: 1800
    });
}

function updateSmokePuffs(now) {
    for (let i = activeSmokePuffs.length - 1; i >= 0; i--) {
        const p = activeSmokePuffs[i];
        const elapsed = now - p.startTime;
        const progress = elapsed / p.duration;

        if (progress >= 1.0) {
            scene.remove(p.mesh);
            p.geo.dispose();
            p.mat.dispose();
            activeSmokePuffs.splice(i, 1);
            continue;
        }

        const positions = p.geo.attributes.position.array;
        for (let k = 0; k < p.vel.length; k++) {
            const k3 = k * 3;
            positions[k3] += p.vel[k].x;
            positions[k3 + 1] += p.vel[k].y;
            positions[k3 + 2] += p.vel[k].z;
        }
        p.geo.attributes.position.needsUpdate = true;
        p.mat.uniforms.uOpacity.value = (1.0 - progress) * 0.7;
    }
}

// Helper: Draw text along a curved circular arc (Right-side up)
function drawCurvedText(ctx, text, S, radius, startAngle, endAngle, cyOffset, fontSpec, isBottomArc) {
    ctx.font = fontSpec;
    const chars = [...text];
    const angleStep = (endAngle - startAngle) / Math.max(1, chars.length - 1);

    chars.forEach((ch, idx) => {
        const ang = startAngle + idx * angleStep;
        const x = S / 2 + Math.cos(ang) * radius;
        const y = S / 2 + Math.sin(ang) * radius + cyOffset;
        
        // Character rotation angle (keep text right-side up for both top and bottom arcs!)
        const rotAngle = isBottomArc ? (ang - Math.PI / 2) : (ang + Math.PI / 2);

        // Shadow
        ctx.save();
        ctx.translate(x + 5, y + 5);
        ctx.rotate(rotAngle);
        ctx.fillStyle = 'rgba(5,45,5,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        // Main Green Stroke & Fill
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotAngle);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeStyle = '#063A06';
        ctx.lineWidth = 16;
        ctx.lineJoin = 'round';
        ctx.strokeText(ch, 0, 0);

        ctx.fillStyle = '#1EC01E';
        ctx.fillText(ch, 0, 0);

        ctx.fillStyle = 'rgba(170,255,130,0.28)';
        ctx.fillText(ch, 0, 0);

        ctx.restore();
    });
}

function makeCakeTopTex(name) {
    const S = 1024;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = S;
    const ctx = cvs.getContext('2d');

    // Solid Pink Base
    ctx.fillStyle = '#E6589B';
    ctx.fillRect(0, 0, S, S);

    ctx.save();
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 4, 0, Math.PI * 2);
    ctx.clip();

    // Rich Pink Spatula Radial Frosting
    const pg = ctx.createRadialGradient(S / 2, S * 0.38, 0, S / 2, S / 2, S / 2);
    pg.addColorStop(0, '#FF8DC2');
    pg.addColorStop(0.55, '#F0589E');
    pg.addColorStop(1, '#C8387C');
    ctx.fillStyle = pg;
    ctx.fillRect(0, 0, S, S);

    // Spatula frosting strokes
    for (let i = 0; i < 450; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() * (S / 2) * 0.95;
        const x = S / 2 + r * Math.cos(ang);
        const y = S / 2 + r * Math.sin(ang);
        const w = Math.random() * 70 + 25;
        const h = Math.random() * 8 + 3;
        const lgt = Math.random() > 0.48;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang + Math.PI / 2 + (Math.random() - .5) * .7);
        ctx.fillStyle = lgt
            ? `rgba(255,215,245,${Math.random() * .16})`
            : `rgba(140,25,75,${Math.random() * .12})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // --- Iconic Central Vertical Crack Line (From Movie Prop Screenshot) ---
    ctx.beginPath();
    ctx.moveTo(S / 2 - 10, S * 0.12);
    ctx.lineTo(S / 2 + 15, S * 0.42);
    ctx.lineTo(S / 2 - 5, S * 0.72);
    ctx.lineTo(S / 2 + 8, S * 0.88);
    ctx.strokeStyle = 'rgba(100, 15, 50, 0.65)';
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(S / 2 - 12, S * 0.12);
    ctx.lineTo(S / 2 + 13, S * 0.42);
    ctx.lineTo(S / 2 - 7, S * 0.72);
    ctx.strokeStyle = 'rgba(255, 190, 220, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore(); // end circle clip

    // Plate border lines
    ctx.strokeStyle = '#2A1010';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 7, 0, Math.PI * 2);
    ctx.stroke();

    // --- GIANT BOLD GREEN PIPED TEXT (Right-side up & Extra Large!) ---
    const label = name.toUpperCase().slice(0, 10);

    // 1. Top Line: "HAPPEE" (Curved upward along top rim, right-side up)
    drawCurvedText(ctx, 'HAPPEE', S, S * 0.35, -Math.PI * 0.76, -Math.PI * 0.24, -S * 0.06, '900 145px "Comic Sans MS","Chalkboard SE",cursive', false);

    // 2. Middle Line: "BIRTHDAE" (Horizontal across center, extra bold)
    ctx.font = '900 135px "Comic Sans MS","Chalkboard SE",cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mChars = [...'BIRTHDAE'];
    const cwArr  = mChars.map(c => ctx.measureText(c).width);
    const totalW = cwArr.reduce((a, b) => a + b, 0);
    let mx = S / 2 - totalW / 2;
    mChars.forEach((ch, ci) => {
        const cw = cwArr[ci];
        ctx.save();
        ctx.translate(mx + cw / 2, S * 0.50);

        ctx.strokeStyle = '#063A06';
        ctx.lineWidth = 18;
        ctx.lineJoin = 'round';
        ctx.strokeText(ch, 0, 0);

        ctx.fillStyle = '#1EC01E';
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        mx += cw;
    });

    // 3. Bottom Line: "[NAME]" (Curved along bottom rim, RIGHT-SIDE UP from Left to Right!)
    // Reversing start and end angles so text spells left-to-right (JAI instead of IAJ!)
    drawCurvedText(ctx, label, S, S * 0.35, Math.PI * 0.76, Math.PI * 0.24, S * 0.06, '900 140px "Comic Sans MS","Chalkboard SE",cursive', true);

    return new THREE.CanvasTexture(cvs);
}

function makePlateTex() {
    const S = 512;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = S;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#F0F0E8';
    ctx.fillRect(0, 0, S, S);

    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.8, '#F6F6F0');
    g.addColorStop(1, '#E4E4DA');
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = '#28180A';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#4A2A18';
    ctx.lineWidth = 5;
    ctx.setLineDash([13, 13]);
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#382010';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 55, 0, Math.PI * 2);
    ctx.stroke();

    return new THREE.CanvasTexture(cvs);
}

// ===================================================================
// HARRY POTTER GIFT BOX (Super bright crimson & glowing gold)
// ===================================================================
let boxSpotlight = null;

function buildGiftBox() {
    giftBoxGroup = new THREE.Group();

    const boxW = 7.2;
    const boxH = 4.2;
    const boxD = 7.2;

    // Super bright Gryffindor crimson red
    const boxMat = new THREE.MeshStandardMaterial({
        color: 0xD81E3A,
        roughness: 0.35,
        metalness: 0.1
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0xFFDF00, // Glowing gold ribbon
        roughness: 0.2,
        metalness: 0.9
    });

    // Box Base
    const baseGroup = new THREE.Group();

    const botGeo = new THREE.BoxGeometry(boxW, 0.2, boxD);
    const botMesh = new THREE.Mesh(botGeo, boxMat);
    botMesh.position.y = 0.1;
    baseGroup.add(botMesh);

    const wallThick = 0.15;
    const fbGeo = new THREE.BoxGeometry(boxW, boxH, wallThick);
    const fWall = new THREE.Mesh(fbGeo, boxMat);
    fWall.position.set(0, boxH / 2, boxD / 2);
    const bWall = new THREE.Mesh(fbGeo, boxMat);
    bWall.position.set(0, boxH / 2, -boxD / 2);
    baseGroup.add(fWall, bWall);

    const lrGeo = new THREE.BoxGeometry(wallThick, boxH, boxD);
    const lWall = new THREE.Mesh(lrGeo, boxMat);
    lWall.position.set(-boxW / 2, boxH / 2, 0);
    const rWall = new THREE.Mesh(lrGeo, boxMat);
    rWall.position.set(boxW / 2, boxH / 2, 0);
    baseGroup.add(lWall, rWall);

    const ribGeoX = new THREE.BoxGeometry(boxW + 0.08, boxH + 0.08, 0.45);
    const ribX = new THREE.Mesh(ribGeoX, ribbonMat);
    ribX.position.set(0, boxH / 2, 0);
    const ribGeoZ = new THREE.BoxGeometry(0.45, boxH + 0.08, boxD + 0.08);
    const ribZ = new THREE.Mesh(ribGeoZ, ribbonMat);
    ribZ.position.set(0, boxH / 2, 0);
    baseGroup.add(ribX, ribZ);

    giftBoxGroup.add(baseGroup);

    // Box Lid
    boxLidMesh = new THREE.Group();
    const lidW = boxW + 0.35;
    const lidH = 0.65;
    const lidD = boxD + 0.35;

    const lidTop = new THREE.Mesh(new THREE.BoxGeometry(lidW, 0.18, lidD), boxMat);
    lidTop.position.y = boxH + lidH / 2;
    boxLidMesh.add(lidTop);

    const bowGeo = new THREE.TorusGeometry(0.55, 0.14, 12, 24);
    const bowL = new THREE.Mesh(bowGeo, ribbonMat);
    bowL.rotation.y = Math.PI / 4;
    bowL.position.set(-0.35, boxH + lidH + 0.35, 0);
    const bowR = new THREE.Mesh(bowGeo, ribbonMat);
    bowR.rotation.y = -Math.PI / 4;
    bowR.position.set(0.35, boxH + lidH + 0.35, 0);
    boxLidMesh.add(bowL, bowR);

    giftBoxGroup.add(boxLidMesh);

    // Dedicated high-intensity warm spotlight right above the gift box
    boxSpotlight = new THREE.PointLight(0xFFF5E0, 5.0, 22);
    boxSpotlight.position.set(0, 8.5, 4);
    scene.add(boxSpotlight);

    scene.add(giftBoxGroup);
}

// ===================================================================
// BUILD CAKE (Cake starts inside gift box)
// ===================================================================
const flameMats = [];
const candleData = [];

function buildCake(name) {
    const root = new THREE.Group();
    cakeGroupRef = root;

    // Cake initially inside the gift box (positioned at y = -2.5)
    root.position.y = -2.5;

    // --- Hogwarts Great Hall Heavy Oak Feast Table ---
    const tblTex = makeHogwartsTableTex();
    const tblMat = new THREE.MeshStandardMaterial({
        map: tblTex,
        roughness: 0.55,
        metalness: 0.15
    });

    const tblGeo = new THREE.CylinderGeometry(8.2, 8.4, 0.85, 64);
    const tbl = new THREE.Mesh(tblGeo, tblMat);
    tbl.position.y = -0.425;
    tbl.receiveShadow = true;
    scene.add(tbl);

    // Carved Table Bevel Rim
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x3D220F, roughness: 0.6 });
    const rimGeo = new THREE.TorusGeometry(8.3, 0.15, 12, 64);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.0;
    scene.add(rim);

    // 4 Heavy Carved Oak Table Legs with Brass Footings
    const legMat  = new THREE.MeshStandardMaterial({ color: 0x2A170A, roughness: 0.7 });
    const brassFootMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.3, metalness: 0.8 });

    const legR = 6.2;
    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const lx = Math.cos(ang) * legR;
        const lz = Math.sin(ang) * legR;

        const legGroup = new THREE.Group();
        const legCol = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 4.5, 16), legMat);
        legCol.position.y = -2.6;
        legGroup.add(legCol);

        const brassFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.4, 16), brassFootMat);
        brassFoot.position.y = -4.6;
        legGroup.add(brassFoot);

        legGroup.position.set(lx, 0, lz);
        scene.add(legGroup);
    }

    // Plate
    const plateTex = makePlateTex();
    const plateGeo = new THREE.CylinderGeometry(PLATE_RADIUS, PLATE_RADIUS, PLATE_HEIGHT, 128);
    const plateMats = [
        new THREE.MeshStandardMaterial({ color: 0xEEEEE0, roughness: 0.75 }),
        new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.70 }),
        new THREE.MeshStandardMaterial({ color: 0xDDDDD5, roughness: 0.80 }),
    ];
    const plate = new THREE.Mesh(plateGeo, plateMats);
    plate.position.y = PLATE_HEIGHT / 2;
    plate.receiveShadow = true;
    root.add(plate);

    // Cake Body
    const bodyBot = PLATE_HEIGHT;
    const bodyCY = bodyBot + CAKE_HEIGHT / 2;
    const cakeGeo = new THREE.CylinderGeometry(CAKE_RADIUS, CAKE_RADIUS, CAKE_HEIGHT, 128);
    const cakeMat = new THREE.MeshStandardMaterial({ color: 0xFFF2E2, roughness: 0.88, metalness: 0 });
    const cakeBody = new THREE.Mesh(cakeGeo, cakeMat);
    cakeBody.position.y = bodyCY;
    cakeBody.castShadow = true;
    cakeBody.receiveShadow = true;
    root.add(cakeBody);

    // Layer Line
    const lGeo = new THREE.TorusGeometry(CAKE_RADIUS + 0.01, 0.025, 8, 128);
    const lMat = new THREE.MeshStandardMaterial({ color: 0xD8C0A0, roughness: 0.9 });
    const lyr = new THREE.Mesh(lGeo, lMat);
    lyr.rotation.x = Math.PI / 2;
    lyr.position.y = bodyBot + CAKE_HEIGHT * 0.48;
    root.add(lyr);

    // Plain Pink Movie Frosting (No top strawberries/cream, matching original movie prop!)
    const frostTop = bodyBot + CAKE_HEIGHT;
    const frostCY = frostTop + FROSTING_H / 2;
    const topTex = makeCakeTopTex(name);
    const topGeo = new THREE.CylinderGeometry(CAKE_RADIUS + 0.06, CAKE_RADIUS, FROSTING_H, 128);
    const topMats = [
        new THREE.MeshStandardMaterial({ color: 0xFF589E, roughness: 0.85 }),
        new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.90 }),
        new THREE.MeshStandardMaterial({ color: 0xFF589E, roughness: 0.85 }),
    ];
    const frostMesh = new THREE.Mesh(topGeo, topMats);
    frostMesh.position.y = frostCY;
    frostMesh.castShadow = true;
    root.add(frostMesh);

    // Frosting Drips
    const DRIP_COUNT = 24;
    for (let i = 0; i < DRIP_COUNT; i++) {
        const ang = (i / DRIP_COUNT) * Math.PI * 2 + (Math.random() - .5) * 0.25;
        const len = Math.random() * 0.55 + 0.18;
        const rad = Math.random() * 0.09 + 0.055;
        const dGeo = new THREE.CapsuleGeometry(rad, len, 6, 14);
        const dMat = new THREE.MeshStandardMaterial({ color: 0xFF589E, roughness: 0.88 });
        const drip = new THREE.Mesh(dGeo, dMat);
        drip.position.set(
            Math.cos(ang) * (CAKE_RADIUS - 0.04),
            frostTop - len * 0.5 - 0.05,
            Math.sin(ang) * (CAKE_RADIUS - 0.04)
        );
        root.add(drip);
    }

    // ── 6 CANDLES (Positioned around top/sides, NONE at bottom front) ──
    const candleBase = frostTop + FROSTING_H;
    const ringR = CAKE_RADIUS * 0.72; // outer ring near edge
    const cColors = [0xFFD700, 0xFF69B4, 0x9B59B6, 0x00BCD4, 0xFF5722, 0x4CAF50];

    // Angles spanning from -140° to +140° (top and sides), leaving front bottom (+Z) 100% open for text!
    const angles = [-2.4, -1.6, -0.8, 0.8, 1.6, 2.4]; // radians

    for (let i = 0; i < CANDLE_COUNT; i++) {
        const ang = angles[i] - Math.PI / 2; // offset so top is -Z
        const cx = Math.cos(ang) * ringR;
        const cz = Math.sin(ang) * ringR;
        const cy = candleBase + CANDLE_HEIGHT / 2;

        const cGeo = new THREE.CylinderGeometry(CANDLE_RADIUS, CANDLE_RADIUS, CANDLE_HEIGHT, 24);
        const cMat = new THREE.MeshStandardMaterial({ color: cColors[i], roughness: 0.6, metalness: 0 });
        const candle = new THREE.Mesh(cGeo, cMat);
        candle.position.set(cx, cy, cz);
        candle.castShadow = true;
        root.add(candle);

        const wGeo = new THREE.SphereGeometry(CANDLE_RADIUS * 1.1, 8, 8);
        const wMat = new THREE.MeshStandardMaterial({ color: 0xFFF5DD, roughness: 0.9 });
        const wax = new THREE.Mesh(wGeo, wMat);
        wax.position.set(
            cx + Math.cos(ang + 1) * CANDLE_RADIUS,
            candleBase + CANDLE_HEIGHT * 0.88,
            cz + Math.sin(ang + 1) * CANDLE_RADIUS
        );
        wax.scale.set(1, 0.55, 1);
        root.add(wax);

        const wkGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.11, 8);
        const wkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const wick = new THREE.Mesh(wkGeo, wkMat);
        wick.position.set(cx, candleBase + CANDLE_HEIGHT + 0.055, cz);
        root.add(wick);

        const fm = makeFlameMat();
        flameMats.push(fm);
        const fGeo = new THREE.SphereGeometry(0.1, 16, 16);
        fGeo.translate(0, 0.1, 0);
        const flame = new THREE.Mesh(fGeo, fm);
        flame.position.set(cx, candleBase + CANDLE_HEIGHT + 0.11, cz);
        root.add(flame);

        const pl = new THREE.PointLight(cColors[i], 0.75, 6.0);
        pl.position.set(cx, candleBase + CANDLE_HEIGHT + 0.35, cz);
        root.add(pl);

        const flameWorldPos = new THREE.Vector3(cx, candleBase + CANDLE_HEIGHT + 0.15, cz);
        candleData.push({ flameMat: fm, light: pl, isLit: true, position: flameWorldPos });
    }

    scene.add(root);
    buildGiftBox();
    buildFloatingCandles();
    return root;
}

// ===================================================================
// AUDIO & NOISE-RESISTANT BLOW DETECTION
// ===================================================================
let audioCtx = null;
let analyser = null;
let isBlowing = false;
let blowStart = 0;
let songStarted = false;
let tapModeActive = false;

let ambientNoiseFloor = 0.05;
let calibrationSamples = 0;
let calibrationSum = 0;
let isCalibrating = true;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playWhooshSound() {
    try {
        const ctx = getAudioCtx();
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.32);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.34);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
    } catch (e) { console.log(e); }
}

function playMagicChimeSound() {
    try {
        const ctx = getAudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ctx.currentTime + idx * 0.08;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    } catch (e) { console.log(e); }
}

function playSong() {
    if (songStarted) return;
    songStarted = true;
    const ctx = getAudioCtx();

    const irLen = ctx.sampleRate * 0.55;
    const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
        const ch = irBuf.getChannelData(c);
        for (let i = 0; i < irLen; i++)
            ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.8);
    }
    const conv = ctx.createConvolver();
    conv.buffer = irBuf;

    const master = ctx.createGain(); master.gain.value = 0.38;
    const dry = ctx.createGain(); dry.gain.value = 0.72;
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    master.connect(dry); master.connect(conv); conv.connect(wet);
    dry.connect(ctx.destination); wet.connect(ctx.destination);

    let t = ctx.currentTime + 0.25;

    MELODY.forEach(([note, beats]) => {
        const dur = beats * TEMPO;
        const freq = NOTE[note];

        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.value = freq;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2.005;

        const g1 = ctx.createGain();
        g1.gain.setValueAtTime(0, t);
        g1.gain.linearRampToValueAtTime(0.58, t + 0.04);
        g1.gain.setValueAtTime(0.48, t + dur * 0.65);
        g1.gain.linearRampToValueAtTime(0, t + dur);

        const g2 = ctx.createGain(); g2.gain.value = 0.18;

        osc1.connect(g1); osc2.connect(g2); g2.connect(g1); g1.connect(master);
        osc1.start(t); osc1.stop(t + dur);
        osc2.start(t); osc2.stop(t + dur);
        t += dur;
    });

    startCountdown(SONG_SEC);

    setTimeout(() => {
        document.getElementById('song-countdown').classList.remove('show');
        document.getElementById('hold-reminder').classList.add('show');
        initMic();
    }, (SONG_SEC + 0.4) * 1000);
}

function startCountdown(total) {
    const cd = document.getElementById('song-countdown');
    const num = document.getElementById('countdown-number');
    cd.classList.add('show');
    let rem = total;
    num.textContent = rem;
    const iv = setInterval(() => {
        rem--;
        num.textContent = Math.max(rem, 0);
        if (rem <= 0) clearInterval(iv);
    }, 1000);
}

async function initMic() {
    const blowStatus = document.getElementById('blow-status');
    try {
        const ctx = getAudioCtx();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.25;

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true }
        });
        ctx.createMediaStreamSource(stream).connect(analyser);

        if (blowStatus) blowStatus.textContent = '🎤 Mic Active! Blow toward your mic to extinguish candles';

        isCalibrating = true;
        calibrationSamples = 0;
        calibrationSum = 0;

        setTimeout(() => {
            if (calibrationSamples > 0) {
                ambientNoiseFloor = Math.min(calibrationSum / calibrationSamples, 0.07);
                console.log('Calibrated ambient noise floor (capped):', ambientNoiseFloor);
                if (blowStatus) blowStatus.textContent = '✨ Ready! Blow into mic to extinguish candles';
            }
            isCalibrating = false;
        }, 1200);

        detectBlow();
    } catch (e) {
        console.warn('Mic unavailable or permission denied:', e);
        if (blowStatus) blowStatus.textContent = '👆 Mic disabled — Use Tap Mode below to blow candles!';
        enableTapModeUI();
    }
}

let lastBlownTime = 0;
const BLOW_COOLDOWN_MS = 700;

function detectBlow() {
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const meterBar = document.getElementById('mic-meter-bar');

    function tick() {
        if (!analyser) return;
        analyser.getByteFrequencyData(buf);

        let totalSum = 0;
        for (let i = 0; i < buf.length; i++) totalSum += buf[i];
        const totalAvg = (totalSum / buf.length) / 255;

        if (meterBar) {
            meterBar.style.width = `${Math.min(100, totalAvg * 450)}%`;
        }

        if (isCalibrating) {
            calibrationSum += totalAvg;
            calibrationSamples++;
        } else {
            const threshold = Math.max(0.10, ambientNoiseFloor * 2.0);
            const now = Date.now();

            if (totalAvg > threshold) {
                if (!isBlowing) {
                    isBlowing = true;
                    blowStart = now;
                } else if (now - blowStart > 120 && now - lastBlownTime > BLOW_COOLDOWN_MS) {
                    extinguishOne();
                    lastBlownTime = now;
                    isBlowing = false;
                }
            } else {
                isBlowing = false;
            }
        }
        requestAnimationFrame(tick);
    }
    tick();
}

function enableTapModeUI() {
    tapModeActive = true;
    document.getElementById('activate-tap-btn').classList.add('hidden');
    document.getElementById('tap-blow-btn').classList.remove('hidden');
    const blowStatus = document.getElementById('blow-status');
    if (blowStatus && blowStatus.textContent.includes('disabled')) {
        blowStatus.textContent = '✨ Tap Mode Active! Press button to blow candles';
    }
}

// ===================================================================
// EXTINGUISH & CELEBRATION LOGIC
// ===================================================================
let blown = 0;
let allOut = false;

function extinguishOne() {
    if (allOut) return;
    const lit = candleData.filter(c => c.isLit);
    if (!lit.length) return;

    const target = lit[Math.floor(Math.random() * lit.length)];
    target.isLit = false;
    target.flameMat.uniforms.uOut.value = 1;
    target.light.intensity = 0;
    blown++;

    playWhooshSound();
    spawnSmokePuff(target.position);

    if (blown >= CANDLE_COUNT) {
        allOut = true;
        setTimeout(celebrate, 650);
    }
}

function celebrate() {
    const name = localStorage.getItem('birthdayUserName') || 'HARRY';
    const age = localStorage.getItem('birthdayUserAge') || '';

    document.getElementById('personalized-name').textContent = `🪄 ${name.toUpperCase()} 🪄`;
    document.getElementById('age-wish-text').textContent = getAgeWish(age);

    document.getElementById('congratulation-overlay').classList.add('show');
    document.getElementById('hold-reminder').classList.remove('show');

    launchConfetti();
    playMagicChimeSound();
}

// ── HP-Style Confetti ──────────────────────────────────────────────
const confCvs = document.getElementById('confetti-canvas');
const confCtx = confCvs.getContext('2d');
let confParts = [];
let confActive = false;

function launchConfetti() {
    confCvs.width = innerWidth;
    confCvs.height = innerHeight;
    confActive = true;
    const colors = ['#FFD700', '#C0A000', '#FF80AB', '#9B59B6', '#FF5722', '#4CAF50', '#FFFACD', '#E060A0'];
    for (let i = 0; i < 300; i++) {
        confParts.push({
            x: Math.random() * innerWidth,
            y: -Math.random() * 250,
            vx: (Math.random() - .5) * 4.8,
            vy: Math.random() * 4.5 + 1.8,
            rot: Math.random() * 360,
            rs: (Math.random() - .5) * 9,
            w: Math.random() * 16 + 6,
            h: Math.random() * 8 + 4,
            col: colors[Math.floor(Math.random() * colors.length)],
            tp: Math.floor(Math.random() * 4),
        });
    }
    tickConfetti();
}

function tickConfetti() {
    if (!confActive) return;
    confCtx.clearRect(0, 0, confCvs.width, confCvs.height);
    confParts.forEach(p => {
        p.x += p.vx + (Math.random() - .5) * .3;
        p.y += p.vy;
        p.rot += p.rs;
        if (p.y > confCvs.height + 25) { p.y = -20; p.x = Math.random() * confCvs.width; }
        confCtx.save();
        confCtx.translate(p.x, p.y);
        confCtx.rotate(p.rot * Math.PI / 180);
        confCtx.fillStyle = p.col;

        if (p.tp === 0) {
            confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.tp === 1) {
            confCtx.beginPath();
            confCtx.arc(0, 0, p.h, 0, Math.PI * 2);
            confCtx.fill();
        } else if (p.tp === 2) {
            confCtx.beginPath();
            for (let k = 0; k < 5; k++) {
                const a = (k * 4 * Math.PI / 5) - Math.PI / 2;
                k === 0
                    ? confCtx.moveTo(Math.cos(a) * p.h, Math.sin(a) * p.h)
                    : confCtx.lineTo(Math.cos(a) * p.h, Math.sin(a) * p.h);
            }
            confCtx.closePath();
            confCtx.fill();
        } else {
            confCtx.beginPath();
            confCtx.moveTo(-2, -8);
            confCtx.lineTo(2, -2);
            confCtx.lineTo(-1, -2);
            confCtx.lineTo(3, 8);
            confCtx.lineTo(-1, 2);
            confCtx.lineTo(1, 2);
            confCtx.closePath();
            confCtx.fill();
        }
        confCtx.restore();
    });
    requestAnimationFrame(tickConfetti);
}

let cakeBuilt = false;
let readyToUnbox = false;
let hasUnboxed = false;

const nameScreen = document.getElementById('name-input-screen');
const nameInput = document.getElementById('user-name-input');
const ageInput = document.getElementById('age-input');
const startBtn = document.getElementById('start-celebration-btn');
const activateTapBtn = document.getElementById('activate-tap-btn');
const tapBlowBtn = document.getElementById('tap-blow-btn');
const restartBtn = document.getElementById('restart-btn');
const songStartBtn = document.getElementById('song-start-btn');

if (nameInput) nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') startBtn.click(); });
if (ageInput) ageInput.addEventListener('keydown', e => { if (e.key === 'Enter') startBtn.click(); });

function triggerUnboxing() {
    if (hasUnboxed) return;
    hasUnboxed = true;

    // Hide unbox prompt badge
    const unboxHint = document.getElementById('tap-unbox-hint');
    if (unboxHint) unboxHint.classList.remove('show');

    // Hedwig Owl spreads wings and slowly takes off into the sky!
    owlFlying = true;
    owlFlightStart = performance.now();

    // Trigger box opening reveal animation!
    isCameraAnimating = true;
    camAnimStartTime = performance.now();
    playMagicChimeSound();

    setTimeout(() => {
        if (songStartBtn) songStartBtn.classList.remove('hidden');
    }, CAM_ANIM_DURATION + 200);
}

startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || 'HARRY';
    const age = ageInput ? ageInput.value.trim() : '';

    localStorage.setItem('birthdayUserName', name);
    localStorage.setItem('birthdayUserAge', age);

    if (!cakeBuilt) {
        buildCake(name);
        buildGiftBox();
        buildOwl();
        buildHogwartsGifts();
        cakeBuilt = true;
    }

    nameScreen.classList.remove('show');
    readyToUnbox = true; // Ready immediately!

    // Show floating unbox prompt badge
    const unboxHint = document.getElementById('tap-unbox-hint');
    if (unboxHint) unboxHint.classList.add('show');
});

// Three.js Raycaster to detect clicks directly on the 3D Gift Box mesh!
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerClick(e) {
    if (nameScreen.classList.contains('show')) return;
    if (hasUnboxed) return;
    if (e.target.closest('#song-start-btn') || e.target.closest('.song-side-btn')) return;

    // Convert click coordinates to normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (giftBoxGroup) {
        const intersects = raycaster.intersectObjects(giftBoxGroup.children, true);
        if (intersects.length > 0) {
            triggerUnboxing();
            return;
        }
    }

    // Fallback: Click anywhere on screen also unboxes!
    triggerUnboxing();
}

window.addEventListener('click', onPointerClick);
window.addEventListener('pointerdown', onPointerClick);

if (songStartBtn) {
    songStartBtn.addEventListener('click', () => {
        songStartBtn.classList.add('hidden');
        getAudioCtx();
        setTimeout(playSong, 200);
    });
}

if (activateTapBtn) {
    activateTapBtn.addEventListener('click', () => {
        enableTapModeUI();
    });
}

if (tapBlowBtn) {
    tapBlowBtn.addEventListener('click', () => {
        extinguishOne();
    });
}

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        location.reload();
    });
}

// ===================================================================
// RENDER LOOP (Includes Gift Box Lid Lift & Cake Unboxing Animation)
// ===================================================================
const clock = new THREE.Clock();

(function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const now = performance.now();

    // Unboxing Animation (Lid lifts up & box drops away to reveal cake upfront)
    if (isCameraAnimating) {
        const progress = Math.min(1.0, (now - camAnimStartTime) / CAM_ANIM_DURATION);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Cake rises smoothly OUT of the box onto the table
        if (cakeGroupRef) {
            cakeGroupRef.position.y = -2.5 + easeProgress * 2.5; // rises from -2.5 up to 0.0
        }

        // Animate Gift Box lid lifting up into the air & box base dropping away
        if (boxLidMesh && progress > 0.15) {
            const lidProgress = (progress - 0.15) / 0.85;
            boxLidMesh.position.y = lidProgress * 15; // lid flies up into space
            boxLidMesh.rotation.z = lidProgress * 0.6;

            if (giftBoxGroup && lidProgress > 0.35) {
                giftBoxGroup.position.y = -(lidProgress - 0.35) * 12; // box drops down out of sight
            }
        }

        if (progress >= 1.0) {
            isCameraAnimating = false;
            if (giftBoxGroup) scene.remove(giftBoxGroup);
        }
    }

    flameMats.forEach(m => m.uniforms.uTime.value = t);
    floatingCandleData.forEach(fc => {
        fc.fMat.uniforms.uTime.value = t;
        fc.mesh.position.y = fc.baseH + Math.sin(t * fc.speed + fc.phase) * 0.35;
        fc.fLight.position.y = fc.mesh.position.y + 0.45;
        fc.flame.position.y = fc.mesh.position.y + 0.4;
    });

    stars.material.uniforms.uTime.value = t;
    sparkles.material.uniforms.uTime.value = t;

    torchLights.forEach((tl, idx) => {
        tl.intensity = 0.6 + 0.3 * Math.sin(t * 7 + idx * 2.1) + 0.1 * Math.sin(t * 15 + idx);
    });

    fillLight.intensity = 1.2 + 0.3 * Math.sin(t * 8.1) + 0.12 * Math.sin(t * 14.3);

    candleData.forEach((cd, idx) => {
        if (cd.isLit) {
            cd.light.intensity = 0.65 + 0.2 * Math.sin(t * 9 + idx * 1.7)
                + 0.08 * Math.sin(t * 17 + idx);
        }
    });

    updateSmokePuffs(now);

    // Hedwig Owl Animation (Perched head tilts + slow takeoff flight into sky)
    if (owlGroup) {
        if (!owlFlying) {
            // Gentle owl head tilts while perched on box
            if (headMesh) headMesh.rotation.y = Math.sin(t * 1.8) * 0.3;
        } else {
            const elapsed = now - owlFlightStart;
            const p = Math.min(1.0, elapsed / OWL_FLIGHT_DURATION);

            // Flap wings slowly and gracefully
            const flap = Math.sin(t * 11) * 0.55;
            if (leftWing) leftWing.rotation.z = flap;
            if (rightWing) rightWing.rotation.z = -flap;

            // Takeoff flight path: lifts off perched box (0, 5.3, 0) -> slowly flies into night sky (32, 28, -40)
            const perchPos = new THREE.Vector3(0, 5.3, 0);
            const skyPos = new THREE.Vector3(32, 28, -40);

            const easeP = p * p; // smooth takeoff acceleration
            owlGroup.position.lerpVectors(perchPos, skyPos, easeP);
            owlGroup.lookAt(skyPos);

            if (p >= 1.0) {
                scene.remove(owlGroup); // owl vanishes into night sky
            }
        }
    }

    // Golden Snitch Wing Flutter Animation
    if (snitchWingL && snitchWingR) {
        const sFlap = Math.sin(t * 18) * 0.45;
        snitchWingL.rotation.z = sFlap;
        snitchWingR.rotation.z = -sFlap;
    }

    controls.update();
    renderer.render(scene, camera);
}());

// ===================================================================
// RESIZE HANDLER
// ===================================================================
window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (confActive) { confCvs.width = innerWidth; confCvs.height = innerHeight; }
});
