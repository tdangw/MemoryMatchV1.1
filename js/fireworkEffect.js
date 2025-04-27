// fireworkEffect.js

// Chuẩn hóa requestAnimFrame để vẽ mượt
/* global gameState */

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

// Khai báo biến chính
let canvas,
  ctx,
  fireworks = [],
  particles = [],
  hue = 120;
let timerTotal = 500,
  timerTick = 0;

// Tính khoảng cách hai điểm
function calculateDistance(p1x, p1y, p2x, p2y) {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

// Random trong khoảng
function random(min, max) {
  return Math.random() * (max - min) + min;
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

// Tạo particles khi pháo nổ
function createParticles(x, y, count = 20) {
  // tăng lên nếu cần pháo to
  let particleCount = count;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}
function createBigFirework() {
  createParticles(canvas.width / 2, canvas.height / 2, 50); // Pháo to với 50 particles
}

// Loop animation
function loop() {
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
    var temp = timerTick % 400;
    if (temp <= 15) {
      fireworks.push(new Firework(100, canvas.height, random(190, 200), random(90, 100)));
      fireworks.push(
        new Firework(canvas.width - 100, canvas.height, random(canvas.width - 200, canvas.width - 190), random(90, 100))
      );
    }

    var temp3 = temp / 10;
    if (temp > 319) {
      fireworks.push(new Firework(300 + (temp3 - 31) * 100, canvas.height, 300 + (temp3 - 31) * 100, 200));
    }

    timerTick++;
  }
}

// Hàm public gọi từ logic.js
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

  // Đặt màu theo level hiện tại nếu cần
  if (typeof gameState !== 'undefined') {
    if (gameState.currentLevel <= 5) {
      hue = 50; // vàng cam
    } else if (gameState.currentLevel <= 10) {
      hue = 200; // xanh dương
    } else if (gameState.currentLevel <= 15) {
      hue = 320; // hồng tím
    } else {
      hue = 120; // xanh lá mặc định
    }
  }

  loop();
  createBigFirework(); // 🎆 Pháo chùm to giữa màn hình

  setTimeout(() => {
    fireworks = [];
    particles = [];
    canvas.style.display = 'none';
  }, duration);
}
