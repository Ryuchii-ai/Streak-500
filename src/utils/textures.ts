import * as THREE from 'three';
import { GreetingData } from '../types';

/**
 * Generates the checkered tablecloth texture matching the reference photo
 */
export function createTableclothTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base warm linen color
  ctx.fillStyle = '#f4e9de';
  ctx.fillRect(0, 0, size, size);

  // Checkered grid parameters
  const gridSize = 64;

  // Pattern stripes
  for (let x = 0; x < size; x += gridSize) {
    const isColEven = (x / gridSize) % 2 === 0;
    for (let y = 0; y < size; y += gridSize) {
      const isRowEven = (y / gridSize) % 2 === 0;

      if (isColEven && isRowEven) {
        // Burgundy / dark red block
        ctx.fillStyle = '#8b2e3b';
        ctx.fillRect(x, y, gridSize, gridSize);
      } else if (!isColEven && !isRowEven) {
        // Deep warm brownish charcoal or deep maroon
        ctx.fillStyle = '#3a2024';
        ctx.fillRect(x, y, gridSize, gridSize);
      } else {
        // Semi-transparent overlay block (salmon/pink tint)
        ctx.fillStyle = '#c56b77';
        ctx.fillRect(x, y, gridSize, gridSize);
      }

      // Thin accent lines
      ctx.strokeStyle = '#df9ca5';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 4, y + 4, gridSize - 8, gridSize - 8);

      ctx.strokeStyle = '#42161c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + gridSize / 2, y);
      ctx.lineTo(x + gridSize / 2, y + gridSize);
      ctx.moveTo(x, y + gridSize / 2);
      ctx.lineTo(x + gridSize, y + gridSize / 2);
      ctx.stroke();
    }
  }

  // Fabric weave noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the panoramic night city skyline background (like Shanghai Bund in reference photo)
 */
