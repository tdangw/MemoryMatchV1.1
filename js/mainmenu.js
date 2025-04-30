import { showSettingsPanel } from './settings.js';
import { gameState, resetGame } from './gameState.js';
import { initializeLevel } from './main.js';
export const VERSION = 'v1.1';
function setupVersionInfo() {
  const versionEl = document.getElementById('version-info');
  if (!versionEl) return;

  versionEl.textContent = `ℹ️ ${VERSION}`;
  versionEl.onclick = () => {
    const overlay = document.createElement('div');
    overlay.className = 'version-overlay';
    overlay.innerHTML = `
  <h3>ℹ️ Thông tin phiên bản <strong>${VERSION}</strong></h3>
  <ul style="text-align: left; line-height: 1.6;">
    <li>🛠 Cập nhật hiệu ứng cộng điểm</li>
    <li>🔊 Mặc định bật âm thanh</li>
    <li>🎛️ Thêm menu cài đặt trong game</li>
    <li>🖼️ Khắc phục hình ảnh vừa với title</li>
    <li>🖱️ Hiệu ứng click</li>
    <li>🎮 Menu chọn chế độ chơi</li>
    <li>✨ Thêm hiệu ứng cộng điểm</li>
    <li>⚡ Tối ưu game mượt hơn</li>
    <li>🛒 Thêm Shop</li>
    <li>🎉 Cải thiện giao diện và hiệu ứng</li>
  </ul>
  <button class="version-btn" style="margin-top: 10px;">Đóng 123</button>
`;

    document.body.appendChild(overlay);

    overlay.querySelector('button').onclick = () => overlay.remove();
  };
}
createMainMenu();
setupVersionInfo();

/**
 * 📌 Định nghĩa và export hàm showInfoModal để tránh lỗi 'no-undef'
 */
export function showInfoModal(title, message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';

  const h2 = document.createElement('h2');
  h2.textContent = title;

  const p = document.createElement('p');
  p.innerHTML = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'settings-btn';
  closeBtn.textContent = 'Đóng AA';

  closeBtn.onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');

    setTimeout(() => {
      document.body.removeChild(overlay);
      createMainMenu();

      const audio = document.getElementById('bg-music');
      if (
        audio &&
        gameState.settings?.sound &&
        gameState.settings.menuMusic &&
        gameState.settings.menuMusic !== 'none'
      ) {
        audio.src = `assets/sounds/${gameState.settings.menuMusic}`;
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch((err) => console.warn('Không thể phát nhạc menu:', err));
      }
    }, 300);
  };

  modal.appendChild(h2);
  modal.appendChild(p);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Tạo giao diện menu chính của game
 */
export function createMainMenu() {
  if (document.getElementById('menu-container')) return;

  const menuOverlay = document.createElement('div');
  menuOverlay.id = 'menu-container';
  menuOverlay.className = 'menu-overlay';

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-wrapper';

  const title = document.createElement('h1');
  title.className = 'game-title';
  title.textContent = 'Memory Match';
  wrapper.appendChild(title);

  const menuList = document.createElement('ul');
  menuList.className = 'menu-list';

  const menuItems = [
    {
      text: '🎮 Bắt đầu',
      action: () => {
        document.body.removeChild(menuOverlay);
        showDifficultyOverlay();
      },
    },
    {
      text: '⚙️ Cài đặt',
      action: () => {
        document.body.removeChild(menuOverlay);
        showSettingsPanel();
      },
    },
    {
      text: '📖 Hướng dẫn',
      action: () => {
        showInfoModal(
          '⚡Hướng dẫn',
          '🎯 Tìm cặp hình giống nhau để ghi điểm.<br>🎁 Click đúng ô đặc biệt để nhận thưởng!'
        );
      },
    },
    {
      text: 'ℹ️ Thông tin',
      action: () => {
        showInfoModal('📜Thông tin game', `🎴Memory Match<br>✨Tác giả: Đăng & 🤖<br>ℹ️Phiên bản ${VERSION}`);
      },
    },
    {
      text: '❌ Thoát',
      action: () => window.close(),
    },
  ];

  menuItems.forEach(({ text, action }) => {
    const li = document.createElement('li');
    li.className = 'menu-item';
    li.textContent = text;
    li.onclick = action;
    menuList.appendChild(li);
  });

  wrapper.appendChild(menuList);
  menuOverlay.appendChild(wrapper);
  document.body.appendChild(menuOverlay);
}

/**
 * Hiển thị overlay chọn chế độ chơi (popup gọn)
 */
export function showDifficultyOverlay(fromGame = false) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const popup = document.createElement('div');
  popup.id = 'difficulty-overlay';
  popup.className = 'popup-box';

  popup.innerHTML = `
    <h2>Chọn chế độ chơi</h2>
    <button class="difficulty-btn" data-mode="easy">🟢 Dễ</button>
    <button class="difficulty-btn" data-mode="normal">🟡 Bình thường</button>
    <button class="difficulty-btn" data-mode="hard">🔴 Khó</button>
    <button id="cancel-difficulty" class="cancel-btn">❌ Hủy A</button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // 🎮 Gán label đúng ngữ cảnh
  updateCancelButtonLabel(fromGame);

  // 📌 Gán sự kiện chọn chế độ
  popup.querySelectorAll('.difficulty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      gameState.fromDefeat = false; // ✅ reset cờ

      resetGame(); // 🧹 reset sạch state

      const mode = btn.dataset.mode;
      gameState.settings.mode = mode; // ✅ gán sau reset
      console.log('🔧 Chế độ chơi:', mode);

      initializeLevel(1); // 🟢 gọi tạo lưới đúng chế độ
      document.body.removeChild(overlay);
    });
  });

  // 📌 Gán hành vi cancel tùy theo ngữ cảnh
  const cancelBtn = popup.querySelector('#cancel-difficulty');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      handleCancelAction(fromGame);
    });
  }
}

function updateCancelButtonLabel(fromGame) {
  const cancelBtn = document.getElementById('cancel-difficulty');
  if (!cancelBtn) return;

  if (fromGame && gameState.fromDefeat) {
    cancelBtn.textContent = '🏠 Menu';
  } else if (fromGame) {
    cancelBtn.textContent = '➖ Tiếp tục chơi';
  } else {
    cancelBtn.textContent = '❌❌ Hủy 11';
  }
}

function handleCancelAction(fromGame) {
  if (fromGame && gameState.fromDefeat) {
    resetGame();
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';
    createMainMenu();
    gameState.fromDefeat = false; // Reset cờ
  } else if (fromGame) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'flex';
  } else {
    if (!document.getElementById('menu-container')) {
      createMainMenu();
    }
  }
}

// ==========================
// 🌌 Hiệu ứng nền menu: Mưa sao băng + Mây + Sương mù
// ==========================
const fog = document.createElement('div');
fog.className = 'fog';
document.body.appendChild(fog);

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
  setTimeout(() => star.remove(), duration * 1000 + 100);
}

setInterval(createShootingStar, 800);

// ==========================
// 🔊 Tự động bật âm thanh khi click vào menu
window.addEventListener(
  'click',
  () => {
    if (!gameState.settings.sound) {
      gameState.settings.sound = true;
      gameState.settings.soundUnlocked = true;
      localStorage.setItem('sound', 'true');
      localStorage.setItem('soundUnlocked', 'true');
      console.log('🔊 Âm thanh đã được bật tự động từ menu');
    }
  },
  { once: true }
);
