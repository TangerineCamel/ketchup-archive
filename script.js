const gallery = document.getElementById('gallery');
const carousel = document.getElementById('carousel');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalImageArea = document.getElementById('modalImageArea');
const modalClose = document.getElementById('modalClose');
const modalLabel = document.getElementById('modalLabel');
const labelFront = document.getElementById('labelFront');
const labelBack = document.getElementById('labelBack');
const labelSep = document.querySelector('.modal-label-sep');

let currentImages = [];
let currentIndex = 0;

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
      <div class="photo-placeholder"></div>
      <div class="card-title">${item.country} ${item.flag} — ${item.city}</div>
      <div class="card-date">${item.date}</div>
    `;

    card.addEventListener('click', () => openModal([item.photoFront, item.photoBack]));
    gallery.appendChild(card);
  });
}

function renderMissed(items) {
  carousel.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'missed-card';

    card.innerHTML = `
      <div class="map-placeholder"></div>
      <div class="missed-title">${item.country} — ${item.city}</div>
      <div class="missed-date">${item.date}</div>
      ${item.note ? `<div class="missed-note">（${item.note}）</div>` : ''}
    `;

    carousel.appendChild(card);
  });
}

function openModal(images) {
  currentImages = images.filter(Boolean);
  currentIndex = 0;
  updateModalImage();
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

function updateModalImage() {
  modalImage.src = currentImages[currentIndex] || '';

  if (currentImages.length >= 2) {
    if (currentIndex === 0) {
      labelFront.style.color = '#111111';
      labelBack.style.color = '#C8C8C8';
    } else {
      labelFront.style.color = '#C8C8C8';
      labelBack.style.color = '#111111';
    }
    labelSep.style.color = '#111111';
    modalLabel.style.display = 'block';
  } else {
    modalLabel.style.display = 'none';
  }
}

modalImageArea.addEventListener('click', () => {
  if (currentImages.length <= 1) {
    return;
  }

  currentIndex = (currentIndex + 1) % currentImages.length;
  updateModalImage();
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