export function createNightSkylineTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient from deep space to dark navy horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);
  skyGrad.addColorStop(0, '#040711');
  skyGrad.addColorStop(0.5, '#081225');
  skyGrad.addColorStop(0.85, '#132140');
  skyGrad.addColorStop(1, '#1b2d4d');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.75);

  // Stars in the upper sky
  for (let i = 0; i < 240; i++) {
    const sx = Math.random() * width;
    const sy = Math.random() * (height * 0.45);
    const rad = Math.random() * 1.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
    ctx.beginPath();
    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Water at bottom with city reflections
  const waterGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
  waterGrad.addColorStop(0, '#0a1626');
  waterGrad.addColorStop(0.5, '#050c17');
  waterGrad.addColorStop(1, '#02050a');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // Buildings and skyscrapers
  const horizonY = height * 0.72;
  const numBuildings = 85;
  const buildingWidth = width / numBuildings;

  for (let i = 0; i < numBuildings; i++) {
    const bx = i * buildingWidth;
    const bHeight = 120 + Math.sin(i * 0.35) * 80 + (Math.random() * 190);
    const by = horizonY - bHeight;
    const bWidth = buildingWidth * (1 + Math.random() * 0.4);

    // Building silhouette
    const isSpecialTower = i % 14 === 3;
    const isNeonTower = i % 10 === 7;

    // Building body
    ctx.fillStyle = isSpecialTower ? '#09152b' : '#071020';
    ctx.fillRect(bx, by, bWidth, bHeight);

    // Illuminated windows
    const windowCols = Math.floor(bWidth / 7);
    const windowRows = Math.floor(bHeight / 9);

    const warmPalette = ['#ffd685', '#ffaa40', '#7fd3ff', '#ffffff', '#ff6584'];

    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        if (Math.random() > 0.45) {
          const color = warmPalette[Math.floor(Math.random() * warmPalette.length)];
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.random() * 0.85 + 0.15;
          ctx.fillRect(bx + c * 7 + 2, by + r * 9 + 3, 3.5, 4.5);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // Special landmark spire / Oriental Pearl style spheres
    if (isSpecialTower) {
      // Radio tower spire
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + bWidth / 2, by);
      ctx.lineTo(bx + bWidth / 2, by - 90);
      ctx.stroke();

      // Glowing sphere
      ctx.fillStyle = '#9933ff';
      ctx.beginPath();
      ctx.arc(bx + bWidth / 2, by - 40, 14, 0, Math.PI * 2);
      ctx.fill();

      // Flashing beacon
      ctx.fillStyle = '#ff1144';
      ctx.beginPath();
      ctx.arc(bx + bWidth / 2, by - 90, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Neon billboards / rooftop glow
    if (isNeonTower) {
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(bx + 4, by + 10, bWidth - 8, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('500🔥', bx + 6, by + 21);
    }

    // Water reflections below
    const reflectLength = bHeight * 0.55;
    const rGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + reflectLength);
    rGrad.addColorStop(0, 'rgba(255, 180, 70, 0.4)');
    rGrad.addColorStop(0.3, 'rgba(0, 180, 255, 0.2)');
    rGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rGrad;

    for (let wy = horizonY; wy < horizonY + reflectLength; wy += 4) {
      const waveOffset = Math.sin(wy * 0.1 + bx) * 6;
      ctx.fillRect(bx + waveOffset, wy, bWidth * 0.8, 2.5);
    }
  }

  // Soft atmospheric mist at horizon
  const mistGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 30);
  mistGrad.addColorStop(0, 'rgba(25, 45, 80, 0)');
  mistGrad.addColorStop(0.6, 'rgba(40, 75, 130, 0.35)');
  mistGrad.addColorStop(1, 'rgba(10, 20, 40, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, horizonY - 40, width, 70);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates rich wood frame texture for the 3D standing photo frames
 */
export function createWoodFrameTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm golden oak / light mahogany wood
  ctx.fillStyle = '#b3845c';
  ctx.fillRect(0, 0, size, size);

  // Wood grain lines
  for (let y = 0; y < size; y++) {
    const wave = Math.sin(y * 0.08) * 10 + Math.sin(y * 0.2) * 4;
    const darkness = (Math.sin(y * 0.35 + wave * 0.1) + 1) * 0.5;
    ctx.fillStyle = `rgba(110, 68, 38, ${darkness * 0.35})`;
    ctx.fillRect(0, y, size, 1.5);
  }

  // Inner beveled highlight
  ctx.strokeStyle = '#dfad80';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, size - 6, size - 6);

  ctx.strokeStyle = '#61381c';
  ctx.lineWidth = 4;
  ctx.strokeRect(9, 9, size - 18, size - 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates the greeting card texture lying on the table
 */
export function createGreetingCardTexture(data: GreetingData): THREE.CanvasTexture {
  const width = 512;
  const height = 340;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Card parchment background
  ctx.fillStyle = '#faf6ed';
  ctx.fillRect(0, 0, width, height);

  // Subtle border / inner stroke
  ctx.strokeStyle = '#e0d5be';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Fire streak badge / cute mascot on the left
  // Fire icon background circle
  ctx.fillStyle = '#ffe9d6';
  ctx.beginPath();
  ctx.arc(80, 85, 45, 0, Math.PI * 2);
  ctx.fill();

  // Fire emoji / flame illustration
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔥', 80, 82);

  // "500" badge under fire
  ctx.fillStyle = '#d9480f';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${data.streakDays} HARI`, 80, 115);

  // Main Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#b23b00';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CONGRATS STREAK!', 150, 60);

  // Subhead
  ctx.fillStyle = '#e8590c';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`🔥 ${data.streakDays} Hari Tanpa Putus! 🔥`, 150, 85);

  // Divider
  ctx.strokeStyle = '#ffd8a8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(150, 100);
  ctx.lineTo(470, 100);
  ctx.stroke();

  // Recipient
  ctx.fillStyle = '#343a40';
  ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Untuk: ${data.recipient}`, 35, 150);

  // Body message (wrapped text)
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#495057';

  const paragraphs = data.message.split('\n');
  let currentY = 172;
  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      currentY += 8;
      return;
    }
    const words = paragraph.split(' ');
    let currentLine = '';
    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 440 && currentLine) {
        ctx.fillText(currentLine, 35, currentY);
        currentY += 16;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) {
      ctx.fillText(currentLine, 35, currentY);
      currentY += 16;
    }
  });

  // Stamp / seal in bottom right
  ctx.fillStyle = '#c92a2a';
  ctx.font = 'bold 13px "Cinzel", serif';
  ctx.textAlign = 'right';
  ctx.fillText(`DARI: ${data.sender}`, 470, 292);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#868e96';
  ctx.fillText(data.dateStr, 470, 312);

  // Little golden star stamp
  ctx.font = '20px sans-serif';
  ctx.fillText('⭐🏆⭐', 220, 295);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates diagonal spiral candy/candle texture
 */
