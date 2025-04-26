// utils.js

/**
 * Tạo một số nguyên ngẫu nhiên trong khoảng [min, max].
 * @param {number} min - Giá trị nhỏ nhất (bao gồm).
 * @param {number} max - Giá trị lớn nhất (bao gồm).
 * @returns {number} Số nguyên ngẫu nhiên.
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Xáo trộn ngẫu nhiên các phần tử trong một mảng (thuật toán Fisher-Yates).
 * @param {Array} arr - Mảng cần xáo trộn.
 * @returns {Array} Mảng đã được xáo trộn.
 */
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Hoán đổi các phần tử
  }
  return arr;
}

/**
 * Định dạng thời gian từ số giây thành định dạng "phút:giây".
 * Ví dụ: 65 giây -> "1:05".
 * @param {number} seconds - Tổng số giây.
 * @returns {string} Chuỗi định dạng thời gian.
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

/**
 * Tạo một ID ngẫu nhiên cho các phần tử (ví dụ: ô).
 * @returns {string} Chuỗi ID ngẫu nhiên.
 */
export function generateRandomID() {
  return 'tile-' + Math.floor(Math.random() * 1000000);
}
/**
 * Xác định kích thước lưới dựa trên level và chế độ chơi
 * @param {number} level
 * @param {'easy'|'normal'|'hard'} mode
 * @returns {number} gridSize
 */
export function getGridSizeByLevel(level, mode = 'easy') {
  if (mode === 'easy') {
    if (level === 1) return 1;
    if (level === 2) return 2;
    if (level === 3) return 3;
  } else if (mode === 'normal') {
    if (level <= 10) return 4;
  } else if (mode === 'hard') {
    if (level <= 20) return 6;
  }

  // Từ level 4 trở đi áp dụng quy tắc chung
  if (level <= 10) return 4;
  if (level <= 15) return 5;
  if (level <= 20) return 6;
  if (level <= 25) return 7;
  if (level <= 30) return 8;
  if (level <= 35) return 9;
  if (level <= 40) return 10;
  if (level <= 45) return 11;
  if (level <= 50) return 12;

  // Level 51+: random từ 4x4 đến 12x12
  return Math.floor(Math.random() * 9) + 4;
}
