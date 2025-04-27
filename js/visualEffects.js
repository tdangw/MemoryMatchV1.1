// 🌌 Hiệu ứng nền menu: Mưa sao băng + Mây + Sương mù

// 🌫️ 1. Tạo sương mù
export function createFogEffect() {
  const fog = document.createElement('div');
  fog.className = 'fog';
  document.body.appendChild(fog);
}

// ☁️ 2. Mây bay nhẹ (4 cụm mây ngẫu nhiên)
export function createClouds() {
  const cloudConfigs = [
    { top: 80, delay: 0 },
    { top: 180, delay: 30 },
    { top: 250, delay: 20 },
    { top: 300, delay: 45 },
  ];

  cloudConfigs.forEach(({ top, delay }) => {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.top = `${top}px`;
    cloud.style.animationDelay = `${delay}s`;
    document.body.appendChild(cloud);
  });
}

// 🌠 3. Tạo hiệu ứng sao băng rơi
function createShootingStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');

  const left = Math.random() * window.innerWidth;
  const isBright = Math.random() < 0.15;
  const length = isBright ? 160 : 60 + Math.random() * 100;
  const duration = 0.3 + Math.random() * 5;
  const brightness = isBright ? 0.95 : 0.4 + Math.random() * 0.5;

  star.style.left = `${left}px`;
  star.style.height = `${length}px`;
  star.style.opacity = brightness;
  star.style.animationDuration = `${duration}s`;

  if (isBright) {
    const head = document.createElement('div');
    head.className = 'star-head';
    star.appendChild(head);
  }

  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, duration * 1000 + 100);
}

// 🌟 4. Tạo mưa sao liên tục mỗi 0.8 giây
export function startStarShower() {
  setInterval(createShootingStar, 800);
}
