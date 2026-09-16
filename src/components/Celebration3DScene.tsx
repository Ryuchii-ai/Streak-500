import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GreetingData, PhotoFrameData } from '../types';
import {
  createCandleTexture,
  createDefaultPhotoTexture,
  createGreetingCardTexture,
  createNightSkylineTexture,
  createTableclothTexture,
  createWoodFrameTexture,
} from '../utils/textures';
import { sounds } from '../utils/audio';

interface Props {
  greeting: GreetingData;
  photos: PhotoFrameData[];
  isFlameLit: boolean;
  onToggleFlame: () => void;
  onSelectPhoto: (index: number) => void;
  onOpenCard: () => void;
  celebrateTrigger: number;
}

export const Celebration3DScene: React.FC<Props> = ({
  greeting,
  photos,
  isFlameLit,
  onToggleFlame,
  onSelectPhoto,
  onOpenCard,
  celebrateTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // References to animated 3D parts
  const flameGroupRef = useRef<THREE.Group | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const embersPointsRef = useRef<THREE.Points | null>(null);
  const photoMeshesRef = useRef<THREE.Mesh[]>([]);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const cakeMeshRef = useRef<THREE.Group | null>(null);
  const confettiMeshesRef = useRef<{
    mesh: THREE.Mesh;
    vx: number;
    vy: number;
    vz: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    driftPhase: number;
    driftSpeed: number;
    baseY: number;
  }[]>([]);

  // Drag controls state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetAngleRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: 0.28 });
  const currentAngleRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: 0.28 });
  const initialCamPos = { x: 0, y: 3.4, z: 7.2 };

  // Raycasting for interactive clicks on 3D elements
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Confetti burst particles
  const burstParticlesRef = useRef<{
    mesh: THREE.Mesh;
    vx: number;
    vy: number;
    vz: number;
    rotVx: number;
    rotVy: number;
    life: number;
    maxLife: number;
  }[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene & Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x060c18, 0.015);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(initialCamPos.x, initialCamPos.y, initialCamPos.z);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. Lighting ---
    // Ambient night moonlight
    const ambientLight = new THREE.AmbientLight(0x354a6b, 1.2);
    scene.add(ambientLight);

    // Directional moon/terrace light
    const moonLight = new THREE.DirectionalLight(0x89b0e8, 1.5);
    moonLight.position.set(-6, 12, 5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    scene.add(moonLight);

    // Dynamic flame light (orange/yellow flicker)
    const flameLight = new THREE.PointLight(0xff7711, 3.8, 14, 1.2);
    flameLight.position.set(0, 2.7, 0);
    flameLight.castShadow = true;
    flameLight.shadow.bias = -0.002;
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    // Warm fill light from front table edge
    const tableFill = new THREE.PointLight(0xffb077, 0.6, 8);
    tableFill.position.set(0, 1.5, 4);
    scene.add(tableFill);

    // --- 3. Panoramic Night Skyline Background ---
    const bgGeo = new THREE.CylinderGeometry(40, 40, 28, 48, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
    const bgMat = new THREE.MeshBasicMaterial({
      map: createNightSkylineTexture(),
      side: THREE.BackSide,
      fog: false,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.set(0, 8, 0);
    scene.add(bgMesh);

    // --- 4. Checkered Table & Cloth ---
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    // Main tabletop
    const tableclothTex = createTableclothTexture();
    const tableGeo = new THREE.BoxGeometry(16, 0.6, 10);
    const tableMat = new THREE.MeshStandardMaterial({
      map: tableclothTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, -0.3, 1.5);
    tableMesh.receiveShadow = true;
    tableGroup.add(tableMesh);

    // Front draped cloth drop
    const drapeGeo = new THREE.BoxGeometry(16, 4, 0.2);
    const drapeMesh = new THREE.Mesh(drapeGeo, tableMat);
    drapeMesh.position.set(0, -2.1, 6.4);
    drapeMesh.receiveShadow = true;
    tableGroup.add(drapeMesh);

    // --- 5. Celebratory Cake & 500-Day Streak Pedestal ---
    const cakeGroup = new THREE.Group();
    cakeGroup.position.set(0, 0, 0);
    scene.add(cakeGroup);
    cakeMeshRef.current = cakeGroup;

    // Ceramic serving plate
    const plateGeo = new THREE.CylinderGeometry(2.3, 2.0, 0.1, 48);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xf5edf0,
      roughness: 0.2,
      metalness: 0.1,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = 0.05;
    plate.receiveShadow = true;
    plate.castShadow = true;
    cakeGroup.add(plate);

    // Cake bottom layer (sponge & cream)
    const cakeBottomGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.9, 48);
    const cakeBottomMat = new THREE.MeshStandardMaterial({
      color: 0xf6cf97, // biscuit / yellow sponge cake
      roughness: 0.6,
    });
    const cakeBottom = new THREE.Mesh(cakeBottomGeo, cakeBottomMat);
    cakeBottom.position.y = 0.55;
    cakeBottom.castShadow = true;
    cakeBottom.receiveShadow = true;
    cakeGroup.add(cakeBottom);

    // Red strawberry jam ribbon stripe around cake (matching reference photo)
    const ribbonGeo = new THREE.CylinderGeometry(1.82, 1.82, 0.22, 48);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xb52233,
      roughness: 0.3,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.y = 0.45;
    cakeGroup.add(ribbon);

    // Cake top frosting layer
    const cakeTopGeo = new THREE.CylinderGeometry(1.82, 1.82, 0.35, 48);
    const cakeTopMat = new THREE.MeshStandardMaterial({
      color: 0xffa8b8, // strawberry pink cream frosting
      roughness: 0.4,
    });
    const cakeTop = new THREE.Mesh(cakeTopGeo, cakeTopMat);
    cakeTop.position.y = 1.1;
    cakeTop.castShadow = true;
    cakeGroup.add(cakeTop);

    // Cream swirls around the bottom rim of cake
    const creamSwirlGeo = new THREE.SphereGeometry(0.16, 12, 12);
    creamSwirlGeo.scale(1, 1.3, 1);
    const creamMat = new THREE.MeshStandardMaterial({
      color: 0xfff6f0,
      roughness: 0.35,
    });
    const swirlCount = 20;
    for (let i = 0; i < swirlCount; i++) {
      const angle = (i / swirlCount) * Math.PI * 2;
      const sx = Math.cos(angle) * 1.85;
      const sz = Math.sin(angle) * 1.85;
      const swirl = new THREE.Mesh(creamSwirlGeo, creamMat);
      swirl.position.set(sx, 0.18, sz);
      swirl.rotation.y = angle;
      swirl.castShadow = true;
      cakeGroup.add(swirl);
    }

    // Pocky / chocolate biscuit sticks angled upwards (like in reference image!)
    const stickGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.6, 16);
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0xd9823f, // biscuit color
      roughness: 0.7,
    });
    const stick1 = new THREE.Mesh(stickGeo, stickMat);
    stick1.position.set(0.35, 1.7, -0.2);
    stick1.rotation.z = -0.15;
    stick1.rotation.x = -0.1;
    stick1.castShadow = true;
    cakeGroup.add(stick1);

    const stick2 = new THREE.Mesh(stickGeo, stickMat);
    stick2.position.set(0.55, 1.65, -0.15);
    stick2.rotation.z = -0.28;
    stick2.rotation.y = 0.2;
    stick2.castShadow = true;
    cakeGroup.add(stick2);

    // Strawberries on top of cake
    const strawberryGeo = new THREE.ConeGeometry(0.24, 0.42, 16);
    const strawberryMat = new THREE.MeshStandardMaterial({
      color: 0xd6182f,
      roughness: 0.25,
      metalness: 0.05,
    });
    const sb1 = new THREE.Mesh(strawberryGeo, strawberryMat);
    sb1.position.set(-0.45, 1.4, 0.2);
    sb1.rotation.x = Math.PI * 0.95;
    sb1.rotation.z = 0.2;
    sb1.castShadow = true;
    cakeGroup.add(sb1);

    const sb2 = new THREE.Mesh(strawberryGeo, strawberryMat);
    sb2.position.set(-0.15, 1.4, 0.35);
    sb2.rotation.x = Math.PI * 0.92;
    sb2.rotation.z = -0.15;
    sb2.castShadow = true;
    cakeGroup.add(sb2);

    // Green leaves on cake top
    const leafGeo = new THREE.BoxGeometry(0.2, 0.03, 0.25);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x409144, roughness: 0.5 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(-0.55, 1.3, 0.4);
    leaf.rotation.y = 0.5;
    cakeGroup.add(leaf);

    // Cake candle with red/white diagonal candy stripe texture
    const candleGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.75, 20);
    const candleMat = new THREE.MeshStandardMaterial({
      map: createCandleTexture(),
      roughness: 0.3,
    });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0, 1.6, 0.05);
    candle.castShadow = true;
    cakeGroup.add(candle);

    // Candle wick
    const wickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const wick = new THREE.Mesh(wickGeo, wickMat);
    wick.position.set(0, 2.02, 0.05);
    cakeGroup.add(wick);

    // 3D Shiny Gold "500" & Fire Badge placed proudly on the cake
    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(0, 1.45, 0.65);
    badgeGroup.rotation.x = -0.12;

    // Glowing base backing
    const badgePlateGeo = new THREE.BoxGeometry(1.3, 0.46, 0.08);
    const badgePlateMat = new THREE.MeshStandardMaterial({
      color: 0x1f0e04,
      metalness: 0.8,
      roughness: 0.25,
    });
    const badgePlate = new THREE.Mesh(badgePlateGeo, badgePlateMat);
    badgePlate.castShadow = true;
    badgeGroup.add(badgePlate);

    // Badge border in polished gold
    const borderGeo = new THREE.BoxGeometry(1.36, 0.52, 0.04);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.9,
      roughness: 0.2,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.02;
    badgeGroup.add(borderMesh);

    // Texture for "500 STREAK 🔥" on badge
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 180;
    const bctx = badgeCanvas.getContext('2d')!;
    bctx.fillStyle = '#1c0c04';
    bctx.fillRect(0, 0, 512, 180);
    // Gold gradient text
    const grad = bctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#ffe066');
    grad.addColorStop(0.5, '#ffa94d');
    grad.addColorStop(1, '#ff6b6b');
    bctx.fillStyle = grad;
    bctx.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('500 🔥', 256, 75);

    bctx.fillStyle = '#ffc078';
    bctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    bctx.fillText('DAYS STREAK', 256, 140);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeTextGeo = new THREE.PlaneGeometry(1.24, 0.42);
    const badgeTextMat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true });
    const badgeText = new THREE.Mesh(badgeTextGeo, badgeTextMat);
    badgeText.position.z = 0.05;
    badgeGroup.add(badgeText);
    cakeGroup.add(badgeGroup);

    // --- 6. The Blazing 3D Streak Flame 🔥 ---
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 2.12, 0.05);
    cakeGroup.add(flameGroup);
    flameGroupRef.current = flameGroup;

    // Outer flame teardrop mesh
    const outerFlameGeo = new THREE.ConeGeometry(0.18, 0.58, 24);
    outerFlameGeo.translate(0, 0.26, 0);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameGroup.add(outerFlame);

    // Inner bright white/yellow core
    const innerFlameGeo = new THREE.ConeGeometry(0.09, 0.36, 16);
    innerFlameGeo.translate(0, 0.16, 0);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xfff4c2,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    flameGroup.add(innerFlame);

    // Glowing halo around flame
    const haloGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.28;
    flameGroup.add(halo);

    // Rising flame spark embers
    const emberCount = 35;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 0.2;
      emberPositions[i * 3 + 1] = Math.random() * 0.9 + 2.1;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2 + 0.05;

      emberVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      emberVelocities[i * 3 + 1] = Math.random() * 0.03 + 0.02;
      emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xffaa22,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const emberPoints = new THREE.Points(emberGeo, emberMat);
    scene.add(emberPoints);
    embersPointsRef.current = emberPoints;

    // Smoke particle system for when flame is blown out
    const smokeCount = 30;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = (Math.random() - 0.5) * 0.1;
      smokePositions[i * 3 + 1] = 2.1 + i * 0.05;
      smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x999999,
      size: 0.14,
      transparent: true,
      opacity: 0.4,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    smokePoints.visible = false;
    scene.add(smokePoints);
    smokeParticlesRef.current = smokePoints;

    // --- 7. Standing 3D Photo Frames (Arranged in arc like reference image) ---
    const framePositions = [
      { x: -3.85, z: 0.65, rotY: 0.44, tilt: -0.12 }, // Far left
      { x: -2.05, z: -0.15, rotY: 0.22, tilt: -0.12 }, // Inner left
      { x: 2.05, z: -0.15, rotY: -0.22, tilt: -0.12 }, // Inner right
      { x: 3.85, z: 0.65, rotY: -0.44, tilt: -0.12 }, // Far right
    ];

    const woodTex = createWoodFrameTexture();
    const photoMeshes: THREE.Mesh[] = [];

    framePositions.forEach((pos, idx) => {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(pos.x, 0, pos.z);
      frameGroup.rotation.y = pos.rotY;
      scene.add(frameGroup);

      // Frame container tilted backwards slightly on table
      const frameAssembly = new THREE.Group();
      frameAssembly.position.y = 0.95;
      frameAssembly.rotation.x = pos.tilt;
      frameGroup.add(frameAssembly);

      // Outer wooden beveled frame
      const frameOuterGeo = new THREE.BoxGeometry(1.65, 2.05, 0.12);
      const frameOuterMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.4,
        metalness: 0.2,
      });
      const frameOuter = new THREE.Mesh(frameOuterGeo, frameOuterMat);
      frameOuter.castShadow = true;
      frameOuter.receiveShadow = true;
      frameAssembly.add(frameOuter);

      // Beveled inner border
      const innerBevelGeo = new THREE.BoxGeometry(1.4, 1.8, 0.14);
      const innerBevelMat = new THREE.MeshStandardMaterial({
        color: 0xdfb080,
        roughness: 0.3,
        metalness: 0.4,
      });
      const innerBevel = new THREE.Mesh(innerBevelGeo, innerBevelMat);
      frameAssembly.add(innerBevel);

      // Photo picture plane
      const photoGeo = new THREE.PlaneGeometry(1.24, 1.64);
      const photoItem = photos[idx] || {
        id: idx,
        title: `Memory #${idx + 1}`,
        caption: '500 Days Streak',
        url: '',
      };

      // Create photo material
      const photoMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 0.08;
      photoMesh.userData = { frameIndex: idx, type: 'photo' };
      frameAssembly.add(photoMesh);
      photoMeshes.push(photoMesh);

      // Load texture
      createDefaultPhotoTexture(
        idx,
        photoItem.title,
        `Day ${125 * (idx + 1)} Streak`,
        photoItem.url
      ).then((tex) => {
        photoMat.map = tex;
        photoMat.needsUpdate = true;
      });

      // Frame back kickstand resting on table
      const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8);
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x5a341a,
        roughness: 0.6,
      });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(0, -0.2, -0.45);
      stand.rotation.x = -0.45;
      stand.castShadow = true;
      frameGroup.add(stand);
    });

    photoMeshesRef.current = photoMeshes;

    // --- 8. Greeting Card on the Table (Front Right) ---
    const cardGroup = new THREE.Group();
    cardGroup.position.set(2.4, 0.04, 2.6);
    cardGroup.rotation.y = -0.22; // angled towards viewer
    scene.add(cardGroup);

    const cardTex = createGreetingCardTexture(greeting);
    const cardGeo = new THREE.PlaneGeometry(1.8, 1.2);
    const cardMat = new THREE.MeshStandardMaterial({
      map: cardTex,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardMesh.rotation.x = -Math.PI / 2 + 0.04;
    cardMesh.receiveShadow = true;
    cardMesh.userData = { type: 'greetingCard' };
    cardGroup.add(cardMesh);
    cardMeshRef.current = cardMesh;

    // Card drop shadow plane underneath
    const shadowGeo = new THREE.PlaneGeometry(1.86, 1.26);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    });
    const cardShadow = new THREE.Mesh(shadowGeo, shadowMat);
    cardShadow.rotation.x = -Math.PI / 2;
    cardShadow.position.y = -0.01;
    cardGroup.add(cardShadow);

    // --- 9. Realistic 3D Falling & Drifting Confetti in Background & Scene ---
    const confettiMeshes: typeof confettiMeshesRef.current = [];
    const confettiCount = 380;
    const colors = [
      0xffd700, // Metallic Gold
      0xff6b35, // Vivid Flame Orange
      0xee1d52, // Celebratory Ruby Red
      0x4ecdc4, // Sparkle Turquoise
      0xffe66d, // Golden Yellow
      0xa06cd5, // Iridescent Violet
      0xffffff, // Silver shimmer
      0xff8fab, // Rose foil
    ];

    for (let i = 0; i < confettiCount; i++) {
      // Varied aspect ratios (foil flakes, rectangles, ribbons)
      const isRibbon = Math.random() > 0.75;
      const w = isRibbon ? 0.06 : Math.random() * 0.12 + 0.08;
      const h = isRibbon ? 0.38 : Math.random() * 0.12 + 0.08;

      const confGeo = new THREE.PlaneGeometry(w, h);
      const confColor = colors[Math.floor(Math.random() * colors.length)];
      const confMat = new THREE.MeshStandardMaterial({
        color: confColor,
        roughness: 0.25,
        metalness: 0.85,
        side: THREE.DoubleSide,
      });

      const confMesh = new THREE.Mesh(confGeo, confMat);

      // Distribute in a wide cylinder surrounding and behind table
      const spreadX = (Math.random() - 0.5) * 22;
      const spreadY = Math.random() * 14 - 1; // spanning high sky to table
      const spreadZ = Math.random() * 16 - 8;

      confMesh.position.set(spreadX, spreadY, spreadZ);
      confMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      scene.add(confMesh);

      confettiMeshes.push({
        mesh: confMesh,
        vx: (Math.random() - 0.5) * 0.008,
        vy: -(Math.random() * 0.018 + 0.012), // gentle falling speed
        vz: (Math.random() - 0.5) * 0.008,
        rotX: (Math.random() - 0.5) * 0.05,
        rotY: (Math.random() - 0.5) * 0.07,
        rotZ: (Math.random() - 0.5) * 0.04,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 1.5 + 1.0,
        baseY: spreadY,
      });
    }
    confettiMeshesRef.current = confettiMeshes;

    // --- 10. Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera smooth interpolation based on user mouse drag or idle drift
      currentAngleRef.current.theta +=
        (cameraTargetAngleRef.current.theta - currentAngleRef.current.theta) * 0.08;
      currentAngleRef.current.phi +=
        (cameraTargetAngleRef.current.phi - currentAngleRef.current.phi) * 0.08;

      // Subtle atmospheric idle drift
      const idleFloatX = Math.sin(elapsedTime * 0.4) * 0.12;
      const idleFloatY = Math.cos(elapsedTime * 0.5) * 0.08;

      const radius = 7.6;
      const theta = currentAngleRef.current.theta;
      const phi = currentAngleRef.current.phi;

      camera.position.x = Math.sin(theta) * radius * Math.cos(phi) + idleFloatX;
      camera.position.y = Math.sin(phi) * radius + 1.2 + idleFloatY;
      camera.position.z = Math.cos(theta) * radius * Math.cos(phi);
      camera.lookAt(0, 1.4, 0);

      // Animate 3D Flame
      if (flameGroupRef.current) {
        if (isFlameLit) {
          flameGroupRef.current.visible = true;

          // Organic flame flicker
          const flicker = Math.sin(elapsedTime * 18) * 0.08 + Math.sin(elapsedTime * 32) * 0.05;
          flameGroupRef.current.scale.set(1 + flicker, 1 + flicker * 1.8, 1 + flicker);
          flameGroupRef.current.rotation.z = Math.sin(elapsedTime * 8) * 0.06;

          // Dynamic light flicker
          if (flameLightRef.current) {
            flameLightRef.current.intensity = 3.6 + Math.sin(elapsedTime * 24) * 0.7 + Math.random() * 0.3;
          }

          // Animate flame embers rising
          if (embersPointsRef.current) {
            embersPointsRef.current.visible = true;
            const positions = embersPointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < emberCount; i++) {
              positions[i * 3 + 1] += emberVelocities[i * 3 + 1];
              positions[i * 3] += Math.sin(elapsedTime * 4 + i) * 0.003;

              // Reset when reaching top
              if (positions[i * 3 + 1] > 3.8) {
                positions[i * 3 + 1] = 2.15;
                positions[i * 3] = (Math.random() - 0.5) * 0.2;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2 + 0.05;
              }
            }
            embersPointsRef.current.geometry.attributes.position.needsUpdate = true;
          }

          if (smokeParticlesRef.current) {
            smokeParticlesRef.current.visible = false;
          }
        } else {
          // Flame blown out
          flameGroupRef.current.visible = false;
          if (flameLightRef.current) {
            flameLightRef.current.intensity = 0.2; // soft moonlight only
          }
          if (embersPointsRef.current) {
            embersPointsRef.current.visible = false;
          }
          if (smokeParticlesRef.current) {
            smokeParticlesRef.current.visible = true;
            const positions = smokeParticlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < smokeCount; i++) {
              positions[i * 3 + 1] += 0.015;
              positions[i * 3] += Math.sin(elapsedTime * 2 + i) * 0.004;
              if (positions[i * 3 + 1] > 3.6) {
                positions[i * 3 + 1] = 2.05;
              }
            }
            smokeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
        }
      }

      // Animate Realistic Falling & Fluttering Confetti
      for (let i = 0; i < confettiMeshes.length; i++) {
        const item = confettiMeshes[i];
        item.mesh.position.y += item.vy;

        // Fluttering air resistance motion
        item.driftPhase += item.driftSpeed * delta;
        item.mesh.position.x += Math.sin(item.driftPhase) * 0.008;
        item.mesh.position.z += Math.cos(item.driftPhase * 0.8) * 0.006;

        // 3-axis rotation (tumbling in air)
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
        item.mesh.rotation.z += item.rotZ;

        // When confetti falls below table / sightline, recycle to top
        if (item.mesh.position.y < -1.5) {
          item.mesh.position.y = 12 + Math.random() * 2;
          item.mesh.position.x = (Math.random() - 0.5) * 22;
          item.mesh.position.z = Math.random() * 16 - 8;
        }
      }

      // Animate explosive confetti burst particles
      if (burstParticlesRef.current.length > 0) {
        for (let i = burstParticlesRef.current.length - 1; i >= 0; i--) {
          const bp = burstParticlesRef.current[i];
          bp.life += delta;
          bp.mesh.position.x += bp.vx;
          bp.mesh.position.y += bp.vy;
          bp.mesh.position.z += bp.vz;

          // Gravity and air drag
          bp.vy -= 0.004;
          bp.vx *= 0.985;
          bp.vz *= 0.985;

          bp.mesh.rotation.x += bp.rotVx;
          bp.mesh.rotation.y += bp.rotVy;

          if (bp.life >= bp.maxLife) {
            scene.remove(bp.mesh);
            burstParticlesRef.current.splice(i, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 11. Mouse & Touch Controls ---
    const handleMouseDown = (e: MouseEvent) => {
      // Don't drag if clicking buttons
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      // Limit horizontal and vertical rotation
      cameraTargetAngleRef.current.theta -= deltaX * 0.004;
      cameraTargetAngleRef.current.phi += deltaY * 0.003;

      // Clamp angles to stay front-facing the celebration table
      cameraTargetAngleRef.current.theta = Math.max(-0.65, Math.min(0.65, cameraTargetAngleRef.current.theta));
      cameraTargetAngleRef.current.phi = Math.max(0.12, Math.min(0.55, cameraTargetAngleRef.current.phi));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      cameraTargetAngleRef.current.theta -= deltaX * 0.005;
      cameraTargetAngleRef.current.phi += deltaY * 0.004;

      cameraTargetAngleRef.current.theta = Math.max(-0.65, Math.min(0.65, cameraTargetAngleRef.current.theta));
      cameraTargetAngleRef.current.phi = Math.max(0.12, Math.min(0.55, cameraTargetAngleRef.current.phi));

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Click handler for 3D elements (clicking cake/candle or photo frame or card)
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Check hits on cake / candle
      const cakeHits = raycasterRef.current.intersectObjects(cakeGroup.children, true);
      if (cakeHits.length > 0) {
        onToggleFlame();
        return;
      }

      // Check hits on greeting card
      if (cardMeshRef.current) {
        const cardHits = raycasterRef.current.intersectObject(cardMeshRef.current);
        if (cardHits.length > 0) {
          sounds.playChime();
          onOpenCard();
          return;
        }
      }

      // Check hits on photo frames
      const photoHits = raycasterRef.current.intersectObjects(photoMeshesRef.current);
      if (photoHits.length > 0) {
        const hit = photoHits[0].object;
        if (hit.userData && typeof hit.userData.frameIndex === 'number') {
          sounds.playChime();
          onSelectPhoto(hit.userData.frameIndex);
          return;
        }
      }
    };

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run once on mount

  // Update photos when state changes
  useEffect(() => {
    if (photoMeshesRef.current.length > 0) {
      photos.forEach((p, idx) => {
        const mesh = photoMeshesRef.current[idx];
        if (mesh && mesh.material) {
          createDefaultPhotoTexture(idx, p.title, `Day ${125 * (idx + 1)} Streak`, p.url).then(
            (tex) => {
              (mesh.material as THREE.MeshBasicMaterial).map = tex;
              (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
            }
          );
        }
      });
    }
  }, [photos]);

  // Update greeting card when greeting state changes
  useEffect(() => {
    if (cardMeshRef.current && cardMeshRef.current.material) {
      const tex = createGreetingCardTexture(greeting);
      (cardMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
      (cardMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }, [greeting]);

  // Trigger celebratory confetti cannon blast in 3D scene
  useEffect(() => {
    if (celebrateTrigger === 0 || !sceneRef.current) return;

    sounds.playConfettiPop();

    // Spawn 150 burst particles erupting upwards from the cake
    const burstCount = 140;
    const colors = [0xffd700, 0xff4500, 0xff1493, 0x00f5d4, 0x7b2cbf, 0xffffff, 0xffb703];

    for (let i = 0; i < burstCount; i++) {
      const size = Math.random() * 0.14 + 0.06;
      const geo = new THREE.PlaneGeometry(size, size * (Math.random() > 0.5 ? 2.5 : 1));
      const mat = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.2,
        metalness: 0.9,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Start right at cake top / streak flame
      mesh.position.set((Math.random() - 0.5) * 0.6, 2.2, (Math.random() - 0.5) * 0.6);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.15 + 0.08;
      const upward = Math.random() * 0.22 + 0.14;

      sceneRef.current.add(mesh);

      burstParticlesRef.current.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: upward,
        vz: Math.sin(angle) * speed,
        rotVx: (Math.random() - 0.5) * 0.3,
        rotVy: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: Math.random() * 2.5 + 2.5,
      });
    }
  }, [celebrateTrigger]);

  return (
    <div
      ref={mountRef}
      id="three-canvas-container"
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