export function createCandleTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Red spiral stripes
  ctx.fillStyle = '#d92534';
  const stripeWidth = 24;
  for (let i = -size; i < size * 2; i += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth + size, size);
    ctx.lineTo(i + size, size);
    ctx.closePath();
    ctx.fill();
  }

  // Thin gold accent
  ctx.strokeStyle = '#ffc83b';
  ctx.lineWidth = 2;
  for (let i = -size; i < size * 2; i += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates celebratory memory photo for frames
 */
export function createDefaultPhotoTexture(
  index: number,
  title: string,
  badgeText: string,
  userImgUrl?: string
): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    // If user provided an image URL, load and rasterize to canvas for reliable 3D rendering
    if (userImgUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill background matching streak card color
          ctx.fillStyle = index === 0 ? '#fbcfe8' : '#eed5fc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const w = img.naturalWidth || img.width || 512;
          const h = img.naturalHeight || img.height || 768;
          const imgAspect = w / h;
          const canvasAspect = canvas.width / canvas.height;

          let drawW = canvas.width;
          let drawH = canvas.height;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            drawH = canvas.width / imgAspect;
            drawY = (canvas.height - drawH) / 2;
          } else {
            drawW = canvas.height * imgAspect;
            drawX = (canvas.width - drawW) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          resolve(texture);
        } else {
          const texture = new THREE.Texture(img);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          resolve(texture);
        }
      };
      img.onerror = () => {
        resolve(createProceduralMemoryCard(index, title, badgeText));
      };
      img.src = userImgUrl;
      return;
    }

    resolve(createProceduralMemoryCard(index, title, badgeText));
  });
}

function createProceduralMemoryCard(index: number, title: string, badgeText: string): THREE.CanvasTexture {
  const width = 400;
  const height = 500;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background gradients for memories
  const gradients = [
    ['#2b1055', '#7597de', '#ff7e5f'], // Sunset milestone
    ['#141e30', '#243b55', '#ff9900'], // Fire streak night
    ['#4b1248', '#f0c27b', '#f857a6'], // High vibe celebrate
    ['#000428', '#004e92', '#00ffcc'], // Cool electric milestone
  ];

  const colors = gradients[index % gradients.length];
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.6, colors[1]);
  grad.addColorStop(1, colors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft glow center
  const radialGlow = ctx.createRadialGradient(width / 2, height * 0.42, 20, width / 2, height * 0.42, 160);
  radialGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Center celebration icon/graphic
  const icons = ['🔥', '🏆', '⚡', '👑'];
  ctx.font = '100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icons[index % icons.length], width / 2, height * 0.4);

  // Milestone Badge pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.roundRect(width / 2 - 120, height * 0.62, 240, 44, 22);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, width / 2, height * 0.62 + 23);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, width / 2, height * 0.78);

  // Footer date / streak note
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Day 1 ➔ Day 500 Streak', width / 2, height * 0.85);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
