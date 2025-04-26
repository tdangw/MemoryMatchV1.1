// ui.js
import { openShopOverlay } from './shop.js';
document.getElementById('btn-shop')?.addEventListener('click', openShopOverlay);
import { gameState } from './gameState.js';
import { sounds } from './sound.js'; // ✅ Đã tách âm thanh

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const hintElement = document.getElementById('hint');
const timerElement = document.getElementById('timer');
const highScoreEl = document.getElementById('high-score');

export function updateHighScoreDisplay(score) {
  if (highScoreEl) {
    highScoreEl.textContent = `🥇${score}`;
  }
}

export function updateScoreDisplay(score) {
  if (scoreElement) scoreElement.textContent = score;
}

export function updateLevelDisplay(level) {
  if (levelElement) levelElement.textContent = level;
}

export function updateHintDisplay(hints) {
  if (hintElement) hintElement.textContent = `${hints}`;
}

export function updateTimerDisplay(seconds) {
  if (!timerElement) return;
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  timerElement.textContent = `⏱️${m}:${s}`;
}

export function showBonusOverlay(message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>🎁 Thông báotest</h2>
    <p>${message}</p>
    <button class="settings-btn">Tiếp tục</button>
  `;

  if (gameState.settings?.sound) {
    sounds.overlay.currentTime = 0;
    sounds.overlay.play().catch(() => {});
  }

  modal.querySelector('button').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function showLevelRewardOverlay({ reward, hintGain, timeBonus }) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>🎉Thưởng qua màn!</h2>
    <p>⭐+${reward} điểm</p>
    <p>💡+${hintGain} gợi ý</p>
    <p>⏱️+${timeBonus} giây</p>
    <button class="settings-btn">Tiếp tục</button>
  `;

  if (gameState.settings?.sound) {
    sounds.bonus.currentTime = 0;
    sounds.bonus.play().catch(() => {});
  }

  modal.querySelector('button').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function showResetConfirmationOverlay() {
  const existing = document.getElementById('reset-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reset-overlay';
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>📛 Xác nhận</h2>
    <p>Bạn có chắc muốn xoá điểm kỷ lục không?</p>
    <div class="button-row">
      <button class="confirm-btn">✅ Đồng ý</button>
      <button class="cancel-btn">❌ Huỷ</button>
    </div>
  `;

  if (gameState.settings?.sound) {
    sounds.overlay.currentTime = 0;
    sounds.overlay.play().catch(() => {});
  }

  modal.querySelector('.confirm-btn').onclick = () => {
    if (gameState.settings?.sound) {
      sounds.confirm.currentTime = 0;
      sounds.confirm.play().catch(() => {});
    }
    localStorage.removeItem('highScore');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
      location.reload();
    }, 1500);
  };

  modal.querySelector('.cancel-btn').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function showReturnToMenuOverlay() {
  const existing = document.getElementById('return-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'return-overlay';
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>🏠 Quay về menu?</h2>
    <p>Tiến trình hiện tại sẽ bị mất.<br>Bạn có chắc không?</p>
    <div class="button-row">
      <button class="confirm-btn">✅ Đồng ý</button>
      <button class="cancel-btn">❌ Huỷ</button>
    </div>
  `;

  if (gameState.settings?.sound) {
    sounds.overlay.currentTime = 0;
    sounds.overlay.play().catch(() => {});
  }

  modal.querySelector('.confirm-btn').onclick = () => {
    if (gameState.settings?.sound) {
      sounds.confirm.currentTime = 0;
      sounds.confirm.play().catch(() => {});
    }

    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
      location.reload();
    }, 1500);
  };

  modal.querySelector('.cancel-btn').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
/**
 * 💡 Hiển thị hiệu ứng cộng điểm tại vị trí tile cụ thể (ví dụ ô thứ 2 khi match)
 * @param {HTMLElement} tileElement - Ô tile DOM
 * @param {string|number} text - Nội dung hiển thị (ví dụ: 12 hoặc '+12 points')
 */
export function showTilePointEffect(tileElement, text = '') {
  const effect = document.createElement('div');
  effect.className = 'tile-point-effect';

  // Tự chuyển số thành dạng +12
  if (typeof text === 'number') {
    effect.textContent = `+${text}`;
  } else {
    effect.textContent = text;
  }

  const rect = tileElement.getBoundingClientRect();
  effect.style.left = `${rect.left + rect.width / 2}px`;
  effect.style.top = `${rect.top}px`;

  document.body.appendChild(effect);

  setTimeout(() => {
    effect.classList.add('fade-out');
    setTimeout(() => {
      effect.remove();
    }, 400);
  }, 1600);
}
// Shop
export function showShopMessage(message) {
  const overlay = document.createElement('div');
  overlay.className = 'shop-message-overlay';

  const box = document.createElement('div');
  box.className = 'shop-message-box';
  box.textContent = message;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 500);
  }, 1500);
}
// Hiệu ứng Shop
export function animateIconToTarget(iconText, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const icon = document.createElement('div');
  icon.className = 'fly-icon strong-effect'; // 👉 thêm class mạnh hơn
  icon.textContent = iconText;
  document.body.appendChild(icon);

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;
  const targetRect = target.getBoundingClientRect();

  icon.style.left = `${startX}px`;
  icon.style.top = `${startY}px`;

  setTimeout(() => {
    icon.style.left = `${targetRect.left + targetRect.width / 2}px`;
    icon.style.top = `${targetRect.top}px`;
    icon.style.transform = 'scale(0.6)';
    icon.style.opacity = '0';
  }, 20);

  setTimeout(() => {
    icon.remove();
    highlightTarget(targetSelector); // ✨ gọi hiệu ứng sáng
  }, 800);
}
export function highlightTarget(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.classList.add('highlight-effect');
  setTimeout(() => el.classList.remove('highlight-effect'), 1000);
}
// Hiển thị thời gian đếm ngược khi mua gợi ý
export function showRevealTimerNextToHint(duration = 5) {
  const hintEl = document.getElementById('hint');
  const parentEl = hintEl?.parentElement;
  if (!hintEl || !parentEl) return;

  const old = document.querySelector('.hint-timer-indicator');
  if (old) old.remove();

  const wrapper = document.createElement('span');
  wrapper.className = 'hint-timer-indicator';

  // ✅ tách phần icon ⏳ và số giây
  wrapper.innerHTML = `
    <span class="hint-timer-icon">⏳</span>
    <span class="hint-timer-text"><span>${duration}</span>s</span>
  `;

  parentEl.insertAdjacentElement('afterend', wrapper);

  let remaining = duration;
  const span = wrapper.querySelector('.hint-timer-text span');

  const interval = setInterval(() => {
    remaining--;
    span.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(interval);
      wrapper.remove();
    }
  }, 1000);
}
