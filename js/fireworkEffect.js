// fireworkEffect.js - bản chuẩn gốc pháo hoa
/* global gameState */

// Tối ưu requestAnimationFrame
const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

// Các biến toàn cục
let canvas,
  ctx,
  fireworks = [],
  particles = [],
  hue = 120;
let timerTotal = 500,
  timerTick = 0;
let isFireworkActive = false;

// Random trong khoảng
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Khoảng cách 2 điểm
function calculateDistance(p1x, p1y, p2x, p2y) {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

// Firework class
class Firework {
  constructor(sx, sy, tx, ty) {
    this.x = sx;
    this.y = sy;
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = Array(3).fill([this.x, this.y]);
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
  }

  update(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }

    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
    ctx.stroke();

    ctx.beginPath();
    ctx.stroke();
  }
}

// Particle class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.coordinates = Array(5).fill([this.x, this.y]);
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 0.6;
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.0075, 0.009);
  }

  update(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();
  }
}

// Tạo particles nổ
function createParticles(x, y) {
  let particleCount = 20;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// Vòng lặp animation
function loop() {
  if (!isFireworkActive) return;
  requestAnimFrame(loop);

  hue += 0.5;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = 'lighter';

  fireworks.forEach((fw, i) => {
    fw.draw();
    fw.update(i);
  });

  particles.forEach((p, i) => {
    p.draw();
    p.update(i);
  });

  if (timerTick >= timerTotal) {
    timerTick = 0;
  } else {
    const temp = timerTick % 175;
    if (temp <= 15) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 3;

      fireworks.push(
        new Firework(centerX, canvas.height, random(centerX - 10, centerX + 10), random(centerY - 10, centerY + 10))
      );
    }
    timerTick++;
  }
}

// Bắt đầu show pháo hoa
export function startFireworkShow(duration = 3000) {
  canvas = document.getElementById('firework-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  fireworks = [];
  particles = [];
  timerTick = 0;

  if (typeof gameState !== 'undefined') {
    if (gameState.currentLevel <= 5) {
      hue = 50;
    } else if (gameState.currentLevel <= 10) {
      hue = 200;
    } else if (gameState.currentLevel <= 15) {
      hue = 320;
    } else {
      hue = 120;
    }
  }

  isFireworkActive = true;
  loop();

  setTimeout(() => {
    isFireworkActive = false;
    fireworks = [];
    particles = [];
    canvas.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, duration);
}
// Pháo hoa đợt 2
const PARTICLES_PER_FIREWORK = 150;
const BASE_PARTICLE_SPEED = 0.6;

export function triggerVictoryFireworks(count = 3) {
  let bursts = 0;

  const interval = setInterval(() => {
    const speed = Math.random() * 2 + BASE_PARTICLE_SPEED;
    const x = canvas.width / 2 + (Math.random() * 160 - 80);
    const y = canvas.height / 3 + (Math.random() * 60 - 30);

    let red = ~~(Math.random() * 255);
    let green = ~~(Math.random() * 255);
    let blue = ~~(Math.random() * 255);

    red = red < 150 ? red + 150 : red;
    green = green < 150 ? green + 150 : green;
    blue = blue < 150 ? blue + 150 : blue;

    let maxSpeed = speed;

    for (let i = 0; i < PARTICLES_PER_FIREWORK; i++) {
      const particle = new Particle(x, y, red, green, blue, speed);
      particles.push(particle);
      maxSpeed = speed > maxSpeed ? speed : maxSpeed;
    }

    for (let i = 0; i < 40; i++) {
      const particle = new Particle(x, y, red, green, blue, maxSpeed, true);
      particles.push(particle);
    }

    bursts++;
    if (bursts >= count) clearInterval(interval);
  }, 500);
}
