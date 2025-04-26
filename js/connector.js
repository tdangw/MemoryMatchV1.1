// connector.js - Kết nối màn hình menu với game

import { resetGame, gameState } from './gameState.js';
// import { createGrid } from './grid.js';
import {
  showGameUI,
  showMainMenu,
  updateLevelDisplay,
  updateScoreDisplay,
} from './ui.js';
import { initializeLevel } from './main.js'; // ✅ dùng chuẩn flow mới

/**
 * Hàm khởi động game khi người chơi bấm "Bắt đầu"
 */
export function startGame() {
  showGameUI();
  resetGame(); // Xóa trạng thái cũ
  updateLevelDisplay(gameState.currentLevel);
  updateScoreDisplay(gameState.score);
  initializeLevel(gameState.currentLevel); // ✅ gọi logic chuẩn
}

/**
 * Chuyển màn (nếu gọi trực tiếp)
 */
export function goToNextLevel() {
  gameState.currentLevel++; // ✅ thay vì gọi nextLevel()
  updateLevelDisplay(gameState.currentLevel);
  initializeLevel(gameState.currentLevel);
}

/**
 * Trở về menu chính và reset game
 */
export function goBackToMenu() {
  showMainMenu();
  resetGame();
  updateLevelDisplay(gameState.currentLevel);
  updateScoreDisplay(gameState.score);
}
