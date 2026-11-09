/**
 * @fileoverview Menu catalog management, search filtering, category pagination,
 * and performance-optimized 3D card tilt interactions.
 */

(function (global) {
  'use strict';

  const MOBILE_BREAKPOINT = 820;
  const MOBILE_LIMITED_COUNT = 8;
  const SEARCH_DEBOUNCE_MS = 120;
  const RESIZE_DEBOUNCE_MS = 150;
  const TILT_MAX_DEGREES = 12;

  // DOM Elements cache
  let tabsEl = null;
  let gridEl = null;
  let menuSearchEl = null;
  let menuSearchClearEl = null;
  let menuCounterEl = null;

  // State
  let activeCategory = 'Menu Lengkap';
  let searchQuery = '';
  let isFullMenuExpanded = false;
  let searchTimer = null;
  let resizeTimer = null;
  let wasMobileView = false;

  // Tilt State
  let tiltCard = null;
  let tiltMouseX = 0;
  let tiltMouseY = 0;
  let tiltRafHandle = null;

  /**
   * Evaluates if viewport falls within mobile screen parameters.
   * @returns {boolean}
   */
  function isMobileViewport() {
    return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
  }

  /**
   * Evaluates if device supports fine hover interactions for 3D card tilt.
   * @returns {boolean}
   */
  function canTiltCards() {
    return typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  /**
   * Sanitizes untrusted strings to prevent XSS during innerHTML injection.
   * @param {string} rawString
   * @returns {string}
   */
  function sanitizeHtml(rawString) {
    if (!rawString) return '';
    return String(rawString).replace(/[&<>'"]/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char] || char));
  }

  /**
   * Renders navigation category filter tabs with dynamic counts.
   * @param {ReadonlyArray<Object>} catalog
   * @param {Readonly<Record<string, string>>} labels
   * @param {ReadonlyArray<string>} keys
   */
  function renderCategoryTabs(catalog, labels, keys) {
    if (!tabsEl) return;

    tabsEl.innerHTML = keys.map(cat => {
      const isAll = cat === 'Menu Lengkap';
      const count = isAll ? catalog.length : catalog.filter(item => item.cat === cat).length;
      const isSelected = cat === activeCategory;
      const activeClass = isSelected ? 'on' : '';
      const allClass = isAll ? 'tab-all' : '';

      return `
        <button type="button" class="tab ${activeClass} ${allClass}" data-t="${cat}" aria-pressed="${isSelected}">
          <span>${labels[cat] || cat}</span>
          <small style="opacity:.7;font-size:.78rem">(${count})</small>
        </button>
      `;
    }).join('');
  }

  /**
   * Filters catalog by active category and search term.
   * @param {ReadonlyArray<Object>} catalog
   * @param {string} category
   * @param {string} query
   * @returns {Array<Object>}
   */
  function filterCatalog(catalog, category, query) {
    let results = [...catalog];

    if (category !== 'Menu Lengkap') {
      results = results.filter(item => item.cat === category);
    }

    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(cleanQuery) ||
        item.desc.toLowerCase().includes(cleanQuery) ||
        item.cat.toLowerCase().includes(cleanQuery)
      );
    }

    return results;
  }

  /**
   * Generates markup for menu cards list.
   * @param {Array<Object>} items
   * @returns {string}
   */
  function buildCardsMarkup(items) {
    return items.map((item, index) => `
      <div class="card" data-id="${item.id}" style="--n:${index}">
        <div class="card-img-wrap">
          <img src="${item.img}" alt="${sanitizeHtml(item.name)}" loading="lazy" decoding="async" class="card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
          <div class="card-img-fallback" style="display:none"><span>${item.em}</span></div>
          <span class="card-cat-badge">${item.cat}</span>
          ${item.tag ? `<span class="card-tag-floating ${item.tag.toLowerCase()}">${item.tag}</span>` : ''}
        </div>
        <div class="card-content">
          <h3>${sanitizeHtml(item.name)}</h3>
          <small>${sanitizeHtml(item.desc)}</small>
          <div class="card-foot">
            <strong class="card-price">Rp ${item.price}</strong>
            <span class="card-note-tag">${item.note || 'Pilihan'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Primary display driver for menu interface.
   * @param {string} [category] - Target category (optional)
   * @param {string} [query] - Search term (optional)
   */
  function displayMenu(category, query) {
    const dataModule = global.Djeroe?.Data || global;
    const catalog = dataModule.MENU_DATA || [];
    const labels = dataModule.CATEGORY_LABELS || {};
    const keys = dataModule.CATEGORY_KEYS || [];

    if (category !== undefined) {
      if (category !== activeCategory) {
        isFullMenuExpanded = false;
      }
      activeCategory = category;
    }

    if (query !== undefined) {
      searchQuery = query;
    }

    renderCategoryTabs(catalog, labels, keys);

    const filteredItems = filterCatalog(catalog, activeCategory, searchQuery);
    const cleanSearch = searchQuery.trim();

    // 1. Update Result Counter Narrative
    if (menuCounterEl) {
      if (cleanSearch) {
        menuCounterEl.innerHTML = `Ditemukan <b>${filteredItems.length}</b> menu untuk "<b>${sanitizeHtml(cleanSearch)}</b>" ${activeCategory !== 'Menu Lengkap' ? `di ${activeCategory}` : ''}`;
      } else if (activeCategory === 'Menu Lengkap') {
        if (isMobileViewport() && !isFullMenuExpanded) {
          menuCounterEl.innerHTML = `Menampilkan <b>${MOBILE_LIMITED_COUNT} menu pilihan</b> (dari ${filteredItems.length} menu lengkap)`;
        } else {
          menuCounterEl.innerHTML = `Menampilkan seluruh <b>${filteredItems.length} menu lengkap</b> Djeroe`;
        }
      } else {
        menuCounterEl.innerHTML = `Menampilkan <b>${filteredItems.length} menu</b> kategori ${activeCategory}`;
      }
    }

    // 2. Toggle Clear Search Button
    if (menuSearchClearEl) {
      menuSearchClearEl.style.display = cleanSearch ? 'grid' : 'none';
    }

    // 3. Handle Empty State
    if (!gridEl) return;

    if (filteredItems.length === 0) {
      gridEl.innerHTML = `
        <div class="menu-empty">
          <p>Tidak ada menu yang sesuai dengan kata kunci "<b>${sanitizeHtml(cleanSearch)}</b>".</p>
          <button type="button" class="btn-reset" id="btnResetSearch">Lihat Semua Menu</button>
        </div>
      `;
      return;
    }

    // 4. Calculate Responsive Limit
    const shouldLimitMobile = isMobileViewport() &&
      activeCategory === 'Menu Lengkap' &&
      !cleanSearch &&
      !isFullMenuExpanded;

    const itemsToRender = shouldLimitMobile
      ? filteredItems.slice(0, MOBILE_LIMITED_COUNT)
      : filteredItems;

    let outputHtml = buildCardsMarkup(itemsToRender);

    // 5. Append Mobile Toggle Button when appropriate
    if (isMobileViewport() && activeCategory === 'Menu Lengkap' && !cleanSearch) {
      if (!isFullMenuExpanded && filteredItems.length > MOBILE_LIMITED_COUNT) {
        outputHtml += `
          <div style="grid-column: 1 / -1; text-align: center; padding: 14px 0 6px;">
            <button type="button" id="btnToggleFullMenu" class="btn fill mag" style="padding: 10px 24px; font-size: .84rem;">
              Tampilkan Semua Menu (${filteredItems.length}) ↓
            </button>
          </div>
        `;
      } else if (isFullMenuExpanded) {
        outputHtml += `
          <div style="grid-column: 1 / -1; text-align: center; padding: 14px 0 6px;">
            <button type="button" id="btnToggleFullMenu" class="btn mag" style="padding: 9px 20px; font-size: .82rem;">
              Tampilkan Lebih Sedikit ↑
            </button>
          </div>
        `;
      }
    }

    gridEl.innerHTML = outputHtml;
  }

  /**
   * Applies 3D rotation transform using requestAnimationFrame throttling.
   */
  function applyCardTilt() {
    if (tiltCard) {
      const rect = tiltCard.getBoundingClientRect();
      const normX = ((tiltMouseX - rect.left) / rect.width) - 0.5;
      const normY = ((tiltMouseY - rect.top) / rect.height) - 0.5;

      const rotateY = (normX * TILT_MAX_DEGREES).toFixed(2);
      const rotateX = (-normY * TILT_MAX_DEGREES).toFixed(2);

      tiltCard.style.setProperty('--ry', `${rotateY}deg`);
      tiltCard.style.setProperty('--rx', `${rotateX}deg`);
    }
    tiltRafHandle = null;
  }

  /**
   * Resets card 3D rotation variables back to rest position.
   * @param {HTMLElement} card
   */
  function resetCardTilt(card) {
    if (!card) return;
    card.style.setProperty('--rx', '0');
    card.style.setProperty('--ry', '0');
  }

  /**
   * Binds card tilt listeners on desktop hover devices only.
   */
  function setupCardTilt() {
    if (!gridEl || !canTiltCards()) return;

    gridEl.addEventListener('mousemove', (event) => {
      const card = event.target ? event.target.closest('.card') : null;
      if (!card) {
        if (tiltCard) {
          resetCardTilt(tiltCard);
          tiltCard = null;
        }
        return;
      }

      if (tiltCard && tiltCard !== card) {
        resetCardTilt(tiltCard);
      }

      tiltCard = card;
      tiltMouseX = event.clientX;
      tiltMouseY = event.clientY;

      if (!tiltRafHandle) {
        tiltRafHandle = requestAnimationFrame(applyCardTilt);
      }
    }, { passive: true });

    gridEl.addEventListener('mouseout', (event) => {
      const card = event.target ? event.target.closest('.card') : null;
      if (!card) return;

      // Guard: Do not reset if pointer is just moving to a child element inside the same card
      if (event.relatedTarget && card.contains(event.relatedTarget)) {
        return;
      }

      resetCardTilt(card);
      if (tiltCard === card) {
        tiltCard = null;
      }
    }, { passive: true });

    gridEl.addEventListener('mouseleave', () => {
      if (tiltCard) {
        resetCardTilt(tiltCard);
        tiltCard = null;
      }
      if (tiltRafHandle) {
        cancelAnimationFrame(tiltRafHandle);
        tiltRafHandle = null;
      }
    }, { passive: true });
  }

  /**
   * Binds delegation and search input event listeners.
   */
  function setupEventListeners() {
    // 1. Category Tabs Switching
    if (tabsEl) {
      tabsEl.addEventListener('click', (event) => {
        const tabBtn = event.target.closest('[data-t]');
        if (tabBtn && tabBtn.dataset.t) {
          displayMenu(tabBtn.dataset.t);
        }
      });
    }

    // 2. Debounced Live Search Input
    if (menuSearchEl) {
      menuSearchEl.addEventListener('input', (event) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          displayMenu(activeCategory, event.target.value);
        }, SEARCH_DEBOUNCE_MS);
      }, { passive: true });
    }

    // 3. Clear Search Button
    if (menuSearchClearEl) {
      menuSearchClearEl.addEventListener('click', () => {
        if (menuSearchEl) {
          menuSearchEl.value = '';
          menuSearchEl.focus();
        }
        displayMenu(activeCategory, '');
      });
    }

    // 4. Grid delegation for dynamic buttons (expand/collapse & reset search)
    if (gridEl) {
      gridEl.addEventListener('click', (event) => {
        const toggleBtn = event.target.closest('#btnToggleFullMenu');
        if (toggleBtn) {
          isFullMenuExpanded = !isFullMenuExpanded;
          displayMenu('Menu Lengkap');
          return;
        }

        const resetBtn = event.target.closest('#btnResetSearch');
        if (resetBtn) {
          if (menuSearchEl) menuSearchEl.value = '';
          isFullMenuExpanded = false;
          displayMenu(isMobileViewport() ? 'Kopi' : 'Menu Lengkap', '');
        }
      });
    }

    // 5. Throttled Window Resize to adjust card limits between breakpoints
    wasMobileView = isMobileViewport();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const nowMobile = isMobileViewport();
        if (nowMobile !== wasMobileView) {
          wasMobileView = nowMobile;
          displayMenu(activeCategory);
        }
      }, RESIZE_DEBOUNCE_MS);
    }, { passive: true });

    // 6. Setup 3D card tilt
    setupCardTilt();
  }

  /**
   * Initializes the menu subsystem.
   */
  function initMenu() {
    tabsEl = document.getElementById('tabs');
    gridEl = document.getElementById('grid');
    menuSearchEl = document.getElementById('menuSearch');
    menuSearchClearEl = document.getElementById('menuSearchClear');
    menuCounterEl = document.getElementById('menuCounter');

    if (!tabsEl || !gridEl) return;

    activeCategory = isMobileViewport() ? 'Kopi' : 'Menu Lengkap';
    displayMenu(activeCategory);
    setupEventListeners();
  }

  // Export to namespace
  global.Djeroe = global.Djeroe || {};
  global.Djeroe.Menu = {
    init: initMenu,
    display: displayMenu
  };

})(typeof window !== 'undefined' ? window : this);
