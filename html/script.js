const adVideo = document.getElementById('adVideo');
const navLinks = document.querySelectorAll('.top-nav a');
const sections = document.querySelectorAll('main section');
const posterItems = document.querySelectorAll('.poster-thumb');

/* Hero 主视觉轮播 */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroNextBtn = document.getElementById('heroCarouselNext');
let heroActive = 0;
const heroTotal = heroSlides.length;
let heroInterval;

function showHeroSlide(index) {
  heroSlides[heroActive].classList.remove('active');
  heroActive = index;
  if (heroActive >= heroTotal) heroActive = 0;
  if (heroActive < 0) heroActive = heroTotal - 1;
  heroSlides[heroActive].classList.add('active');
}

function nextHeroSlide() {
  showHeroSlide(heroActive + 1);
}

if (heroTotal > 1) {
  heroInterval = setInterval(nextHeroSlide, 4000);

  heroNextBtn.addEventListener('click', () => {
    nextHeroSlide();
    clearInterval(heroInterval);
    heroInterval = setInterval(nextHeroSlide, 4000);
  });
}

function setActiveLink() {
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  sections.forEach((section) => {
    const id = section.getAttribute('id');
    const link = document.querySelector(`.top-nav a[href="#${id}"]`);

    if (!link) return;

    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

posterItems.forEach((item) => {
  item.addEventListener('click', () => {
    const videoSrc = item.dataset.video;
    const posterSrc = item.dataset.poster;

    posterItems.forEach((thumb) => thumb.classList.remove('selected'));
    item.classList.add('selected');

    const sourceElement = adVideo.querySelector('source');
    sourceElement.src = videoSrc;
    adVideo.poster = posterSrc;
    adVideo.load();
    adVideo.play().catch(() => {
      // Autoplay may be blocked, ignore if so.
    });
  });
});

window.addEventListener('scroll', setActiveLink);
window.addEventListener('load', setActiveLink);

/* Lightbox with navigation */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');

let currentGroup = [];
let currentIndex = 0;

function openLightbox(imgEl) {
  const card = imgEl.closest('.pack-card');
  if (!card) return;

  const items = card.querySelectorAll('.pack-item img');
  currentGroup = Array.from(items);
  currentIndex = currentGroup.indexOf(imgEl);
  if (currentIndex < 0) currentIndex = 0;

  showImage(currentIndex);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updateNavState();
}

function showImage(index) {
  const img = currentGroup[index];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
}

function navigate(direction) {
  if (currentGroup.length <= 1) return;
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = currentGroup.length - 1;
  if (currentIndex >= currentGroup.length) currentIndex = 0;
  showImage(currentIndex);
  updateNavState();
}

function updateNavState() {
  if (currentGroup.length <= 1) {
    lightboxCounter.textContent = '';
  } else {
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
  }
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentGroup = [];
  currentIndex = 0;
}

document.querySelectorAll('.pack-item').forEach(el => {
  el.addEventListener('click', () => {
    const img = el.querySelector('img');
    if (!img) return;
    openLightbox(img);
  });
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
    closeLightbox();
  }
});

document.querySelector('.lightbox-prev').addEventListener('click', (e) => {
  e.stopPropagation();
  navigate(-1);
});

document.querySelector('.lightbox-next').addEventListener('click', (e) => {
  e.stopPropagation();
  navigate(1);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowLeft') {
    navigate(-1);
  } else if (e.key === 'ArrowRight') {
    navigate(1);
  }
});

/* PDF 渲染
   - 在线 (http/https): 使用 PDF.js + canvas，带自定义翻页按钮
   - 离线 (file://):   使用浏览器原生 PDF 查看器（iframe），绕过 file:// 安全限制
*/
(function() {
  const pdfCanvas = document.getElementById('pdfCanvas');
  const pdfContainer = document.getElementById('pdfContainer');
  const pdfToolbar = document.getElementById('pdfToolbar');
  const pdfPageInfo = document.getElementById('pdfPageInfo');
  const pdfPrev = document.getElementById('pdfPrev');
  const pdfNext = document.getElementById('pdfNext');
  const pdfFallback = document.getElementById('pdfFallback');
  const pdfUrl = 'a1/品牌形象设计/襄韵马赵品牌手册.pdf';
  const isFile = window.location.protocol === 'file:';

  if (isFile) {
    // file:// 模式：浏览器原生 PDF 渲染
    pdfToolbar.style.display = 'none';
    pdfCanvas.style.display = 'none';
    pdfFallback.style.display = 'block';
    pdfFallback.src = pdfUrl;
    return;
  }

  // http:// 模式：PDF.js 渲染
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';

  let pdfDoc = null;
  let pageNum = 1;
  let totalPages = 0;
  let pageRendering = false;

  pdfjsLib.getDocument({ url: pdfUrl }).promise.then(function(doc) {
    pdfDoc = doc;
    totalPages = doc.numPages;
    pdfPageInfo.textContent = '1 / ' + totalPages;
    renderPage(pageNum);
  }).catch(function() {
    pdfPageInfo.textContent = 'PDF 加载失败，请刷新重试';
  });

  function renderPage(num) {
    if (pageRendering) return;
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
      const viewport = page.getViewport({ scale: 1.5 });
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;
      const ctx = pdfCanvas.getContext('2d');
      const renderTask = page.render({ canvasContext: ctx, viewport: viewport });
      return renderTask.promise;
    }).then(function() {
      pageRendering = false;
      pdfPageInfo.textContent = num + ' / ' + totalPages;
    });
  }

  pdfPrev.addEventListener('click', function() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
  });

  pdfNext.addEventListener('click', function() {
    if (pageNum >= totalPages) return;
    pageNum++;
    renderPage(pageNum);
  });

  document.addEventListener('keydown', function(e) {
    if (e.target.closest('#brandPdfViewer') && !lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') { pdfPrev.click(); }
      if (e.key === 'ArrowRight') { pdfNext.click(); }
    }
  });
})();
