import { shuffleArray } from './utils.js';
import { gameState } from './gameState.js';
import { initLogic } from './logic.js';
import { getBonusTileId } from './bonusTile.js';

function showImageWithEffect(img, effect = 'fade-scale') {
  img.classList.remove('hidden');

  const classes = [
    'appear-fade-scale',
    'appear-pop',
    'appear-bounce',
    'appear-slide-up',
    'appear-flip-y',
    'appear-zoom-rotate',
    'appear-blur-in',
  ];
  img.classList.remove(...classes);

  const classMap = {
    'fade-scale': 'appear-fade-scale',
    pop: 'appear-pop',
    bounce: 'appear-bounce',
    'slide-up': 'appear-slide-up',
    'flip-y': 'appear-flip-y',
    'zoom-rotate': 'appear-zoom-rotate',
    'blur-in': 'appear-blur-in',
  };

  if (classMap[effect]) {
    img.classList.add(classMap[effect]);
    setTimeout(() => {
      img.classList.remove(classMap[effect]);
    }, 600); // thời gian hiệu ứng tối đa
  }
}
export let gridData = [];
export function renderGrid(gridData) {
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';

  const bonusTileId = getBonusTileId(); // Lấy ID ô lẻ

  gridData.tiles.forEach((tile) => {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile');
    tileElement.dataset.id = tile.id;

    // Gán class "bonus" nếu là ô lẻ
    if (tile.id === bonusTileId) {
      tileElement.classList.add('bonus');
    }

    gridContainer.appendChild(tileElement);
  });
}

/**
 * Tạo lưới game theo level hiện tại
 * @param {number} level
 */
export function createGrid(gridSize, level = 1) {
  // Tính toán số ô trong lưới
  // Nếu level > 50 → random từ 4 đến 12
  // Nếu level <= 50 → theo quy tắc tăng dần
  // const gridSize = Math.min(level, 12); // Tăng dần từ 1x1 → 2x2 → 3x3...
  // const gridSize = Math.floor(Math.random() * 9) + 4; // Random từ 4 đến 12
  // const gridSize = Math.min(level, 12); // Tăng dần từ 1x1 → 2x2 → 3x3...

  const totalTiles = gridSize * gridSize;
  const numberOfPairs = Math.floor(totalTiles / 2);

  // Tạo danh sách ảnh từ 1–72 và xáo trộn
  // ✅ Tự động xác định số lượng ảnh theo cấp độ
  const totalAvailableImages = level <= 12 ? 72 : 1000;
  const availableImages = Array.from({ length: totalAvailableImages }, (_, i) => i + 1);
  shuffleArray(availableImages);

  // ✅ Chọn ảnh không trùng → mỗi ảnh dùng đúng 2 lần
  const selectedImages = availableImages.slice(0, numberOfPairs);
  let imageIds = [];
  selectedImages.forEach((id) => {
    imageIds.push(id, id);
  });

  // ✅ Nếu số ô là lẻ → thêm 1 ô lẻ bonus
  let bonusImageId = null;
  let bonusTileIndex = null;

  if (totalTiles % 2 !== 0) {
    bonusImageId = availableImages[numberOfPairs]; // ảnh tiếp theo chưa dùng
    imageIds.push(bonusImageId);
  }

  // 🔀 Trộn mảng ảnh cuối cùng
  shuffleArray(imageIds);

  // Chuẩn bị DOM
  gridData = [];
  const gridContainer = document.getElementById('grid-container');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  imageIds.forEach((imageId, idx) => {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const tileId = `tile-${row}-${col}`;

    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.id = tileId;

    const img = document.createElement('img');
    const imageLevel = level <= 12 ? level : 13;
    img.src = `assets/images/level${imageLevel}/Pikachu (${imageId}).png`;
    img.alt = `Pikachu ${imageId}`;
    img.draggable = false;
    img.classList.add('hidden');

    tile.dataset.imageId = imageId;
    tile.dataset.isBonus = 'false';

    let isBonus = false;

    if (bonusImageId !== null && imageId === bonusImageId && bonusTileIndex === null) {
      // ✅ Chỉ gán 1 ô duy nhất làm bonus
      tile.dataset.isBonus = 'true';
      isBonus = true;
      bonusTileIndex = idx;

      console.log(`[🎯 BONUS TILE] id=${tileId}, imageId=${bonusImageId}`);
    }

    tile.appendChild(img);
    gridContainer.appendChild(tile);
    tile.addEventListener('click', () => {
      const img = tile.querySelector('img');
      if (img && img.classList.contains('hidden')) {
        showImageWithEffect(img, 'bounce'); // hoặc thử 'fade-scale', 'bounce', 'pop', 'slide-up', 'flip-y', 'zoom-rotate', 'blur-in'
      }
    });

    // Lưu dữ liệu cho game logic
    gridData.push({
      id: tileId,
      imageId,
      isBonus,
      isMatched: false,
    });
  });

  // ✅ Preview ảnh trước khi bắt đầu
  setTimeout(() => {
    revealAndHideTiles();
  }, 0);
}

/**
 * Hiển thị tất cả ảnh trong 5s rồi ẩn lại nếu chưa matched
 */
function revealAndHideTiles() {
  const allImgs = document.querySelectorAll('.tile img');
  allImgs.forEach((img) => img.classList.remove('hidden'));

  gameState.isLocked = true;

  setTimeout(() => {
    allImgs.forEach((img) => {
      const parent = img.parentElement;
      if (!parent.classList.contains('matched')) {
        img.classList.add('hidden');
      }
    });

    gameState.isLocked = false;
    initLogic();
  }, 5000);
}
