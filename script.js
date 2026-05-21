const gallery = document.getElementById('gallery');
const carousel = document.getElementById('carousel');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalImageArea = document.getElementById('modalImageArea');
const modalClose = document.getElementById('modalClose');
const specBtn = document.getElementById('specBtn');
const specBtnImg = document.getElementById('specBtnImg');

let currentImages = [];
let isSpecMode = false;

fetch('data.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('无法读取 data.json');
    }
    return response.json();
  })
  .then((data) => {
    renderCollected(data.collected || []);
    renderMissed(data.missed || []);
  })
  .catch(() => {
    gallery.innerHTML = '<p class="card-date">数据加载失败，请通过本地服务器或浏览器允许的方式打开页面。</p>';
  });

function renderCollected(items) {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
    card.setAttribute('aria-label', `查看${item.country}${item.city}番茄酱`);

    card.innerHTML = `
      <img class="photo-placeholder" src="${item.photoFront}" alt="${item.country}${item.city}番茄酱">
      <div class="card-title">${item.country} ${item.flag} — ${item.city}</div>
      <div class="card-date">${item.date}</div>
    `;

    card.addEventListener('click', () => openModal(item));
    gallery.appendChild(card);
  });
}

function renderMissed(items) {
  carousel.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'missed-card';

    card.innerHTML = `
      <img class="map-placeholder" src="${item.mapSvg}" alt="${item.country}地图">
      <div class="missed-title">${item.country} — ${item.city}</div>
      <div class="missed-date">${item.date}</div>
      ${item.note ? `<div class="missed-note">（${item.note}）</div>` : ''}
    `;

    carousel.appendChild(card);
  });
}

function openModal(item) {
  currentImages = [item.photoBoth, item.photoSpec].filter(Boolean);
  isSpecMode = false;

  currentImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  modalImage.style.transition = 'none';
  modalImage.style.opacity = '1';
  modalImage.src = item.photoBoth || '';

  specBtnImg.src = 'assets/icons/spec-default.svg';
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

modalImageArea.addEventListener('click', () => {
});

specBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  isSpecMode = !isSpecMode;

  modalImage.style.transition = 'opacity 0.3s ease';
  modalImage.style.opacity = '0';

  setTimeout(() => {
    if (isSpecMode) {
      modalImage.src = currentImages[1] || currentImages[0];
      specBtnImg.src = 'assets/icons/spec-active.svg';
    } else {
      modalImage.src = currentImages[0];
      specBtnImg.src = 'assets/icons/spec-default.svg';
    }
    modalImage.style.opacity = '1';
  }, 150);
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
