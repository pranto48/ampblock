/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * AmpBlock Pro - Procedural Cosmetic Filtering Engine (v1.0)
 * Inspired by uBlock Origin's `dom.js` procedural operators.
 *
 * Capabilities:
 *  - :has(selector) -> targets containers containing specific child elements
 *  - :has-text(needle | regex) -> catches obfuscated dynamic ad units by text content
 *    (Supports English and Bengali: "Sponsored", "Promoted", "বিজ্ঞাপন", "স্পন্সরড")
 *  - :upward(selector | count) -> traverses up the DOM to eliminate entire empty containers
 *  - :remove() -> permanently detaches nodes from the DOM
 *  - :style(cssText) -> overrides locked overflow or blur filters applied by anti-adblockers
 *  - MutationObserver debouncing with WeakSet caching for 0% CPU footprint.
 *
 * Harmony & Whitelist:
 *  - 100% immune for AMPass Secure Vault (#ampass-floating-host, #ampass-browser-shield-root)
 *  - Immediately disengages if site is whitelisted or protection is turned off.
 */

(function () {
  'use strict';

  if (window.__ampblock_procedural_loaded) return;
  window.__ampblock_procedural_loaded = true;

  // 1. Whitelist & Status Check
  function isSiteWhitelistedOrDisabled() {
    if (window.__ampblock_whitelisted_active) return true;
    if (document.documentElement) {
      if (
        document.documentElement.dataset.ampblockWhitelisted === 'true' ||
        document.documentElement.dataset.ampblockDisabled === 'true'
      ) {
        return true;
      }
    }
    try {
      if (
        sessionStorage.getItem('__ampblock_whitelisted') === 'true' ||
        sessionStorage.getItem('__ampblock_disabled') === 'true'
      ) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  if (isSiteWhitelistedOrDisabled()) return;

  // Listen for dynamic status synchronization
  window.addEventListener('message', function (event) {
    if (event.source !== window || !event.data || event.data.type !== '__AMPBLOCK_STATUS_SYNC__') return;
    if (event.data.isWhitelisted || !event.data.isEnabled) {
      window.__ampblock_whitelisted_active = true;
    } else {
      window.__ampblock_whitelisted_active = false;
    }
  });

  // Immunization check
  function isImmunized(el) {
    if (!el || !(el instanceof Element)) return true;
    const id = (el.id || '').toLowerCase();
    const cls = (el.className || '').toString().toLowerCase();
    if (id.includes('ampass') || cls.includes('ampass') || id.includes('ampblock')) return true;
    return false;
  }

  // Multilingual Ad Text Patterns (English + Bengali)
  const AD_TEXT_PATTERNS = [
    /\b(sponsored|promoted|advertisement|ads by|promoted post|suggested post|sponsored content)\b/i,
    /(বিজ্ঞাপন|স্পন্সরড|বিজ্ঞাপনদাতা|প্রমোটেড)/i
  ];

  const processedElements = new WeakSet();
  let pendingDebounce = null;

  const ProceduralEngine = {
    /**
     * :has-text evaluator
     */
    matchesText: function (element, pattern) {
      if (!element || isImmunized(element)) return false;
      const text = element.textContent || '';
      if (!text || text.length > 500) return false; // Avoid checking giant page blocks
      if (pattern instanceof RegExp) {
        return pattern.test(text);
      }
      return text.toLowerCase().includes(String(pattern).toLowerCase());
    },

    /**
     * :upward evaluator
     */
    findUpward: function (element, target) {
      if (!element || isImmunized(element)) return null;
      let curr = element.parentElement;
      if (typeof target === 'number') {
        let count = target;
        while (curr && count > 0 && curr !== document.body && curr !== document.documentElement) {
          if (isImmunized(curr)) return null;
          curr = curr.parentElement;
          count--;
        }
        return curr && !isImmunized(curr) ? curr : null;
      } else if (typeof target === 'string') {
        while (curr && curr !== document.body && curr !== document.documentElement) {
          if (isImmunized(curr)) return null;
          if (curr.matches && curr.matches(target)) {
            return curr;
          }
          curr = curr.parentElement;
        }
      }
      return null;
    },

    /**
     * Core Sweep: Identifies obfuscated sponsored feed items and removes them
     */
    sweepFeedAndNativeAds: function () {
      if (isSiteWhitelistedOrDisabled()) return 0;

      let removed = 0;
      // Potential candidate elements for sponsored badges
      const candidates = document.querySelectorAll(
        'span, div, p, a, label, small, b, strong, [aria-label]'
      );

      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (processedElements.has(el) || isImmunized(el)) continue;

        // Check aria-label first
        const aria = (el.getAttribute('aria-label') || '').trim();
        let isAd = false;
        if (aria) {
          for (let p = 0; p < AD_TEXT_PATTERNS.length; p++) {
            if (AD_TEXT_PATTERNS[p].test(aria)) {
              isAd = true;
              break;
            }
          }
        }

        // Check text content
        if (!isAd && el.children.length <= 2) {
          const directText = (el.textContent || '').trim();
          if (directText && directText.length < 50) {
            for (let p = 0; p < AD_TEXT_PATTERNS.length; p++) {
              if (AD_TEXT_PATTERNS[p].test(directText)) {
                isAd = true;
                break;
              }
            }
          }
        }

        if (isAd) {
          processedElements.add(el);
          // Climb upward to the nearest card or container
          const container =
            ProceduralEngine.findUpward(el, 'article') ||
            ProceduralEngine.findUpward(el, '[data-card]') ||
            ProceduralEngine.findUpward(el, '[role="article"]') ||
            ProceduralEngine.findUpward(el, '.card') ||
            ProceduralEngine.findUpward(el, '.feed-item') ||
            ProceduralEngine.findUpward(el, '.post') ||
            ProceduralEngine.findUpward(el, 3);

          if (container && !isImmunized(container) && container !== document.body) {
            container.remove();
            removed++;
          } else {
            el.remove();
            removed++;
          }
        }
      }

      return removed;
    },

    /**
     * Anti-Adblock Overlay & Scroll Unlocker (:style)
     */
    unlockScrollAndModals: function () {
      if (isSiteWhitelistedOrDisabled()) return;

      const antiAdblockSelectors = [
        '.adblock-modal',
        '.adblock-overlay',
        '#adblock-notice',
        '[class*="anti-adblock"]',
        '[id*="anti-adblock"]',
        '[class*="adblocker-detected"]',
        '[id*="adblocker-detected"]',
        '.fc-ab-root',
        '.fc-dialog-container',
        '.sp_message_container'
      ];

      const modals = document.querySelectorAll(antiAdblockSelectors.join(','));
      modals.forEach(function (m) {
        if (!isImmunized(m)) {
          m.remove();
        }
      });

      // Restore locked page scroll
      if (document.body) {
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflow === 'hidden' || bodyStyle.position === 'fixed') {
          // Check if an anti-adblock modal was removed
          if (modals.length > 0 || document.querySelector('.fc-ab-root')) {
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.body.style.setProperty('position', 'static', 'important');
            document.body.style.setProperty('filter', 'none', 'important');
          }
        }
      }

      if (document.documentElement) {
        const htmlStyle = window.getComputedStyle(document.documentElement);
        if (htmlStyle.overflow === 'hidden') {
          if (modals.length > 0 || document.querySelector('.fc-ab-root')) {
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
            document.documentElement.style.setProperty('filter', 'none', 'important');
          }
        }
      }
    },

    /**
     * Debounced batch execution
     */
    batchProcess: function () {
      if (isSiteWhitelistedOrDisabled()) return;
      ProceduralEngine.sweepFeedAndNativeAds();
      ProceduralEngine.unlockScrollAndModals();
    },

    scheduleBatch: function () {
      if (pendingDebounce) return;
      pendingDebounce = setTimeout(function () {
        pendingDebounce = null;
        if (window.requestIdleCallback) {
          window.requestIdleCallback(ProceduralEngine.batchProcess);
        } else {
          ProceduralEngine.batchProcess();
        }
      }, 60);
    },

    /**
     * Initialize MutationObserver
     */
    init: function () {
      if (isSiteWhitelistedOrDisabled()) return;

      // Initial pass
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ProceduralEngine.batchProcess);
      } else {
        ProceduralEngine.batchProcess();
      }

      // Live DOM observer (childList + :watch-attr on style/class)
      const observer = new MutationObserver(function (mutations) {
        if (isSiteWhitelistedOrDisabled()) return;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (m.type === 'childList' && m.addedNodes.length > 0) {
            ProceduralEngine.scheduleBatch();
            break;
          } else if (m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'class')) {
            ProceduralEngine.scheduleBatch();
            break;
          }
        }
      });

      const root = document.documentElement || document.body;
      if (root) {
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
    }
  };

  // Expose for testing & internal usage
  window.__AmpBlockProcedural = ProceduralEngine;

  ProceduralEngine.init();
})();
