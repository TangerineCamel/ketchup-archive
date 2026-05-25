const gallery = document.getElementById('gallery');
const carousel = document.getElementById('carousel');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalImageArea = document.getElementById('modalImageArea');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
let activeTooltip = null;
let activeTooltipTimer = null;
let carouselScrollTimer = null;
let modalTooltip = null;
let modalTooltipTimer = null;
const carouselScrollbar = document.createElement('div');
const carouselScrollbarThumb = document.createElement('div');
carouselScrollbar.className = 'carousel-scrollbar';
carouselScrollbarThumb.className = 'carousel-scrollbar-thumb';
carouselScrollbar.appendChild(carouselScrollbarThumb);
carousel.insertAdjacentElement('afterend', carouselScrollbar);

function updateCarouselScrollbar() {
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  const trackWidth = carouselScrollbar.clientWidth;
  const thumbWidth = maxScroll > 0 ? Math.max((carousel.clientWidth / carousel.scrollWidth) * trackWidth, 24) : trackWidth;
  const maxThumbMove = trackWidth - thumbWidth;
  const thumbLeft = maxScroll > 0 ? (carousel.scrollLeft / maxScroll) * maxThumbMove : 0;
  carouselScrollbarThumb.style.width = `${thumbWidth}px`;
  carouselScrollbarThumb.style.transform = `translateX(${thumbLeft}px)`;
}

carousel.addEventListener('scroll', () => {
  updateCarouselScrollbar();
  carousel.classList.add('is-scrolling');
  carouselScrollbar.classList.add('is-visible');
  if (carouselScrollTimer) clearTimeout(carouselScrollTimer);
  carouselScrollTimer = setTimeout(() => {
    carousel.classList.remove('is-scrolling');
    carouselScrollbar.classList.remove('is-visible');
  }, 800);

  if (activeTooltip) {
    activeTooltip.style.transition = 'none';
    activeTooltip.style.opacity = '0';
    if (activeTooltipTimer) clearTimeout(activeTooltipTimer);
    activeTooltip = null;
  }
});

window.addEventListener('resize', updateCarouselScrollbar);

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
      document.body.appendChild(tooltip);

      const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

      if (!isTouchDevice()) {
        mapWrap.addEventListener('mouseenter', () => tooltip.classList.add('is-visible'));
        mapWrap.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));
        mapWrap.addEventListener('mousemove', (e) => {
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY - 28) + 'px';
        });
      }

      mapWrap.addEventListener('click', (e) => {
        if (!isTouchDevice()) return;

        if (activeTooltip && activeTooltip !== tooltip) {
          activeTooltip.style.transition = 'none';
          activeTooltip.style.opacity = '0';
          if (activeTooltipTimer) clearTimeout(activeTooltipTimer);
        }

        const rect = mapWrap.getBoundingClientRect();

        tooltip.style.transition = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 12) + 'px';
        tooltip.style.transform = 'translateX(-50%)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            tooltip.style.transition = 'opacity 0.15s ease';
            tooltip.style.opacity = '1';

            activeTooltip = tooltip;

            if (activeTooltipTimer) clearTimeout(activeTooltipTimer);
            activeTooltipTimer = setTimeout(() => {
              tooltip.style.transition = 'opacity 2s ease';
              tooltip.style.opacity = '0';
              activeTooltip = null;
            }, 2000);
          });
        });
      });
    }

    carousel.appendChild(card);
  });
}

function openModal(item) {
  modalImageArea._currentItem = item;
  modalImage.style.transition = 'none';
  modalImage.style.opacity = '1';
  modalImage.src = item.photoSpec || item.photoFront;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (modalTooltip) {
    modalTooltip.remove();
    modalTooltip = null;
    clearTimeout(modalTooltipTimer);
  }
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

modalImageArea.addEventListener('click', (e) => {
  const item = modalImageArea._currentItem;
  if (!item) return;

  if (modalTooltip) {
    modalTooltip.remove();
    clearTimeout(modalTooltipTimer);
  }

  const text = `${item.date} 收集于${item.country} - ${item.city} by ${item.collector}`;
  modalTooltip = document.createElement('div');
  modalTooltip.className = 'modal-info-tooltip';
  modalTooltip.textContent = text;
  modalTooltip.style.left = e.clientX + 'px';
  modalTooltip.style.top = e.clientY + 'px';
  document.body.appendChild(modalTooltip);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modalTooltip.style.transition = 'opacity 0.15s ease';
      modalTooltip.style.opacity = '1';

      modalTooltipTimer = setTimeout(() => {
        modalTooltip.style.transition = 'opacity 2s ease';
        modalTooltip.style.opacity = '0';
      }, 2000);
    });
  });
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
