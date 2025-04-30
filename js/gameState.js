// 📦 Trạng thái toàn cục của game
import { updateScoreDisplay, updateHighScoreDisplay } from './ui.js';
const defaultHints = 3; // Giá trị mặc định của lượt gợi ý
const remainingTime = 180;
const defaultScore = 0;
export const gameState = {
  currentLevel: 1,
  score: defaultScore,
  hints: defaultHints, // Gắn theo biến gốc
  isLocked: false,
  remainingTime: remainingTime,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
  settings: {
    mode: 'easy',
    sound: false,
    bgMusic: 'none',
  },
  fromDefeat: false, // ➕ biến cờ xác định đang gọi từ trạng thái "thua"
};
gameState._timeRunningOutPlayed = false;

// 🔄 Reset toàn bộ game về trạng thái ban đầu
export function resetGame() {
  gameState.currentLevel = 1;
  gameState.score = defaultScore;
  gameState.hints = defaultHints; // Lấy từ giá trị mặc định
  gameState.remainingTime = remainingTime;
  gameState.isLocked = false;
  gameState.settings.mode = 'easy';
}

// ➕ Cộng điểm + tự động cập nhật highscore
export function increaseScore(points) {
  gameState.score += points;
  updateScoreDisplay(gameState.score);

  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem('highScore', gameState.score);
    updateHighScoreDisplay(gameState.score);
  }
}

// ⚙️ Cài đặt chế độ chơi
export function setGameDifficulty(difficulty) {
  gameState.settings.mode = difficulty;
}

// 🔍 Lấy chế độ chơi hiện tại
export function getGameDifficulty() {
  return gameState.settings.mode;
}
