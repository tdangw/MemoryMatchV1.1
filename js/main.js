// main.js - Quản lý game chính
// Chức năng của main.js là khởi tạo game, xử lý sự kiện và quản lý trạng thái game. Nó sẽ gọi các hàm từ các module khác để thực hiện các chức năng cụ thể như tạo lưới, xử lý âm thanh, cập nhật giao diện người dùng, v.v.
import { showDifficultyOverlay, createMainMenu } from './mainmenu.js';
import { getGridSizeByLevel } from './utils.js'; // Tính toán kích thước lưới theo level
import { createGrid } from './grid.js';
import {
  updateLevelDisplay,
  updateScoreDisplay,
  updateHintDisplay,
  updateTimerDisplay,
  showBonusOverlay,
  showLevelRewardOverlay,
  updateHighScoreDisplay,
  showReturnToMenuOverlay,
  showResetConfirmationOverlay,
  highlightTarget,
} from './ui.js';
import { gameState, resetGame, increaseScore } from './gameState.js';
import { checkLevelComplete, initLogic } from './logic.js';
import { showSettingsPanel } from './settings.js';

document.getElementById('btn-game-settings')?.addEventListener('click', () => {
  showSettingsPanel(true); // 👈 true = gọi từ trong game
});

let countdownInterval;

// Load menu & highscore khi khởi động
window.onload = () => {
  createMainMenu();
  updateHighScoreDisplay(gameState.highScore);
};

export function initializeLevel(level) {
  console.log(`[🧩INIT] Tạo lưới cho level ${level}`);

  // ✅ Tính kích thước lưới theo chế độ chơi
  const mode = gameState.settings?.mode || 'easy';
  const gridSize = getGridSizeByLevel(level, mode);
  createGrid(gridSize, level);

  const gameContainer = document.getElementById('game-container');
  if (gameContainer) gameContainer.style.display = 'flex';

  updateLevelDisplay(level);
  updateScoreDisplay(gameState.score);
  updateHintDisplay(gameState.hints || 0);
  updateTimerDisplay(gameState.remainingTime);

  const audio = document.getElementById('bg-music');
  if (audio && gameState.settings?.sound && gameState.settings.bgMusic !== 'none') {
    audio.src = `assets/sounds/${gameState.settings.bgMusic}`;
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch((err) => console.warn('Không thể phát nhạc:', err));
  }

  initLogic();
  startCountdown();

  if (level >= 1) {
    handleLevelReward();
  }
}

// 🟢 Khởi tạo lưới theo level

// ⏳ Đếm ngược thời gian
function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    gameState.remainingTime--;
    updateTimerDisplay(gameState.remainingTime);

    if (gameState.remainingTime <= 0) {
      clearInterval(countdownInterval);
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  gameState.isLocked = true;

  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2 class="overlay-title glow-text">⏰ Hết giờ!</h2>
    <p>Bạn đã thua! Bạn có muốn chơi lại không?:</p>
    <div class="button-row" style="margin-top: 20px;">
      <button class="confirm-btn">🔄 Chơi lại</button>
      <button class="menu-btn">❌ Menu</button> <!-- 👈 Tên class riêng -->
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (gameState.settings?.sound) {
    const audio = document.getElementById('bg-music');
    if (audio) audio.pause();

    import('./sound.js').then(({ sounds }) => {
      sounds.defeat.currentTime = 0;
      sounds.defeat.play().catch(() => {});
    });
  }

  // 🔁 Chơi lại: chọn lại chế độ chơi
  modal.querySelector('.confirm-btn').onclick = () => {
    overlay.remove();
    gameState.fromDefeat = true; // ✅ Đánh dấu đang gọi từ trạng thái thua
    showDifficultyOverlay(true); // gọi lại chọn chế độ chơi
  };

  // ❌ Menu: reset và quay lại menu chính (class riêng để tránh trùng)
  modal.querySelector('.menu-btn').onclick = () => {
    overlay.remove();
    resetGame();

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';

    createMainMenu();
  };
}

// 🎁 Thưởng qua màn
function handleLevelReward() {
  const hintCount = gameState.hints;
  const level = gameState.currentLevel;
  const remainingTime = gameState.remainingTime;

  let base = 10;
  let levelBonus = level * 2;
  let timeBonus = Math.floor(remainingTime / 10);
  let hintBonus = hintCount * 2;
  let reward = 0;
  let hintGain = 1;
  let extraTime = 30 + Math.floor(level / 5) * 5; // Cứ mỗi 5 level tăng thêm 5s

  if (level === 1) {
    // 🎯 Nếu là Level 1 ➔ Chỉnh riêng phần thưởng
    base = 0;
    levelBonus = 0;
    timeBonus = 0;
    hintBonus = 0;
    reward = 0; // Không cộng điểm
    hintGain = 0; // Không cộng thêm lượt gợi ý
    extraTime = 0; // Không cộng thêm thời gian
  } else {
    reward = base + levelBonus + timeBonus + hintBonus;
  }

  if (reward > 0) {
    increaseScore(reward);
  }
  if (hintGain > 0) {
    gameState.hints += hintGain;
  }
  if (extraTime > 0) {
    gameState.remainingTime += extraTime;
  }

  updateHintDisplay(gameState.hints);
  updateTimerDisplay(gameState.remainingTime);

  showLevelRewardOverlay({ reward, hintGain, timeBonus: extraTime });
}

