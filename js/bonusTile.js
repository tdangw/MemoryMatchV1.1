// bonusTile.js - Quản lý ô lẻ (bonus tile) trong game Memory Match

import { increaseScore } from './gameState.js';

let bonusTileId = null; // ID của ô lẻ hiện tại (để kiểm tra khi click)

/**
 * Gán ngẫu nhiên một ô trong grid là ô lẻ (bonus)
 * @param {Array} grid - Mảng các tile (gridData)
 */
export function setBonusTile(grid) {
  const gridSize = grid.length;
  const randomIndex = Math.floor(Math.random() * gridSize);

  bonusTileId = grid[randomIndex].id;
  grid[randomIndex].isBonus = true;

  console.log(`🎯 BonusTile ID: ${bonusTileId}`);
}

/**
 * Kiểm tra nếu người chơi click đúng ô lẻ
 * @param {HTMLElement} selectedTile - tile DOM được click
 */
export function handleBonusTileSelection(selectedTile) {
  if (selectedTile.id === bonusTileId) {
    increaseScore(100);
    selectedTile.classList.add('matched'); // hoặc 'completed' nếu bạn muốn
    bonusTileId = null; // reset sau khi chọn đúng
    console.log('✅ Đã chọn đúng ô lẻ!');
    return true;
  }

  return false;
}

/**
 * Lấy ID của ô lẻ hiện tại (nếu cần dùng bên ngoài)
 */
export function getBonusTileId() {
  return bonusTileId;
}
