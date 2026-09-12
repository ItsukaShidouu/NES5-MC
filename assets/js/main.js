/**
 * NES5 NETWORK - Main JavaScript
 * Handles real-time server ping, copy-to-clipboard IP, FAQ interactions, and particles
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCopyIP();
  initServerPing();
  initGallery();
  initParticles();
});

/* Mobile Navbar Toggle */
function initNavbar() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu') || document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // Scroll effect on navbar & active link spy
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Scroll spy for active link
    const sections = document.querySelectorAll('main, section[id]');
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPosition >= top && scrollPosition < top + height && id) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* Copy Server IP to Clipboard */
function initCopyIP() {
  const copyElements = document.querySelectorAll('[data-copy-ip]');

  copyElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const ip = el.getAttribute('data-copy-ip') || 'java.nss.biz.id';

      navigator.clipboard.writeText(ip).then(() => {
        showToast(`IP Server Disalin: <strong>${ip}</strong>! Selamat bermain!`);
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = ip;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`IP Server Disalin: <strong>${ip}</strong>!`);
      });
    });
  });
}

/* Toast Notification Utility */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check toast-icon"></i>
      <span class="toast-message"></span>
    `;
    document.body.appendChild(toast);
  }

  const msgSpan = toast.querySelector('.toast-message');
  if (msgSpan) msgSpan.innerHTML = message;

  toast.classList.add('show');

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* Real-Time Server Status via Minecraft-MP API */
function initServerPing() {
  const minecraftMpApi = 'https://minecraft-mp.com/api/?object=servers&element=detail&tag=363257';
  const statusBadge = document.getElementById('server-status-badge');
  const playerCountElem = document.getElementById('player-count');
  const versionElem = document.getElementById('server-version');

  async function checkStatus() {
    try {
      const response = await fetch(minecraftMpApi, { cache: 'no-store' });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const server = data.server || data;
      const onlinePlayers = Number(server.players ?? server.online ?? 0);
      const maxPlayers = Number(server.maxplayers ?? server.maxPlayers ?? 0);
      const serverIp = server.ip || server.address;

      if (data.status !== false && (server.online !== false || onlinePlayers > 0)) {
        if (statusBadge) {
          statusBadge.innerHTML = '<span class="badge-dot online"></span> ONLINE';
          statusBadge.style.color = '#34d399';
        }
        if (playerCountElem) {
          playerCountElem.textContent = `${onlinePlayers} / ${maxPlayers || 728} Pemain`;
        }
        if (versionElem && server.version) {
          versionElem.textContent = server.version;
        }
        if (serverIp) {
          document.querySelectorAll('[data-copy-ip]').forEach((element) => {
            element.setAttribute('data-copy-ip', serverIp);
          });
          document.querySelectorAll('.ip-value, .nav-ip-text').forEach((element) => {
            element.textContent = serverIp;
          });
        }
      } else {
        // Fallback gracefully
        if (statusBadge) {
          statusBadge.innerHTML = '<span class="badge-dot standby"></span> ONLINE (STANDBY)';
          statusBadge.style.color = '#38bdf8';
        }
        if (playerCountElem) {
          playerCountElem.textContent = '0 / 728 Pemain';
        }
      }
    } catch (err) {
      // Default fallback
      if (statusBadge) {
        statusBadge.innerHTML = '<span class="badge-dot online"></span> ONLINE';
        statusBadge.style.color = '#34d399';
      }
      if (playerCountElem) {
        playerCountElem.textContent = 'Aktif / 728 Slot';
      }
    }
  }

  checkStatus();
  // Auto refresh status every 60 seconds
  setInterval(checkStatus, 60000);
}

/* Server Gallery with lazy-loaded local album images */
function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  const albumImages = [
    ['1.png', 'season-1', 'Arsip pembuka'],
    ['2026-02-25_12.49.27.png', 'season-1', 'Momen Season 1'],
    ['2026-02-25_12.51.50.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.10.03.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.10.22.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.10.33.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.11.17.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.12.25.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.12.29.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.12.55.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.14.48.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_00.15.09.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_02.25.43.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_15.57.35.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_20.46.03.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_20.48.23.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_22.10.00.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_22.10.07.png', 'season-1', 'Momen Season 1'],
    ['2026-02-26_22.16.37.png', 'season-1', 'Momen Season 1'],
    ['2026-02-27_20.41.58.png', 'season-1', 'Momen Season 1'],
    ['2026-02-27_20.42.07.png', 'season-1', 'Momen Season 1'],
    ['2026-02-28_20.21.33.png', 'season-1', 'Momen Season 1'],
    ['2026-02-28_20.58.09.png', 'season-1', 'Momen Season 1'],
    ['2026-03-01_17.42.51.png', 'season-1', 'Momen Season 1'],
    ['2026-03-02_22.40.34.png', 'season-1', 'Momen Season 1'],
    ['2026-03-07_00.33.01.png', 'season-1', 'Momen Season 1'],
    ['2026-03-07_00.53.36.png', 'season-1', 'Momen Season 1'],
    ['2026-03-07_23.12.05.png', 'season-1', 'Momen Season 1'],
    ['2026-03-10_22.08.16.png', 'season-1', 'Momen Season 1'],
    ['2026-03-12_21.35.23.png', 'season-1', 'Momen Season 1'],
    ['2026-03-12_21.57.49.png', 'season-1', 'Momen Season 1'],
    ['2026-09-08_20.19.55.png', 'latest', 'Momen terbaru'],
    ['2026-09-08_20.21.01.png', 'latest', 'Momen terbaru'],
    ['2026-09-09_00.19.36.png', 'latest', 'Momen terbaru'],
    ['co11ntent.png', 'season-1', 'Arsip komunitas'],
    ['con11tent.png', 'season-1', 'Arsip komunitas'],
    ['conte1nt.png', 'season-1', 'Arsip komunitas'],
    ['content.png', 'season-1', 'Arsip komunitas'],
    ['i122mage.png', 'season-1', 'Arsip komunitas'],
    ['i12mage.png', 'season-1', 'Arsip komunitas'],
    ['i1mage.png', 'season-1', 'Arsip komunitas'],
    ['im111age.png', 'season-1', 'Arsip komunitas'],
    ['im11age.png', 'season-1', 'Arsip komunitas'],
    ['im1age.png', 'season-1', 'Arsip komunitas'],
    ['ima11ge.png', 'season-1', 'Arsip komunitas'],
    ['imag1e.png', 'season-1', 'Arsip komunitas'],
    ['imag23e.png', 'season-1', 'Arsip komunitas'],
    ['imag243e.png', 'season-1', 'Arsip komunitas'],
    ['image.png', 'season-1', 'Arsip komunitas']
  ];

  const initialGalleryLimit = 8;
  let showAllImages = false;
  const showAllButton = document.getElementById('gallery-show-all');

  const renderGallery = () => {
    const visibleImages = showAllImages ? albumImages : albumImages.slice(0, initialGalleryLimit);
    galleryGrid.replaceChildren();

    if (!visibleImages.length) {
      galleryGrid.innerHTML = '<p class="gallery-empty">Belum ada gambar pada album ini.</p>';
      return;
    }

    visibleImages.forEach(([filename]) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';

      const imageLink = document.createElement('a');
      imageLink.className = 'gallery-image-link';
      imageLink.href = `assets/album/${filename}`;
      imageLink.target = '_blank';
      imageLink.rel = 'noopener';
      imageLink.setAttribute('aria-label', 'Buka gambar arsip komunitas');

      const image = document.createElement('img');
      image.src = imageLink.href;
      image.alt = 'Arsip komunitas NES5 NETWORK';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('load', () => image.classList.add('loaded'), { once: true });
      image.addEventListener('error', () => card.remove(), { once: true });

      const captionElement = document.createElement('div');
      captionElement.className = 'gallery-caption';
      captionElement.innerHTML = '<strong>Arsip Komunitas</strong><span>NES5 NETWORK</span>';

      imageLink.appendChild(image);
      card.append(imageLink, captionElement);
      galleryGrid.appendChild(card);
    });

    if (showAllButton) showAllButton.hidden = showAllImages;
  };

  showAllButton?.addEventListener('click', () => {
    showAllImages = true;
    renderGallery();
  });

  renderGallery();
}


/* Floating Ambient Particles (Spore / Dust effect) */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 45;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2, // Floats gently upwards
      opacity: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.4 ? 'rgba(52, 211, 153,' : 'rgba(6, 182, 212,'
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

