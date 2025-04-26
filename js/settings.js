// Settings hiện tại chỉ xử lý riêng phần giao diện của menu cài đặt

import { gameState } from './gameState.js';
import { createMainMenu } from './mainmenu.js';

const settingsContainer = document.getElementById('settings-container');
const menuContainer = document.getElementById('menu-container');
const audio = document.getElementById('bg-music');

// ⚙️ Cài đặt mặc định nếu chưa có
if (!gameState.settings) {
  gameState.settings = {
    mode: 'easy',
    sound: true,
    soundUnlocked: false,
    menuMusic: 'none',
    bgMusic: 'none',
  };
}

/**
 * Hiển thị menu Cài đặt
 * @param {boolean} fromGame - Nếu gọi từ trong game thì không ẩn menu và chỉ hiện nút ""
 */
export function showSettingsPanel(fromGame = false) {
  settingsContainer.style.display = 'block';
  settingsContainer.classList.add('fade-in');

  if (!fromGame && menuContainer) {
    menuContainer.style.display = 'none';
  }

  // Phân biệt context để hiện đúng nút
  const backToMenuBtn = document.getElementById('btn-back-menu');
  const backInGameBtn = document.getElementById('btn-back');

  if (fromGame) {
    backToMenuBtn.style.display = 'none';
    backInGameBtn.style.display = 'inline-block';
  } else {
    backToMenuBtn.style.display = 'inline-block';
    backInGameBtn.style.display = 'none';
  }

  // Gán toggle âm thanh
  const toggle = document.getElementById('toggle-sound');
  if (toggle) {
    toggle.checked = gameState.settings.sound;
    toggle.onchange = () => {
      gameState.settings.sound = toggle.checked;
      if (!toggle.checked && audio) {
        audio.pause();
      } else {
        const selected = document.querySelector('input[name="menu-music"]:checked');
        if (selected && selected.value !== 'none') {
          playMusic(`assets/sounds/${selected.value}`);
        }
      }
    };
  }

  // Nhạc menu
  document.querySelectorAll('input[name="menu-music"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.menuMusic;
    radio.onchange = () => {
      gameState.settings.menuMusic = radio.value;
      if (gameState.settings.sound && radio.value !== 'none') {
        playMusic(`assets/sounds/${radio.value}`);
      } else {
        audio.pause();
      }
    };
  });

  // Nhạc game
  document.querySelectorAll('input[name="game-music"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.bgMusic;
    radio.onchange = () => {
      gameState.settings.bgMusic = radio.value;
      if (gameState.settings.sound && radio.value !== 'none') {
        playMusic(`assets/sounds/${radio.value}`);
      } else {
        audio.pause();
      }
    };
  });

  // Gán chế độ chơi
  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.mode;
  });
}

/**
 * Phát nhạc với đường dẫn
 */
function playMusic(src) {
  if (!audio) return;
  audio.src = src;
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch((err) => {
    console.warn('🔇 Không thể phát nhạc:', err);
  });
}

// 🔘 Nút quay về menu
document.getElementById('btn-back-menu')?.addEventListener('click', () => {
  settingsContainer.style.display = 'none';
  createMainMenu();
});

// ✅ Nút quay lại trong game
document.getElementById('btn-back')?.addEventListener('click', () => {
  settingsContainer.style.display = 'none';
});
