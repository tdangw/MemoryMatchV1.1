// popupManager.js

/**
 * Tạo popup cơ bản với tuỳ chọn tiêu đề, nội dung, nút
 * @param {Object} options
 * @param {string} options.title - Tiêu đề popup
 * @param {string} options.message - Nội dung HTML hoặc plain text
 * @param {Array} options.buttons - Mảng các nút [{ text, className, onClick }]
 * @param {boolean} options.closeOnClickOutside - Cho phép click ngoài overlay để đóng
 */
export function showPopup({ title = '', message = '', buttons = [], closeOnClickOutside = true } = {}) {
  // Xóa popup cũ nếu tồn tại
  document.querySelector('.dynamic-popup-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'dynamic-popup-overlay overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>${title}</h2>
    <p>${message}</p>
    <div class="button-row"></div>
  `;

  const buttonRow = modal.querySelector('.button-row');

  buttons.forEach(({ text, className = '', onClick }) => {
    const btn = document.createElement('button');
    btn.className = className;
    btn.textContent = text;
    btn.onclick = () => {
      onClick?.();
      closePopup();
    };
    buttonRow.appendChild(btn);
  });

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  if (closeOnClickOutside) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });
  }
}

function closePopup() {
  const overlay = document.querySelector('.dynamic-popup-overlay');
  const modal = overlay?.querySelector('.modal');
  if (!overlay) return;

  if (modal) modal.classList.add('fade-out');
  overlay.classList.remove('fade-in');
  overlay.classList.add('fade-out');

  setTimeout(() => overlay.remove(), 400);
}
