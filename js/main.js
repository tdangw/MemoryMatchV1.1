// main.js - Quản lý game chính
// Chức năng của main.js là khởi tạo game, xử lý sự kiện và quản lý trạng thái game. Nó sẽ gọi các hàm từ các module khác để thực hiện các chức năng cụ thể như tạo lưới, xử lý âm thanh, cập nhật giao diện người dùng, v.v.
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
} from './ui.js';
import { gameState, resetGame, increaseScore } from './gameState.js';
import { checkLevelComplete, initLogic } from './logic.js';
import { createMainMenu } from './mainmenu.js';
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

  if (level > 1) {
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
  showBonusOverlay('⏰ Hết giờ! Bạn đã thua!');
}

// 🎁 Thưởng qua màn
function handleLevelReward() {
  const level = gameState.currentLevel;
  const remainingTime = gameState.remainingTime;
  const base = 5;
  const levelBonus = level * 2;
  const timeBonus = Math.floor(remainingTime / 10);
  const hintBonus = Math.max(0, 3) * 10;

  const reward = base + levelBonus + timeBonus + hintBonus;
  const hintGain = Math.ceil(level / 2);

  increaseScore(reward);
  gameState.hints += hintGain;
  gameState.remainingTime += 60;

  updateHintDisplay(gameState.hints);
  updateTimerDisplay(gameState.remainingTime);

  showLevelRewardOverlay({ reward, hintGain, timeBonus: 60 });
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
    resetGame();
    initializeLevel(1);
  };
}

const hintBtn = document.getElementById('btn-hint');
if (hintBtn) {
  hintBtn.onclick = handleHintClick;
}

const fullResetBtn = document.getElementById('btn-full-reset');
import { showResetConfirmationOverlay } from './ui.js';

if (fullResetBtn) {
  fullResetBtn.onclick = () => {
    showResetConfirmationOverlay();
  };
}

import { showReturnToMenuOverlay } from './ui.js';

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
