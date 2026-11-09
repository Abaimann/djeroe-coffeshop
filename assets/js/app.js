/**
 * @fileoverview Application bootstrapping & lifecycle orchestration for Djeroe Coffee.
 * Initializes floating ambient decor, typography ripples, ambiance gallery,
 * preloader progress lifecycle, and initializes sub-modules.
 */

(function (global) {
  'use strict';

  const PRELOADER_PACE_DURATION_MS = 1200;
  const PRELOADER_MAX_WAIT_MS = 2500;
  const AMBIENT_BEANS_COUNT = 9;

  /**
   * Initializes floating background coffee beans in the ambient stage.
   */
  function initAmbientBeans() {
    const stageEl = document.querySelector('.stage');
    if (!stageEl) return;

    // Fragment minimizes layout recalcs during injection
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < AMBIENT_BEANS_COUNT; i++) {
      const bean = document.createElement('div');
      bean.className = 'bean';
      const posX = (Math.random() * 95).toFixed(1);
      const posY = (Math.random() * 90).toFixed(1);
      const delay = (-Math.random() * 9).toFixed(1);
      const scale = (0.6 + Math.random()).toFixed(2);

      bean.style.cssText = `left:${posX}%;top:${posY}%;animation-delay:${delay}s;transform:scale(${scale})`;
      fragment.appendChild(bean);
    }

    stageEl.appendChild(fragment);
  }

  /**
   * Generates rhythmic waving typography characters and continuous marquee text.
   */
  function initTypographyAndMarquee() {
    const titleEl = document.getElementById('title');
    const mqEl = document.getElementById('mq');
    const dataModule = global.Djeroe?.Data || global;
    const tickerPhrases = dataModule.SCENE_CONFIG?.tickerPhrases || [
      'Kopi Susu Djeroe',
      'Seduh dengan sabar',
      'Teman ngobrol',
      'Senja di dalam'
    ];

    // 1. Rhythmic Brand Title Wave
    if (titleEl) {
      const brandLetters = Array.from('Djeroe');
      titleEl.innerHTML = brandLetters.map((char, index) =>
        `<span class="letter" style="--li:${index}"><i class="char">${char}</i></span>`
      ).join('');
    }

    // 2. Endless Marquee Ticker
    if (mqEl) {
      const tickerHtml = tickerPhrases.map(phrase => `<span>${phrase}</span><span>✦</span>`).join('');
      mqEl.innerHTML = tickerHtml.repeat(4);
    }

    // 3. Set stagger animation variables on all scene child nodes
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
      const animatedNodes = scene.querySelectorAll('[data-a]');
      animatedNodes.forEach((node, index) => {
        node.style.setProperty('--i', String(index));
      });
    });
  }

  /**
   * Renders ambiance gallery panels and handles accordion expansion.
   */
  function initAmbianceGallery() {
    const panelsEl = document.getElementById('panels');
    if (!panelsEl) return;

    const dataModule = global.Djeroe?.Data || global;
    const ambianceList = dataModule.AMBIANCE_DATA || [];

    panelsEl.innerHTML = ambianceList.map(item => `
      <button type="button" class="panel" style="--c1:${item.colorStart};--c2:${item.colorEnd}" aria-label="${item.title}">
        <img class="panel-bg" src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async">
        <div class="panel-overlay"></div>
        <span class="no">${item.number}</span>
        <div class="panel-body">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </div>
        <span class="panel-close-hint">Ketuk untuk menutup ✕</span>
      </button>
    `).join('');

    // Accordion toggle delegation
    panelsEl.addEventListener('click', (event) => {
      const clickedPanel = event.target.closest('.panel');
      if (!clickedPanel) return;

      const isCurrentlyOpen = clickedPanel.classList.contains('open');
      panelsEl.querySelectorAll('.panel.open').forEach(panel => {
        panel.classList.remove('open');
      });

      if (!isCurrentlyOpen) {
        clickedPanel.classList.add('open');
      }
    });
  }

  /**
   * Resolves initial scene index from current URL hash.
   * @returns {number}
   */
  function resolveInitialSceneIndex() {
    const dataModule = global.Djeroe?.Data || global;
    const ids = dataModule.SCENE_CONFIG?.ids || ['beranda', 'tentang', 'menu', 'suasana', 'kontak'];
    const currentHash = location.hash.slice(1);
    const matchedIndex = ids.indexOf(currentHash);
    return matchedIndex > -1 ? matchedIndex : 0;
  }

  /**
   * Manages preloader animation lifecycle, asset completion synchronization,
   * and clean DOM unmounting.
   */
  function initPreloader() {
    const preloaderEl = document.getElementById('preloader');
    const pctEl = document.getElementById('preloaderPct');
    const barEl = document.getElementById('preloaderBar');
    const startSceneIndex = resolveInitialSceneIndex();

    // Guard: Fallback when preloader element does not exist in DOM
    if (!preloaderEl) {
      if (global.Djeroe?.Navigation) {
        global.Djeroe.Navigation.apply(startSceneIndex);
      }
      return;
    }

    if (global.Djeroe?.Navigation) {
      global.Djeroe.Navigation.setLocked(true);
    }

    let currentPercent = 0;
    let isWindowLoaded = document.readyState === 'complete';
    let isCompleted = false;
    let preloaderRafHandle = null;

    const onWindowLoad = () => {
      isWindowLoaded = true;
    };

    if (!isWindowLoaded) {
      window.addEventListener('load', onWindowLoad, { once: true });
    }

    const startTime = performance.now();

    function renderProgress(now) {
      if (isCompleted) return;

      const elapsed = now - startTime;
      let targetPercent = Math.floor((elapsed / PRELOADER_PACE_DURATION_MS) * 100);

      // Gracefully hold at 88% if heavyweight external assets are still downloading
      if (!isWindowLoaded && targetPercent > 88 && elapsed < PRELOADER_MAX_WAIT_MS) {
        targetPercent = 88;
      }
      targetPercent = Math.min(100, Math.max(0, targetPercent));

      if (targetPercent > currentPercent) {
        currentPercent = targetPercent;
        if (pctEl) pctEl.textContent = `${currentPercent}%`;
        if (barEl) barEl.style.width = `${currentPercent}%`;
      }

      if (currentPercent >= 100) {
        isCompleted = true;
        window.removeEventListener('load', onWindowLoad);

        if (pctEl) pctEl.textContent = '100%';
        if (barEl) barEl.style.width = '100%';

        setTimeout(() => {
          preloaderEl.classList.add('done');
          if (global.Djeroe?.Navigation) {
            global.Djeroe.Navigation.apply(startSceneIndex);
          }

          setTimeout(() => {
            if (global.Djeroe?.Navigation) {
              global.Djeroe.Navigation.setLocked(false);
            }
            if (preloaderEl.parentNode) {
              preloaderEl.remove();
            }
          }, 850);
        }, 180);

        return;
      }

      preloaderRafHandle = requestAnimationFrame(renderProgress);
    }

    preloaderRafHandle = requestAnimationFrame(renderProgress);
  }

  /**
   * Main bootstrap entry point.
   */
  function bootstrap() {
    // 1. Decorative static foundations
    initAmbientBeans();
    initTypographyAndMarquee();
    initAmbianceGallery();

    // 2. Initialize interactive subsystems
    if (global.Djeroe?.Cursor) {
      global.Djeroe.Cursor.init();
    }
    if (global.Djeroe?.Menu) {
      global.Djeroe.Menu.init();
    }
    if (global.Djeroe?.Navigation) {
      global.Djeroe.Navigation.init();
    }

    // 3. Initiate preloader lifecycle
    initPreloader();
  }

  // Ensure DOM is ready before bootstrapping
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }

  // Export to namespace
  global.Djeroe = global.Djeroe || {};
  global.Djeroe.App = {
    bootstrap
  };

})(typeof window !== 'undefined' ? window : this);
