/*
==============================================================================
# Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
# Made By Arif (https://arifmahmud.com/)
# Project: AmpBlock
==============================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll-aware Header Backdrop Blur
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Toggle & Drawer
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.innerHTML = '&#9776;';
        navToggle.setAttribute('aria-expanded', false);
      });
    });

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.innerHTML = '&#9776;';
        navToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  // 3. Intelligent Browser Detection for Hero & CTA Buttons
  const browserBtn = document.getElementById('primaryInstallBtn');
  const browserNotice = document.getElementById('browserNotice');
  if (browserBtn) {
    const ua = navigator.userAgent;
    let browserName = "Chrome";
    let iconSvg = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

    if (ua.indexOf("Edg") > -1) {
      browserName = "Microsoft Edge";
    } else if (ua.indexOf("Brave") > -1 || (navigator.brave && navigator.brave.isBrave)) {
      browserName = "Brave Browser";
    } else if (ua.indexOf("OPR") > -1 || ua.indexOf("Opera") > -1) {
      browserName = "Opera Browser";
    } else if (ua.indexOf("Vivaldi") > -1) {
      browserName = "Vivaldi";
    }

    const btnLabel = browserBtn.querySelector('.btn-label');
    if (btnLabel) {
      btnLabel.textContent = `Get AmpBlock for ${browserName}`;
    }
    if (browserNotice) {
      browserNotice.innerHTML = `Native Manifest V3 engine for <strong>${browserName}</strong>, Chrome, Edge, Brave & Opera.`;
    }
  }

  // 4. Smooth Counter Animation for Stats Ribbon
  const blockedCounter = document.getElementById('counterBlocked');
  if (blockedCounter) {
    let count = 4872954;
    setInterval(() => {
      count += Math.floor(Math.random() * 5) + 2;
      blockedCounter.textContent = count.toLocaleString();
    }, 1500);
  }

  // 5. Interactive Live Ad Simulator Toggle
  const simToggle = document.getElementById('simToggle');
  const simViewport = document.getElementById('simViewport');
  const simBadge = document.getElementById('simStatusBadge');

  if (simToggle && simViewport) {
    simToggle.addEventListener('change', () => {
      const isProtected = simToggle.checked;
      if (isProtected) {
        simViewport.classList.remove('sim-unprotected');
        simViewport.classList.add('sim-protected');
        if (simBadge) {
          simBadge.textContent = 'AMPBLOCK ACTIVE: 0 ADS & POPUPS';
          simBadge.className = 'sim-status-badge protected';
        }
      } else {
        simViewport.classList.remove('sim-protected');
        simViewport.classList.add('sim-unprotected');
        if (simBadge) {
          simBadge.textContent = 'WARNING: 4 CLUTTERED ADS DETECTED';
          simBadge.className = 'sim-status-badge unprotected';
        }
      }
    });
  }

  // 6. Download Tracking & Instant Download Feedback
  const dlButtons = document.querySelectorAll('a[download]');
  dlButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>⚡ Downloading AmpBlock-Pro.zip...</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 3000);
    });
  });

  // 7. FAQ Accordion (Download Page)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 8. Universal Search Engine & Google Material 3 Search Hub
  const searchIndex = [
    {
      id: 'core-engine',
      category: 'Core Architecture',
      title: 'AmpBlock Pro v2.5.0 Ultra Engine',
      description: 'Next-generation Manifest V3 ad blocker engineered with 13,414+ Declarative Net Request rules, uBlock Origin procedural cosmetic filtering, and sub-15ms YouTube ad skipping.',
      keywords: 'ampblock amp block pro ad blocker manifest v3 engine free open source chrome edge brave fast',
      url: 'index.html'
    },
    {
      id: 'youtube',
      category: 'Video Optimization',
      title: 'YouTube Ultra Buster v6.5',
      description: 'Pre-emptive MAIN-world JSON pruning, 16x speed-skipping sequencer, and instant audio mute that neutralizes YouTube video ads, midrolls, and anti-adblock modals in sub-15ms.',
      keywords: 'ampblock youtube video ads buster skip adblock modal skip ad unskippable preroll midroll json prune audio mute 16x',
      url: 'features.html#youtube'
    },
    {
      id: 'popunder',
      category: 'Anti-Malware & Popups',
      title: 'Torrent & Streaming Popunder Defeater',
      description: 'Window.open sandboxing, invisible 100% viewport click-trap overlay cleaner, and programmatic anchor click prevention on torrent, anime, and movie streaming sites.',
      keywords: 'ampblock torrent popunder popup blocker click trap overlay fake download limetorrents 1337x streaming tabs',
      url: 'features.html#popunder'
    },
    {
      id: 'dnr-rules',
      category: 'Zero-CPU Kernel',
      title: '13,414+ Declarative Net Request (DNR) Rules',
      description: 'Massive rule set blocking advertising, telemetry, and malware servers natively at C++ level with zero memory leaks, while strictly preserving Rule 175 YouTube watch history.',
      keywords: 'ampblock dnr rules 13400 declarative net request c++ memory leaks rules.json surrogate redirect rule 175 history',
      url: 'features.html#dnr'
    },
    {
      id: 'procedural-filter',
      category: 'Cosmetic Engine',
      title: 'uBlock Origin Procedural Cosmetic Engine',
      description: 'Advanced DOM traversal engine supporting :has-text() with English & Bengali ("বিজ্ঞাপন", "Sponsored"), :upward(n) parent cleanup, and permanent :remove() node destruction.',
      keywords: 'ampblock procedural cosmetic filter ublock origin has-text upward remove watch-attr blank spaces obfuscated classes bangla bengali',
      url: 'features.html#zapper'
    },
    {
      id: 'scriptlet-engine',
      category: 'Scriptlet Sandbox',
      title: 'Modular Scriptlet Injection Engine',
      description: 'MAIN-world scriptlet runner providing set-constant tamper-proof locks, abort-current-inline-script (ACIS) inline execution killer, and nobab bait defusers.',
      keywords: 'ampblock scriptlet engine set-constant acis abort inline script json-prune spoof-css anti-adblock defuser nobab',
      url: 'features.html#zapper'
    },
    {
      id: 'surrogates',
      category: 'Local Redirection',
      title: 'Local DNR Surrogate Library',
      description: 'Synthetic high-speed surrogates (google-analytics.js, gpt.js, 1x1-transparent pixel) preventing site breakage and net::ERR_BLOCKED_BY_CLIENT anti-adblock triggers.',
      keywords: 'ampblock surrogates redirect google analytics gpt noop pixel transparent tracking anti-blocker bypass',
      url: 'features.html#dnr'
    },
    {
      id: 'sentinel-vectors',
      category: 'Security Sentinel',
      title: 'DevOps Zero-Trust Security Sentinel & 13 Threat Vectors',
      description: 'Automated in-browser WAF and behavioral defense: Anti-Formjacking Magecart, WebRTC real-IP leak shield, Drive-by auto-downloads, Canvas quantum noise, and IDN phishing alerts.',
      keywords: 'ampblock sentinel 13 threat vectors security webrtc real ip leak formjacking magecart canvas noise phishing cryptominer rce',
      url: 'features.html#sentinel-vectors'
    },
    {
      id: 'element-zapper',
      category: 'Surgical Control',
      title: 'Point-and-Click Visual Element Zapper',
      description: 'Interactive cyber-blue HUD targeting tool allowing users to click and permanently erase annoying sticky bars, paywalls, and newsletter modals without reloading.',
      keywords: 'ampblock element zapper point click remove paywall floating sticky banner clean dom',
      url: 'features.html#zapper'
    },
    {
      id: 'privacy-manifesto',
      category: 'Privacy First',
      title: '100% Client-Side Zero-Log Architecture',
      description: 'Engineered by Arif Mahmud & IT support BD with zero remote analytics, zero tracking databases, and 100% AMPass Secure Vault harmony. Your private data never leaves your device.',
      keywords: 'ampblock privacy zero log arif mahmud it support bd ampass secure vault open source sovereign',
      url: 'about.html'
    },
    {
      id: 'download-guide',
      category: 'Installation & Setup',
      title: 'Download Free for Chrome, Edge & Brave (.ZIP)',
      description: 'Free, clean distribution package (v2.5.0 Ultra) with easy 60-second visual installation guide for all Chromium browsers.',
      keywords: 'ampblock download free zip install chrome edge brave opera extension guide setup',
      url: 'download.html'
    },
    {
      id: 'faq',
      category: 'Help & FAQ',
      title: 'AmpBlock Pro Frequently Asked Questions',
      description: 'Everything you need to know about Manifest V3 ad blocking, YouTube ad avoidance, password manager compatibility, and site whitelisting.',
      keywords: 'ampblock faq questions answers help how to support youtube bypass whitelist ampass',
      url: 'download.html#faq'
    }
  ];

  // Helper: Highlight matches in text
  function highlightMatches(text, query) {
    if (!query) return text;
    const words = query.trim().split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return text;
    const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Core Search Function
  function performSearch(query) {
    const searchHub = document.querySelector('.features-search-hub');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const mainSearchInput = document.getElementById('mainSearchInput');
    const clearBtn = document.getElementById('searchClearBtn');

    if (!resultsContainer) return;

    const trimmed = (query || '').trim().toLowerCase();

    // Toggle clear button
    if (clearBtn) {
      clearBtn.style.display = trimmed.length > 0 ? 'inline-block' : 'none';
    }

    if (mainSearchInput && mainSearchInput.value !== query) {
      mainSearchInput.value = query;
    }

    // Active state on chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
      const chipVal = chip.getAttribute('data-query');
      if (chipVal && (chipVal.toLowerCase() === trimmed || (trimmed === '' && chipVal === 'all'))) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    if (!trimmed || trimmed === 'all') {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
      return;
    }

    const queryWords = trimmed.split(/\s+/).filter(Boolean);

    // Filter index
    const matches = searchIndex.filter(item => {
      const searchTarget = `${item.title} ${item.description} ${item.keywords} ${item.category}`.toLowerCase();
      // Match if all query words or the full string is present
      return queryWords.every(word => searchTarget.includes(word)) || searchTarget.includes(trimmed);
    });

    // Render results
    resultsContainer.style.display = 'block';

    if (matches.length > 0) {
      let cardsHtml = matches.map(item => `
        <div class="search-result-card">
          <div class="result-card-top">
            <span class="result-category-badge">${item.category}</span>
            <h3 class="result-card-title">${highlightMatches(item.title, query)}</h3>
            <p class="result-card-desc">${highlightMatches(item.description, query)}</p>
          </div>
          <a href="${item.url}" class="result-jump-btn">
            <span>Explore Feature</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/></svg>
          </a>
        </div>
      `).join('');

      resultsContainer.innerHTML = `
        <div class="search-results-header">
          <div class="search-results-title">
            Search Results for "${escapeHtml(query)}"
            <span class="search-count-pill">${matches.length} matches found</span>
          </div>
          <a href="javascript:void(0)" class="clear-results-link" id="clearResultsAction">Clear Search ✕</a>
        </div>
        <div class="search-results-grid">
          ${cardsHtml}
        </div>
      `;

      // Attach clear listener
      const clearAction = document.getElementById('clearResultsAction');
      if (clearAction) {
        clearAction.addEventListener('click', () => {
          performSearch('');
          if (history.pushState) {
            const url = new URL(window.location);
            url.searchParams.delete('q');
            window.history.pushState({}, '', url);
          }
        });
      }
    } else {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <div class="no-results-icon">🔍</div>
          <h3 class="no-results-title">No direct matches found for "${escapeHtml(query)}"</h3>
          <p class="no-results-desc">
            Try searching for keywords like <strong>ampblock</strong>, <strong>youtube</strong>, <strong>rules</strong>, <strong>popunder</strong>, or <strong>sentinel</strong>.
          </p>
          <button type="button" class="btn btn-secondary btn-small" id="resetSearchBtn">View All Features</button>
        </div>
      `;

      const resetBtn = document.getElementById('resetSearchBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          performSearch('');
          if (history.pushState) {
            const url = new URL(window.location);
            url.searchParams.delete('q');
            window.history.pushState({}, '', url);
          }
        });
      }
    }

    // Smooth scroll to results if triggered by user
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Bind Main Search Input & Clear Button
  const mainSearchInput = document.getElementById('mainSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');

  if (mainSearchInput) {
    let debounceTimer;
    mainSearchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const val = e.target.value.trim();
        performSearch(val);
        if (history.replaceState) {
          const url = new URL(window.location);
          if (val) {
            url.searchParams.set('q', val);
          } else {
            url.searchParams.delete('q');
          }
          window.history.replaceState({}, '', url);
        }
      }, 150);
    });

    mainSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(mainSearchInput.value.trim());
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (mainSearchInput) {
        mainSearchInput.value = '';
        mainSearchInput.focus();
      }
      performSearch('');
      if (history.pushState) {
        const url = new URL(window.location);
        url.searchParams.delete('q');
        window.history.pushState({}, '', url);
      }
    });
  }

  if (searchSubmitBtn && mainSearchInput) {
    searchSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch(mainSearchInput.value.trim());
    });
  }

  // Bind Search Filter Chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (mainSearchInput) {
        mainSearchInput.value = (query === 'all' ? '' : query);
      }
      performSearch(query === 'all' ? '' : query);
      if (history.pushState) {
        const url = new URL(window.location);
        if (query && query !== 'all') {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.history.pushState({}, '', url);
      }
    });
  });

  // Global Header Search Form Handling (Across all pages)
  const navSearchForms = document.querySelectorAll('.nav-search-form');
  navSearchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.nav-search-input');
      const q = input ? input.value.trim() : '';
      if (!q) return;

      if (window.location.pathname.endsWith('features.html')) {
        performSearch(q);
      } else {
        window.location.href = `features.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  // Global Keyboard Shortcut: '/' focuses search input
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      const searchBox = document.getElementById('mainSearchInput') || document.querySelector('.nav-search-input');
      if (searchBox) {
        searchBox.focus();
        searchBox.select();
      }
    }
  });

  // 9. Auto-execute search from URL query parameter (?q=ampblock)
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  if (initialQuery) {
    performSearch(initialQuery);
  }
});

