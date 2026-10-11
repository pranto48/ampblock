/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * AmpBlock - YouTube Ultra Buster Engine v6.0 (Isolated World Context)
 *
 * Responsibilities:
 * 1. Cosmetic Ad Shielding: Injects high-performance CSS at document_start to
 *    collapse banners, feeds, reels, shorts, promoted sparkles, and enforcement dialogs.
 * 2. Main World Injector Guard: Ensures youtube-engine.js is loaded in the DOM.
 * 3. Message Bridge: Relays blocked ad metrics from Main World to Background Service Worker.
 * 4. Whitelist & Toggle Synchronization with Extension Popup & Options Dashboard.
 */

(function () {
  'use strict';

  if (window.__ampblock_yt_v6_injected) return;
  window.__ampblock_yt_v6_injected = true;

  let isEnabled = true;
  let isWhitelisted = false;
  let ytBlockedAdsCount = 0;

  // Comprehensive cosmetic selectors for YouTube 2026 desktop and mobile UI
  const ytAdSelectors = [
    '#masthead-ad',
    'ytd-masthead-ad-renderer',
    'ytd-masthead-ad-v3-renderer',
    'ytd-ad-slot-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)',
    'ytd-rich-item-renderer:has(ytd-in-feed-ad-layout-renderer)',
    'ytd-rich-item-renderer:has(#ad-badge)',
    'ytd-rich-item-renderer:has(.badge-shape-wiz--ad)',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-promoted-sparkles-text-search-renderer',
    'ytd-promoted-video-renderer',
    'ytd-display-ad-renderer',
    'ytd-companion-slot-renderer',
    'ytd-statement-banner-renderer',
    'ytd-banner-promo-renderer',
    'ytd-action-companion-ad-renderer',
    'ytd-reel-video-renderer:has(.ytd-ad-slot-renderer)',
    'ytd-reel-video-renderer:has([aria-label*="Sponsored" i])',
    'ytd-reel-video-renderer:has(.badge-shape-wiz--ad)',
    'ytd-player-legacy-desktop-watch-ads-renderer',
    'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
    '#player-ads',
    '.ytp-ad-overlay-container',
    '.ytp-ad-overlay-slot',
    '.ytp-ad-message-container',
    '.ytp-ad-action-interstitial',
    '.ytp-ad-preview-container',
    '.ytp-ad-persistent-progress-bar-container',
    '.ytp-ad-progress',
    '#rendering-content:has(ytd-ad-slot-renderer)',
    '.ytp-suggested-action-badge[data-ad]',
    'ytd-mealbar-promo-renderer',
    'ytd-merch-shelf-renderer',
    'ytd-brand-video-singleton-renderer',
    'ytd-search-pyv-renderer',
    'tp-yt-paper-dialog:has(ytd-enforcement-message-view-model)',
    'tp-yt-paper-dialog:has(#feedback)',
    '#dialog.yt-mealbar-promo-renderer',
    'ytd-popup-container:has(ytd-enforcement-message-view-model)',
    '#main-container:has(ytd-enforcement-message-view-model)'
  ];

  // Inject CSS rules immediately for YouTube banners and enforcement modals
  function injectYouTubeCSS() {
    const styleId = 'ampblock-yt-style-v6';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ${ytAdSelectors.join(',\n      ')} {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        max-height: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }
      ytd-enforcement-message-view-model,
      tp-yt-paper-dialog:has(ytd-enforcement-message-view-model),
      tp-yt-paper-dialog:has(#feedback),
      #dialog.yt-mealbar-promo-renderer,
      .ytp-ad-overlay-slot {
        display: none !important;
        visibility: hidden !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeYouTubeCSS() {
    const style = document.getElementById('ampblock-yt-style-v6');
    if (style) style.remove();
  }

  // Ensure Main World engine is injected into the DOM
  function ensureMainWorldEngine() {
    if (document.getElementById('ampblock-yt-engine-script')) return;

    try {
      const script = document.createElement('script');
      script.id = 'ampblock-yt-engine-script';
      script.src = chrome.runtime.getURL('content/youtube-engine.js');
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {}
  }

  // Report block metric to Service Worker
  function reportBlock(count = 1) {
    ytBlockedAdsCount += count;
    chrome.runtime.sendMessage({
      action: 'reportBlockedAds',
      domain: window.location.hostname,
      increment: count,
      totalOnTab: ytBlockedAdsCount
    }).catch(() => {});
  }

  // Listen for block notifications from youtube-engine.js (Main World)
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;
    if (event.data.type === '__AMPBLOCK_YT_BLOCKED__') {
      const count = Number(event.data.count) || 1;
      reportBlock(count);
    }
  });

  // Query background for site status and configure
  function init() {
    chrome.runtime.sendMessage(
      { action: 'getSiteStatus', domain: window.location.hostname },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          injectYouTubeCSS();
          ensureMainWorldEngine();
          return;
        }
        isEnabled = response.enabled;
        isWhitelisted = response.isWhitelisted;

        if (isEnabled && !isWhitelisted) {
          injectYouTubeCSS();
          ensureMainWorldEngine();
        } else {
          removeYouTubeCSS();
        }
      }
    );
  }

  // Listen for message from popup & options
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'statusChanged') {
      isEnabled = msg.enabled;
      isWhitelisted = msg.isWhitelisted;
      if (isEnabled && !isWhitelisted) {
        injectYouTubeCSS();
        ensureMainWorldEngine();
      } else {
        removeYouTubeCSS();
      }
      sendResponse({ success: true, count: ytBlockedAdsCount });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