// Chuyển màn
export function nextLevel() {
  gameState.currentLevel++;
  console.log(`[📤 nextLevel()] Chuyển sang level ${gameState.currentLevel}`);
  initializeLevel(gameState.currentLevel);
}

// Xử lý khi người chơi bấm gợi ý
function handleHintClick() {
  if (!gameState.hints || gameState.hints <= 0) {
    showBonusOverlay('🚫 Hết lượt gợi ý!');
    return;
  }

  const tiles = document.querySelectorAll('.tile:not(.matched)');
  const tilePairs = {};

  tiles.forEach((tile) => {
    const imageId = tile.dataset.imageId;
    if (!tilePairs[imageId]) {
      tilePairs[imageId] = [tile];
    } else {
      tilePairs[imageId].push(tile);
    }
  });

  for (let imageId in tilePairs) {
    if (tilePairs[imageId].length >= 2) {
      const [t1, t2] = tilePairs[imageId];
      simulateTileMatch(t1, t2);
      gameState.hints--;
      updateHintDisplay(gameState.hints);
      highlightTarget('#hint-count', true);
      return;
    }
  }

  showBonusOverlay('😕 Không tìm thấy cặp nào để gợi ý!');
}

// Giả lập ghép đúng
function simulateTileMatch(tile1, tile2) {
  const img1 = tile1.querySelector('img');
  const img2 = tile2.querySelector('img');
  if (img1) img1.classList.remove('hidden');
  if (img2) img2.classList.remove('hidden');

  tile1.classList.add('matched');
  tile2.classList.add('matched');

  increaseScore(1);
  checkLevelComplete();
}

const restartBtn = document.getElementById('btn-restart');
if (restartBtn) {
  restartBtn.onclick = () => {
    // 📌 Thay vì reset luôn → hỏi lại chế độ chơi
    resetGame();
    document.getElementById('game-container')?.style.setProperty('display', 'none');
    showDifficultyOverlay(true); // ✅ truyền true vì gọi từ trong game
  };
}

const hintBtn = document.getElementById('btn-hint');
if (hintBtn) {
  hintBtn.onclick = handleHintClick;
}

const fullResetBtn = document.getElementById('btn-full-reset');

if (fullResetBtn) {
  fullResetBtn.onclick = () => {
    showResetConfirmationOverlay();
  };
}

const menuBtn = document.getElementById('btn-menu');
if (menuBtn) {
  menuBtn.onclick = () => {
    showReturnToMenuOverlay();
  };
}

// 📦 Cài đặt nhanh trong game
const quickSettingsBtn = document.getElementById('in-game-settings-btn');
const quickSettingsOverlay = document.getElementById('quick-settings-overlay'); // Cài đặt cấu hình trong game
const quickCloseBtn = document.getElementById('quick-close-settings');
const quickToggleSound = document.getElementById('quick-toggle-sound');
const quickBgRadios = document.querySelectorAll('input[name="quick-bg-music"]');
const bgMusic = document.getElementById('bg-music');

if (quickSettingsBtn && quickSettingsOverlay) {
  quickSettingsBtn.onclick = () => {
    // Cập nhật trạng thái giao diện theo gameState
    quickToggleSound.checked = !!gameState.settings?.sound;
    quickBgRadios.forEach((r) => {
      r.checked = r.value === gameState.settings?.bgMusic;
    });
    quickSettingsOverlay.style.display = 'flex';
  };
}

if (quickCloseBtn) {
  quickCloseBtn.onclick = () => {
    quickSettingsOverlay.style.display = 'none';
  };
}

if (quickToggleSound) {
  quickToggleSound.onchange = () => {
    const on = quickToggleSound.checked;
    gameState.settings.sound = on;
    if (!on && bgMusic) bgMusic.pause();
    else {
      const selected = document.querySelector('input[name="quick-bg-music"]:checked');
      if (selected && selected.value !== 'none') {
        bgMusic.src = `assets/sounds/${selected.value}`;
        bgMusic.loop = true;
        bgMusic.volume = 0.5;
        bgMusic.play().catch(() => {});
      }
    }
  };
}

quickBgRadios.forEach((radio) => {
  radio.onchange = () => {
    const val = radio.value;
    gameState.settings.bgMusic = val;
    if (gameState.settings.sound && val !== 'none') {
      bgMusic.src = `assets/sounds/${val}`;
      bgMusic.loop = true;
      bgMusic.volume = 0.5;
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  };
});
