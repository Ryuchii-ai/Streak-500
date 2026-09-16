export interface PhotoFrameData {
  id: number;
  title: string;
  url: string;
  caption: string;
}

export interface GreetingData {
  recipient: string;
  sender: string;
  title: string;
  message: string;
  streakDays: number;
  dateStr: string;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  size: number;
  aspect: number;
  color: string;
  flutterSpeed: number;
  flutterPhase: number;
}
