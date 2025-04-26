// js/sound.js
// Quản lý âm thanh của dự án
export const sounds = {
  click: new Audio('assets/sounds/click.mp3'),
  match: new Audio('assets/sounds/match.mp3'),
  wrong: new Audio('assets/sounds/wrong.mp3'),
  overlay: new Audio('assets/sounds/overlay.mp3'),
  flip: new Audio('assets/sounds/flip.mp3'),
  bonus: new Audio('assets/sounds/bonus.mp3'), // Âm thanh cho ô lẻ
  victory: new Audio('assets/sounds/victory.mp3'), // Âm thanh cho chiến thắng
  defeat: new Audio('assets/sounds/defeat.mp3'), // Âm thanh cho thất bại
  confirm: new Audio('assets/sounds/confirm.mp3'),
};

// Thiết lập âm lượng chung (tuỳ chỉnh)
Object.values(sounds).forEach((sound) => {
  sound.volume = 0.4;
});
