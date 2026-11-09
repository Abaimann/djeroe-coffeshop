/**
 * @fileoverview High-performance event-driven custom cursor.
 * Features:
 * - Completely disabled on mobile/touch devices (0 CPU/battery footprint).
 * - Desktop animation sleeps automatically when mouse is stationary (Math.abs < 0.1px).
 * - Hardware-accelerated translate3d transforms.
 * - Magnetic attraction effect for actionable buttons (.mag).
 * - Smooth hover feedback on interactive targets.
 */

(function (global) {
  'use strict';

  /**
   * Hover device feature query.
   * Only matches devices with precise pointing devices (mouse) and hover capability.
   */
  const HOVER_MEDIA_QUERY = '(hover: hover) and (pointer: fine)';

  const EASING_FACTOR = 0.16;
  const SLEEP_THRESHOLD = 0.08;

  let curEl = null;
  let ringEl = null;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  let isFirstMove = true;
  let isLoopActive = false;
  let rafHandle = null;
  let isCursorVisible = false;

  // Active magnetic button tracking
  let activeMagElement = null;

  /**
   * Evaluates if current platform supports hover interactions.
   * @returns {boolean}
   */
  function supportsHover() {
    return typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(HOVER_MEDIA_QUERY).matches;
  }

  /**
   * Core easing step for outer ring cursor.
   * Cancels rAF and sleeps when delta reaches sub-pixel threshold.
   */
  function stepRing() {
    if (!ringEl) {
      isLoopActive = false;
      return;
    }

    const deltaX = mouseX - ringX;
    const deltaY = mouseY - ringY;

    // Guard: Sleep when easing has completed within subpixel delta
    if (Math.abs(deltaX) < SLEEP_THRESHOLD && Math.abs(deltaY) < SLEEP_THRESHOLD) {
      ringX = mouseX;
      ringY = mouseY;
      ringEl.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
      isLoopActive = false;
      rafHandle = null;
      return;
    }

    ringX += deltaX * EASING_FACTOR;
    ringY += deltaY * EASING_FACTOR;
    ringEl.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;

    rafHandle = requestAnimationFrame(stepRing);
  }

  /**
   * Wakes the easing loop if currently asleep.
   */
  function wakeCursorLoop() {
    if (!isLoopActive) {
      isLoopActive = true;
      rafHandle = requestAnimationFrame(stepRing);
    }
  }

  /**
   * Handles mouse movement on desktop viewports.
   * @param {MouseEvent} event
   */
  function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!curEl || !ringEl) return;

    if (isFirstMove) {
      ringX = mouseX;
      ringY = mouseY;
      isFirstMove = false;
      curEl.style.opacity = '1';
      ringEl.style.opacity = '1';
    }

    // Direct hardware-accelerated positioning for inner dot
    curEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    // Magnetic button pull computation
    const magTarget = event.target ? event.target.closest('.mag') : null;
    if (magTarget) {
      activeMagElement = magTarget;
      const rect = magTarget.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left - rect.width / 2) * 0.25;
      const offsetY = (event.clientY - rect.top - rect.height / 2) * 0.35;
      magTarget.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
    } else if (activeMagElement) {
      activeMagElement.style.transform = '';
      activeMagElement = null;
    }

    wakeCursorLoop();
  }

  /**
   * Resets magnetic button offset when pointer leaves element.
   * @param {MouseEvent} event
   */
  function handleMouseOut(event) {
    const magTarget = event.target ? event.target.closest('.mag') : null;
    if (magTarget && !magTarget.contains(event.relatedTarget)) {
      magTarget.style.transform = '';
      if (activeMagElement === magTarget) {
        activeMagElement = null;
      }
    }
  }

  /**
   * Expands cursor ring when hovering interactive elements.
   * @param {MouseEvent} event
   */
  function handleMouseOver(event) {
    if (!ringEl || !event.target) return;
    const isInteractive = !!event.target.closest(
      'a, button, .card, .stat, .title span, .hours div, input, [data-go], .tab, .panel, label'
    );
    ringEl.classList.toggle('h', isInteractive);
  }

  /**
   * Hides custom cursor when pointer departs browser window.
   */
  function handleDocumentMouseLeave() {
    if (!curEl || !ringEl) return;
    isCursorVisible = false;
    curEl.style.opacity = '0';
    ringEl.style.opacity = '0';
    if (rafHandle) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
      isLoopActive = false;
    }
  }

  /**
   * Restores custom cursor visibility when pointer re-enters window.
   */
  function handleDocumentMouseEnter() {
    if (!curEl || !ringEl || isFirstMove) return;
    isCursorVisible = true;
    curEl.style.opacity = '1';
    ringEl.style.opacity = '1';
  }

  /**
   * Teardown all event listeners and cancel animation frames.
   */
  function destroyCursor() {
    if (rafHandle) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
    isLoopActive = false;

    window.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('mouseover', handleMouseOver);
    document.documentElement.removeEventListener('mouseleave', handleDocumentMouseLeave);
    document.documentElement.removeEventListener('mouseenter', handleDocumentMouseEnter);

    if (curEl) curEl.style.display = 'none';
    if (ringEl) ringEl.style.display = 'none';
  }

  /**
   * Initializes cursor if device has mouse capabilities.
   */
  function initCursor() {
    curEl = document.getElementById('cur');
    ringEl = document.getElementById('ring');

    if (!curEl || !ringEl) return;

    // Mobile / touch screen guard: completely skip and hide
    if (!supportsHover()) {
      curEl.style.display = 'none';
      ringEl.style.display = 'none';
      return;
    }

    // Prepare desktop initial state
    curEl.style.display = 'block';
    ringEl.style.display = 'block';
    curEl.style.opacity = '0';
    ringEl.style.opacity = '0';
    curEl.style.transition = 'opacity 0.25s ease';
    ringEl.style.transition = 'width 0.35s var(--e), height 0.35s var(--e), margin 0.35s var(--e), background 0.3s, opacity 0.25s ease';

    // Passive listeners for maximum scroll/render throughput
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleDocumentMouseLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', handleDocumentMouseEnter, { passive: true });

    // Listen to media query changes (e.g. tablet dock/undock, window resizing across device thresholds)
    try {
      const mediaWatcher = window.matchMedia(HOVER_MEDIA_QUERY);
      if (typeof mediaWatcher.addEventListener === 'function') {
        mediaWatcher.addEventListener('change', (e) => {
          if (!e.matches) {
            destroyCursor();
          } else {
            initCursor();
          }
        });
      }
    } catch (_) {
      // Graceful fallback for older media query implementations
    }
  }

  // Export to namespace
  global.Djeroe = global.Djeroe || {};
  global.Djeroe.Cursor = {
    init: initCursor,
    destroy: destroyCursor
  };

})(typeof window !== 'undefined' ? window : this);
