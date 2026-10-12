/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock
 * ==============================================================================
 *
 * AmpBlock - Anti-Adblock Defuser & Scriptlet Mock Engine v2.5
 * Injects safe mock ad globals at document_start to deceive Google Ads, Bing Ads,
 * and anti-adblock detection scripts ONLY when ad blocking is active.
 *
 * If a site is whitelisted / allowed by the user, this script completely disengages
 * so genuine Google AdSense, Taboola, and partner ads execute 100% natively.
 */

(function () {
  'use strict';

  if (window.__ampblock_defuser_injected) return;
  window.__ampblock_defuser_injected = true;

  const currentHost = window.location.hostname.toLowerCase();

  // Helper: Check if site is whitelisted or protection is globally disabled
  function isSiteWhitelistedOrDisabled() {
    if (window.__ampblock_whitelisted_active) return true;
    if (document.documentElement) {
      if (document.documentElement.dataset.ampblockWhitelisted === 'true' ||
          document.documentElement.dataset.ampblockDisabled === 'true') {
        return true;
      }
    }
    try {
      if (sessionStorage.getItem('__ampblock_whitelisted') === 'true' ||
          sessionStorage.getItem('__ampblock_disabled') === 'true') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Listen for dynamic status synchronization from Isolated World
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.type !== '__AMPBLOCK_STATUS_SYNC__') return;
    if (event.data.isWhitelisted || !event.data.isEnabled) {
      window.__ampblock_whitelisted_active = true;
    } else {
      window.__ampblock_whitelisted_active = false;
    }
  });

  // If ads are allowed on this site, exit immediately so real ads render completely untouched
  if (isSiteWhitelistedOrDisabled()) {
    console.info('[AmpBlock Defuser] Site is whitelisted. Native ads allowed on:', currentHost);
    return;
  }

  // Automatic ad scanner – removes elements only if protection is strictly active
  function scanAndRemoveAds() {
    if (isSiteWhitelistedOrDisabled()) return 0;

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
      // Do not touch AMPass or AmpBlock elements
      const id = (el.id || '').toLowerCase();
      const cls = (el.className || '').toString().toLowerCase();
      if (id.includes('ampass') || cls.includes('ampass') || id.includes('ampblock')) return;

      if (!el.style.display || el.style.display !== 'none') {
        el.remove();
        removedCount++;
      }
    });

    return removedCount;
  }

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

  // Inject into DOM in MAIN world only when ad blocking is active
  const script = document.createElement('script');
  script.textContent = defuserPayload;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
