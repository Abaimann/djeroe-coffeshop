/**
 * @fileoverview Scene switching, gestures, transitions, and spatial animations.
 * Coordinates 5 scenes: Beranda, Tentang, Menu, Suasana, Kontak.
 * Handles touch swipes, mouse wheel, keyboard shortcuts, and URL hash synchronization.
 */

(function (global) {
  'use strict';

  const SCENE_TRANSITION_IN_MS = 360;
  const SCENE_TRANSITION_TOTAL_MS = 820;
  const WHEEL_THRESHOLD = 50;
  const TOUCH_SWIPE_MIN_PX = 45;
  const WHEEL_RESET_DELAY_MS = 160;

  // Cached DOM references
  let navEl = null;
  let sideEl = null;
  let cnEl = null;
  let orbEl = null;
  let orb2El = null;
  let wipeEl = null;
  let sceneElements = [];

  // Navigation State
  let currentSceneIndex = -1;
  let isTransitionLocked = false;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;

  /**
   * Retrieves scene configuration schemas from data layer.
   * @returns {{ names: string[], ids: string[], positions: number[][], tickerPhrases: string[] }}
   */
  function getConfig() {
    const dataModule = global.Djeroe?.Data || global;
    const fallbackConfig = {
      names: ['Beranda', 'Tentang', 'Menu', 'Suasana', 'Kontak'],
      ids: ['beranda', 'tentang', 'menu', 'suasana', 'kontak'],
      positions: [
        [30, -10, 0.7, -30, 25, 1],
        [-28, 10, 0.9, 30, -20, 1.2],
        [25, 25, 1.1, -35, -10, 0.8],
        [-20, -20, 0.8, 25, 30, 1.3],
        [35, 5, 1, -25, 20, 0.9]
      ]
    };
    return dataModule.SCENE_CONFIG || fallbackConfig;
  }

  /**
   * Renders navigation bars and scene indicator buttons.
   */
  function renderNavControls() {
    const { names } = getConfig();

    if (navEl) {
      navEl.innerHTML = names.map((name, index) =>
        `<button type="button" data-go="${index}"><span>${name}</span><span>${name}</span></button>`
      ).join('');
    }

    if (sideEl) {
      sideEl.innerHTML = names.map((name, index) =>
        `<button type="button" data-go="${index}" aria-label="${name}"></button>`
      ).join('');
    }
  }

  /**
   * Animates numeric statistics inside Scene 1 (Tentang Djeroe).
   */
  function animateMetricCounters() {
    const numberNodes = document.querySelectorAll('.num');
    if (!numberNodes.length) return;

    numberNodes.forEach(node => {
      const targetValue = parseFloat(node.dataset.to);
      if (isNaN(targetValue)) return;

      const startTime = performance.now() + 400;
      const animationDuration = 1400;

      function renderFrame(now) {
        const progress = Math.min(Math.max((now - startTime) / animationDuration, 0), 1);
        // Ease-out cubic calculation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(targetValue * easeOut);

        if (progress < 1) {
          requestAnimationFrame(renderFrame);
        }
      }

      requestAnimationFrame(renderFrame);
    });
  }

  /**
   * Applies the visual state of the target scene.
   * @param {number} targetIndex - Zero-based index of destination scene
   */
  function applyScene(targetIndex) {
    const { ids, positions } = getConfig();

    if (!sceneElements.length) {
      sceneElements = Array.from(document.querySelectorAll('.scene'));
    }

    sceneElements.forEach((scene, index) => {
      scene.classList.toggle('active', index === targetIndex);
      scene.classList.toggle('before', index < targetIndex);
    });

    // Update active states on nav & side buttons
    document.querySelectorAll('nav button, .side button').forEach(button => {
      const buttonTarget = parseInt(button.dataset.go, 10);
      button.classList.toggle('on', buttonTarget === targetIndex);
    });

    // Animate spatial ambient gradient orbs
    const currentPosition = positions[targetIndex];
    if (currentPosition && orbEl && orb2El) {
      orbEl.style.setProperty('--ox', `${currentPosition[0]}vw`);
      orbEl.style.setProperty('--oy', `${currentPosition[1]}vh`);
      orbEl.style.setProperty('--os', currentPosition[2]);

      orb2El.style.setProperty('--bx', `${currentPosition[3]}vw`);
      orb2El.style.setProperty('--by', `${currentPosition[4]}vh`);
      orb2El.style.setProperty('--bs', currentPosition[5]);
    }

    document.body.dataset.s = String(targetIndex);

    if (cnEl) {
      cnEl.textContent = `0${targetIndex + 1}`;
    }

    currentSceneIndex = targetIndex;

    // Update browser URL hash quietly without jumping
    if (ids[targetIndex]) {
      history.replaceState(null, '', `#${ids[targetIndex]}`);
    }

    // Trigger metrics counter when entering Scene 1 (Tentang)
    if (targetIndex === 1) {
      animateMetricCounters();
    }
  }

  /**
   * Orchestrates scene transition with curtain wipe animation.
   * @param {number} targetIndex - Target scene index
   */
  function goToScene(targetIndex) {
    const { ids } = getConfig();
    const maxIndex = (ids.length || sceneElements.length) - 1;

    // Guards: boundary checks & transition locking
    if (targetIndex < 0 || targetIndex > maxIndex) return;
    if (targetIndex === currentSceneIndex || isTransitionLocked) return;

    isTransitionLocked = true;

    // Immediate application for initial bootstrapping
    if (currentSceneIndex < 0 || !wipeEl) {
      applyScene(targetIndex);
      isTransitionLocked = false;
      return;
    }

    // Run curtain wipe transition
    wipeEl.classList.remove('run');
    void wipeEl.offsetWidth; // Force CSS reflow to re-trigger transition
    wipeEl.classList.add('run');

    setTimeout(() => {
      applyScene(targetIndex);
    }, SCENE_TRANSITION_IN_MS);

    setTimeout(() => {
      isTransitionLocked = false;
    }, SCENE_TRANSITION_TOTAL_MS);
  }

  /**
   * Binds user gesture listeners (Wheel, Keyboard, Touch, Click, Hash).
   */
  function setupGestureListeners() {
    // 1. Navigation Button Click Delegation
    document.addEventListener('click', (event) => {
      const triggerBtn = event.target.closest('[data-go]');
      if (!triggerBtn) return;

      event.preventDefault();
      const targetScene = parseInt(triggerBtn.dataset.go, 10);
      if (!isNaN(targetScene)) {
        goToScene(targetScene);
      }
    });

    // 2. Mouse Wheel Navigation with Internal Scroll Boundary Check
    window.addEventListener('wheel', (event) => {
      const activeScene = sceneElements[currentSceneIndex];

      // Allow natural scrolling inside scenes that have vertical scrollable content
      if (activeScene && activeScene.scrollHeight > activeScene.clientHeight + 4) {
        const canScrollDown = event.deltaY > 0 && activeScene.scrollTop + activeScene.clientHeight < activeScene.scrollHeight - 4;
        const canScrollUp = event.deltaY < 0 && activeScene.scrollTop > 0;
        if (canScrollDown || canScrollUp) {
          return;
        }
      }

      wheelAccumulator += event.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelAccumulator = 0;
      }, WHEEL_RESET_DELAY_MS);

      if (Math.abs(wheelAccumulator) > WHEEL_THRESHOLD) {
        const direction = wheelAccumulator > 0 ? 1 : -1;
        goToScene(currentSceneIndex + direction);
        wheelAccumulator = 0;
      }
    }, { passive: true });

    // 3. Keyboard Arrow & Page Navigation
    window.addEventListener('keydown', (event) => {
      // Guard: Ignore shortcuts while user is typing in search bar
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
        goToScene(currentSceneIndex + 1);
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
        goToScene(currentSceneIndex - 1);
      }
    });

    // 4. Touch Gestures with Directional & Container Bounds Validation
    window.addEventListener('touchstart', (event) => {
      if (event.touches && event.touches.length > 0) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (event) => {
      if (!event.changedTouches || event.changedTouches.length === 0) return;

      const deltaX = touchStartX - event.changedTouches[0].clientX;
      const deltaY = touchStartY - event.changedTouches[0].clientY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Guard: Discard horizontal gestures to allow swiping category tabs & carousels
      if (absX >= absY) return;

      // Vertical swipe evaluation
      if (absY > TOUCH_SWIPE_MIN_PX) {
        const activeScene = sceneElements[currentSceneIndex];
        if (activeScene) {
          const hasScrollableContent = (activeScene.scrollHeight - activeScene.clientHeight) > 30;
          if (hasScrollableContent) {
            const canScrollDown = activeScene.scrollTop + activeScene.clientHeight < activeScene.scrollHeight - 12;
            const canScrollUp = activeScene.scrollTop > 12;
            // Guard: Allow internal container scrolling
            if (deltaY > 0 && canScrollDown) return;
            if (deltaY < 0 && canScrollUp) return;
          }
        }

        const direction = deltaY > 0 ? 1 : -1;
        goToScene(currentSceneIndex + direction);
      }
    }, { passive: true });

    // 5. URL Hash Synchronizer
    window.addEventListener('hashchange', () => {
      const { ids } = getConfig();
      const currentHash = location.hash.slice(1);
      const matchedIndex = ids.indexOf(currentHash);
      if (matchedIndex > -1) {
        goToScene(matchedIndex);
      }
    });
  }

  /**
   * Initializes scene navigation engine.
   */
  function initNavigation() {
    navEl = document.getElementById('nav');
    sideEl = document.getElementById('side');
    cnEl = document.getElementById('cn');
    orbEl = document.getElementById('orb');
    orb2El = document.getElementById('orb2');
    wipeEl = document.getElementById('wipe');
    sceneElements = Array.from(document.querySelectorAll('.scene'));

    renderNavControls();
    setupGestureListeners();
  }

  // Export to namespace
  global.Djeroe = global.Djeroe || {};
  global.Djeroe.Navigation = {
    init: initNavigation,
    go: goToScene,
    apply: applyScene,
    getCurrentIndex: () => currentSceneIndex,
    isLocked: () => isTransitionLocked,
    setLocked: (val) => { isTransitionLocked = !!val; }
  };

  // Global backward-compatibility shortcuts
  global.go = goToScene;
  global.apply = applyScene;

})(typeof window !== 'undefined' ? window : this);
