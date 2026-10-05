/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock
 * ==============================================================================
 *
 * AmpBlock - Anti-Adblock Defuser & Scriptlet Mock Engine v2.0
 * Injects safe mock ad globals at document_start to deceive Google Ads, Bing Ads,
 * and anti-adblock detection scripts.
 */

(function () {
  'use strict';
  // ---------------------------------------------------------------------
  // Automatic ad scanner – removes any element that looks like an ad.
  // This is a lightweight fallback for sites where the generic selectors
  // miss some newer ad containers. It runs once on page load and reports
  // the number of elements removed to the background script.
  function scanAndRemoveAds() {
    const adSelectors = [
      'iframe[src*="ad"]',
      'iframe[src*="ads"]',
      '[class*="ad"]',
      '[id*="ad"]',
      '[class*="banner"]',
      '[id*="banner"]',
      '[class*="sponsor"]',
      '[data-ad]',
    ];

    const nodes = document.querySelectorAll(adSelectors.join(','));
    let removedCount = 0;
    nodes.forEach((el) => {
      if (!el.style.display || el.style.display !== 'none') {
        el.remove();
        removedCount++;
      }
    });

    // Report to background
    try {
      chrome.runtime.sendMessage({ action: 'adScanReport', count: removedCount }, () => {});
    } catch (e) {}
    return removedCount;
  }

  if (window.__ampblock_defuser_injected) return;
  window.__ampblock_defuser_injected = true;

  // Code to run inside page's main context
  const defuserPayload = `
    try {
      // 1. Universal Ad Run Status
      window.canRunAds = true;
      window.isAdBlockActive = false;
      window.adBlockDetected = false;
      window.__adblock_detected = false;

      // 2. Google AdSense & Ad Manager Mocks
      window.google_ad_client = 'ca-pub-9999999999999999';
      window.google_ad_slot = '9999999999';
      window.google_ad_status = 1;

      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      window.adsbygoogle.loaded = true;
      const origPush = window.adsbygoogle.push;
      window.adsbygoogle.push = function(arg) {
        if (typeof origPush === 'function') {
          try { origPush.call(this, arg); } catch(e) {}
        }
        return 1;
      };

      // 3. Bing / Microsoft Ads UET Tracker Mock
      if (!window.uetq) {
        window.uetq = [];
      }
      window.uetq.push = function() { return 1; };

      // 4. Taboola & Outbrain Mocks
      if (!window._taboola) window._taboola = [];
      window._taboola.push = function() { return 1; };

      // 5. Anti-Adblock Detection Frameworks Mock (FuckAdBlock, BlockAdBlock, etc.)
      window.fuckAdBlock = {
        check: function() { return false; },
        on: function(isAdblock, callback) {
          if (!isAdblock && typeof callback === 'function') callback();
          return this;
        },
        onDetected: function() { return this; },
        onNotDetected: function(callback) {
          if (typeof callback === 'function') callback();
          return this;
        }
      };
      window.blockAdBlock = window.fuckAdBlock;
      window.SnackAdBlock = window.fuckAdBlock;
    } catch(e) {}
  `;

  // Inject into DOM in MAIN world
  const script = document.createElement('script');
  script.textContent = defuserPayload;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
