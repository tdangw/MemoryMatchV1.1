import { gameState } from './gameState.js';
import {
  updateScoreDisplay,
  updateHintDisplay,
  updateTimerDisplay,
  showShopMessage,
  animateIconToTarget,
} from './ui.js';
import { showRevealTimerNextToHint } from './ui.js';

// Danh sách vật phẩm
const shopData = [
  { id: 'time-10', title: '⏱️ 10 giây', price: 1, type: 'time', value: 10 },
  { id: 'time-30', title: '⏱️ 30 giây', price: 2, type: 'time', value: 30 },
  { id: 'time-45', title: '⏱️ 45 giây', price: 3, type: 'time', value: 45 },
  { id: 'time-60', title: '⏱️ 60 giây', price: 4, type: 'time', value: 60 },
  { id: 'hint-1', title: '🔍 1 lượt gợi ý', price: 1, type: 'hint', value: 1 },
  { id: 'hint-1', title: '🔍 2 lượt gợi ý', price: 2, type: 'hint', value: 2 },
  { id: 'hint-3', title: '🔍 3 lượt gợi ý', price: 3, type: 'hint', value: 3 },
  { id: 'reveal-random', title: '🧩 Lật 4 hình', price: 1, type: 'reveal-random', value: 4 },
  { id: 'reveal-random', title: '🧩 Lật 8 hình', price: 2, type: 'reveal-random', value: 8 },
  { id: 'reveal-all', title: '🧩 Lật tất cả hình', price: 3, type: 'reveal-all' },
];

export function openShopOverlay() {
  // Dừng thời gian
  if (gameState.countdownInterval) {
    clearInterval(gameState.countdownInterval);
  }
  gameState.isPaused = true;

  const overlay = document.createElement('div');
  overlay.className = 'shop-fullscreen-overlay';

  const container = document.createElement('div');
  container.className = 'shop-container';

  const grid = document.createElement('div');
  grid.className = 'shop-item-grid';

  shopData.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'shop-item';

    const title = document.createElement('div');
    title.className = 'shop-item-title';
    title.textContent = item.title;

    const button = document.createElement('button');
    button.className = 'shop-buy-button';
    button.textContent = `${item.price}⭐`;
    button.onclick = () => {
      handleBuyItem(item);
      closeShopOverlay(); // 👉 đóng shop ngay sau khi mua
    };

    function closeShopOverlay() {
      const overlay = document.querySelector('.shop-fullscreen-overlay');
      if (overlay) {
        overlay.remove();
        gameState.isPaused = false;
      }
    }
    const closeBtn = document.createElement('button');
    closeBtn.className = 'shop-close-button';
    closeBtn.textContent = 'Đóng';
    closeBtn.onclick = closeShopOverlay; // Phải khai báo sau function closeShopOverlay

    card.appendChild(title);
    card.appendChild(button);
    grid.appendChild(card);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'shop-close-button';
  closeBtn.textContent = 'Đóng';
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
    gameState.isPaused = false;
  };

  container.appendChild(grid);
  container.appendChild(closeBtn);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

// Mua vật phẩm
function handleBuyItem(item) {
  if (gameState.score < item.price) {
    showShopMessage('❌ Không đủ điểm!');
    return;
  }

  gameState.score -= item.price;
  updateScoreDisplay(gameState.score);

  switch (item.type) {
    case 'time':
      gameState.remainingTime += item.value;
      updateTimerDisplay(gameState.remainingTime);
      animateIconToTarget('⏱️', '#timer');
      showShopMessage(`+${item.value}s thời gian`);
      break;
    case 'hint':
      gameState.hints += item.value;
      updateHintDisplay(gameState.hints);
      animateIconToTarget('🔍', '#hint');
      showShopMessage(`+${item.value} gợi ý`);
      break;
    case 'reveal-random':
      revealRandomTiles(item.value, 5000);
      showShopMessage(`🔍 Hiển thị ${item.value} ô`);
      break;
    case 'reveal-all':
      revealAllTiles(5000);
      showShopMessage('🧩 Hiển thị toàn bộ');
      break;
  }
}

// Hỗ trợ hiệu ứng
function revealRandomTiles(count, duration = 5000) {
  const tiles = Array.from(document.querySelectorAll('.tile:not(.matched) img.hidden'));
  shuffleArray(tiles);
  const selected = tiles.slice(0, count);

  selected.forEach((img) => {
    img.classList.remove('hidden');
    img.classList.add('highlight-tile');
  });
  showRevealTimerNextToHint(5); // hiện ⏳ 5s ở góc phải

  setTimeout(() => {
    selected.forEach((img) => {
      img.classList.add('hidden');
      img.classList.remove('highlight-tile');
    });
  }, duration);
}

function revealAllTiles(duration = 5000) {
  const tiles = document.querySelectorAll('.tile:not(.matched) img.hidden');

  tiles.forEach((img) => {
    img.classList.remove('hidden');
    img.classList.add('highlight-tile');
  });
  showRevealTimerNextToHint(5); // hiện ⏳ 5s ở góc phải

  setTimeout(() => {
    tiles.forEach((img) => {
      img.classList.add('hidden');
      img.classList.remove('highlight-tile');
    });
  }, duration);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
