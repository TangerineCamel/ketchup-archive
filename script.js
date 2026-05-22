const gallery = document.getElementById('gallery');
const carousel = document.getElementById('carousel');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    renderCollected(data.collected || []);
    renderMissed(data.missed || []);
  })
  .catch(() => {
    gallery.innerHTML = '<p class="card-date">数据加载失败</p>';
  });

function renderCollected(items) {
  gallery.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
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
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'missed-card';
    card.innerHTML = `
      <div class="missed-map-wrap">
        <img class="map-placeholder" src="${item.mapSvg}" alt="${item.country}地图">
        ${item.tooltipText ? `<div class="missed-tooltip">${item.tooltipText}</div>` : ''}
      </div>
      <div class="missed-title">${item.country} — ${item.city}</div>
      <div class="missed-date">${item.date}</div>
      ${item.note ? `<div class="missed-note">（${item.note}）</div>` : ''}
    `;

    const mapWrap = card.querySelector('.missed-map-wrap');
    const tooltip = card.querySelector('.missed-tooltip');

    if (tooltip) {
      mapWrap.addEventListener('mouseenter', () => tooltip.classList.add('is-visible'));
      mapWrap.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));

      let pressTimer;
      mapWrap.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => tooltip.classList.add('is-visible'), 300);
      });
      mapWrap.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
        tooltip.classList.remove('is-visible');
      });
      mapWrap.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
        tooltip.classList.remove('is-visible');
      });
    }

    carousel.appendChild(card);
  });
}

function openModal(item) {
  modalImage.style.transition = 'none';
  modalImage.style.opacity = '1';
  modalImage.src = item.photoSpec || item.photoFront;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
