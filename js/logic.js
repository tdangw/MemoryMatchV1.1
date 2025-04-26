// logic.js - Xử lý logic của trò chơi
// chức năng của logic.js là xử lý logic của trò chơi, bao gồm việc xử lý sự kiện khi người chơi nhấp vào ô, kiểm tra xem hai ô có khớp nhau hay không, và kiểm tra xem người chơi đã hoàn thành cấp độ hay chưa. Nó cũng bao gồm các chức năng để khởi tạo logic và xử lý âm thanh khi người chơi tương tác với trò chơi.

import { increaseScore, gameState } from './gameState.js';
import { showBonusOverlay, updateScoreDisplay, showTilePointEffect } from './ui.js';
import { nextLevel } from './main.js';
import { sounds } from './sound.js'; // 📦 Tách âm thanh

let selectedTiles = [];

/**
 * Khởi tạo logic và gán sự kiện click cho tất cả tile
 */
export function initLogic() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile) => {
    tile.onclick = () => handleTileClick(tile);
  });
}

/**
 * Xử lý khi người chơi click vào tile
 */
export function handleTileClick(tileElement) {
  if (gameState.currentLevel > 1 && gameState.isLocked) return;

  const isBonus = tileElement.dataset.isBonus === 'true';
  const imageId = tileElement.dataset.imageId;
  const img = tileElement.querySelector('img');

  // Ngăn double click hoặc click trùng
  if (tileElement.classList.contains('matched') || tileElement.classList.contains('selected') || !img) return;

  // 🎵 Phát âm click nếu bật sound
  if (gameState.settings?.sound) {
    sounds.click.currentTime = 0;
    sounds.click.play().catch(() => {});
  }

  img.classList.remove('hidden');
  tileElement.classList.add('selected');

  if (isBonus) {
    const bonusPoints = Math.floor(Math.random() * 100) + 1;
    increaseScore(bonusPoints);
    updateScoreDisplay(gameState.score);
    tileElement.classList.add('matched');

    console.log(`[🎁 Bonus] +${bonusPoints} điểm từ ô lẻ ${tileElement.id}`);
    showBonusOverlay(`🎯 Bạn nhận được ${bonusPoints} điểm thưởng!`);
    checkLevelComplete();
  } else {
    selectedTiles.push({ element: tileElement, imageId });
    if (selectedTiles.length === 2) checkMatch();
  }
}

/**
 * So khớp 2 tile được chọn
 */
function checkMatch() {
  const [first, second] = selectedTiles;

  if (first.imageId === second.imageId) {
    first.element.classList.remove('selected');
    second.element.classList.remove('selected');
    first.element.classList.add('matched');
    second.element.classList.add('matched');

    const matchPoints = 2;
    increaseScore(matchPoints);
    updateScoreDisplay(gameState.score);
    showTilePointEffect(second.element, `+${matchPoints} points`);

    if (gameState.settings?.sound) {
      sounds.match.currentTime = 0;
      sounds.match.play().catch(() => {});
    }

    console.log(`[✅ Match] ${first.imageId}`);
    checkLevelComplete();
  } else {
    first.element.classList.add('wrong');
    second.element.classList.add('wrong');

    if (gameState.settings?.sound) {
      sounds.wrong.currentTime = 0;
      sounds.wrong.play().catch(() => {});
    }

    setTimeout(() => {
      first.element.classList.remove('selected', 'wrong');
      second.element.classList.remove('selected', 'wrong');

      const img1 = first.element.querySelector('img');
      const img2 = second.element.querySelector('img');
      if (img1) img1.classList.add('hidden');
      if (img2) img2.classList.add('hidden');
    }, 800);
  }

  selectedTiles = [];
}

/**
 * Kiểm tra nếu đã matched hết → qua màn
 */
export function checkLevelComplete() {
  const allNormalTiles = document.querySelectorAll('.tile:not([data-is-bonus="true"])');
  const matchedNormalTiles = document.querySelectorAll('.tile.matched:not([data-is-bonus="true"])');
  const bonusTile = document.querySelector('.tile[data-is-bonus="true"]');
  const bonusMatched = bonusTile ? bonusTile.classList.contains('matched') : true;

  if (allNormalTiles.length === matchedNormalTiles.length && bonusMatched) {
    // ✅ Phát âm thanh victory riêng nếu có bật âm
    if (gameState.settings?.sound) {
      sounds.victory.currentTime = 0;
      sounds.victory.play().catch(() => {});
    }

    // Hiển thị overlay như cũ
    showBonusOverlay(`🎉 Bạn đã hoàn thành Level ${gameState.currentLevel}!`); // tắt âm thanh overlay

    setTimeout(() => nextLevel(), 600);

    // Ghi nhận kỷ lục nếu vượt qua
    if (gameState.score > (gameState.highScore || 0)) {
      gameState.highScore = gameState.score;
      localStorage.setItem('highScore', gameState.highScore);
    }
  }
}
