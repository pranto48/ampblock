/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * AmpBlock - YouTube Ultra Buster Engine v6.0 (Main World Context)
 *
 * Architecture:
 * 1. Pre-emptive JSON Pruning: Intercepts ytInitialPlayerResponse & /youtubei/v1/player
 *    to strip all adPlacements, playerAds, adSlots, and adBreakHeartbeatParams.
 *    YouTube player believes the video has ZERO ads and starts video instantaneously!
 * 2. Network Telemetry Spoofing: Hooks fetch and XMLHttpRequest to return synthetic
 *    204 No Content for stats/ads, pagead, and ptracking, neutralizing anti-adblock alarms.
 * 3. Native Player API Dispatches: Directly triggers movie_player.skipAd() and movie_player.cancelPlayback().
 * 4. Microsecond Audio Suppression & Keyframe Fast-Forward for any SSAI stream fallbacks.
 * 5. Anti-Adblock Enforcement Modal Auto-Terminator & Instant Playback Resumer.
 */

(function () {
  'use strict';

  if (window.__ampblock_yt_engine_v6_active) return;
  window.__ampblock_yt_engine_v6_active = true;

  let isEnabled = true;
  let isWhitelisted = false;
  let wasMutedByAdblock = false;
  let previousVolume = 1;
  let originalPlaybackRate = 1;

  // Check state stored in sessionStorage by Isolated World or DOM dataset
  function checkDomState() {
    if (document.documentElement) {
      if (document.documentElement.dataset.ampblockDisabled === 'true') {
        isEnabled = false;
      }
      if (document.documentElement.dataset.ampblockWhitelisted === 'true') {
        isWhitelisted = true;
      }
    }
    try {
      const storedDisabled = sessionStorage.getItem('__ampblock_disabled');
      const storedWhitelisted = sessionStorage.getItem('__ampblock_whitelisted');
      if (storedDisabled === 'true') isEnabled = false;
      if (storedWhitelisted === 'true') isWhitelisted = true;
    } catch (e) {}
  }

  checkDomState();

  // Listen for state sync updates from Isolated World
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;
    if (event.data.type === '__AMPBLOCK_STATUS_SYNC__') {
      isEnabled = event.data.isEnabled !== false;
      isWhitelisted = event.data.isWhitelisted === true;
    }
  });

  // Report blocked ad event to Isolated World for badge and statistics counter
  function notifyBlocked(count = 1) {
    window.postMessage({
      type: '__AMPBLOCK_YT_BLOCKED__',
      count: count
    }, '*');
  }

  // ---------------------------------------------------------------------------
  // 1. JSON Pruner: Strips ad placements from YouTube Player API responses
  // ---------------------------------------------------------------------------
  function pruneAdData(data) {
    if (!isEnabled || isWhitelisted || !data || typeof data !== 'object') return data;

    let modified = false;

    // Prune ad placements and player ads
    if (data.adPlacements) {
      delete data.adPlacements;
      modified = true;
    }
    if (data.playerAds) {
      delete data.playerAds;
      modified = true;
    }
    if (data.adSlots) {
      delete data.adSlots;
      modified = true;
    }
    if (data.adBreakHeartbeatParams) {
      delete data.adBreakHeartbeatParams;
      modified = true;
    }
    if (data.adBreakResponse) {
      delete data.adBreakResponse;
      modified = true;
    }

    // Strip anti-adblock enforcement dialogs from server response
    if (data.enforcementMessageViewModel) {
      delete data.enforcementMessageViewModel;
      modified = true;
    }
    if (Array.isArray(data.messages)) {
      data.messages = data.messages.filter((msg) => {
        return !msg.enforcementMessageViewModel &&
               !msg.mealbarPromoRenderer &&
               !(msg.messageRenderer && JSON.stringify(msg.messageRenderer).toLowerCase().includes('ad block'));
      });
      modified = true;
    }

    // Prune sidebar/feed ads from /youtubei/v1/next
    if (Array.isArray(data.engagementPanels)) {
      const initialLen = data.engagementPanels.length;
      data.engagementPanels = data.engagementPanels.filter((panel) => {
        const id = panel.panelIdentifier || (panel.engagementPanelSectionListRenderer && panel.engagementPanelSectionListRenderer.targetId);
        return id !== 'engagement-panel-ads';
      });
      if (data.engagementPanels.length !== initialLen) modified = true;
    }

    // Disable SSAI and ad player configs
    if (data.playerConfig && data.playerConfig.adsConfig) {
      delete data.playerConfig.adsConfig;
      modified = true;
    }

    if (modified) {
      notifyBlocked(1);
    }

    return data;
  }

  // ---------------------------------------------------------------------------
  // 2. Intercept window.ytInitialPlayerResponse before player script evaluates
  // ---------------------------------------------------------------------------
  let _rawPlayerResponse = window.ytInitialPlayerResponse;

  if (_rawPlayerResponse) {
    pruneAdData(_rawPlayerResponse);
  }

  try {
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
      configurable: true,
      enumerable: true,
      get() {
        return _rawPlayerResponse;
      },
      set(newVal) {
        if (newVal && typeof newVal === 'object') {
          pruneAdData(newVal);
        }
        _rawPlayerResponse = newVal;
      }
    });
  } catch (e) {}

  // ---------------------------------------------------------------------------
  // 3. Patch ytcfg Experiment Flags to suppress ad injection & reporting
  // ---------------------------------------------------------------------------
  function patchYtcfg() {
    try {
      if (window.ytcfg && typeof window.ytcfg.get === 'function') {
        const flags = window.ytcfg.get('EXPERIMENT_FLAGS');
        if (flags) {
          flags.html5_enable_ssap_ad_formats = false;
          flags.web_enable_ab_reporting = false;
          flags.ad_pod_disable_all_dynamic_ad_insertion = true;
          flags.disable_ad_frequency_cap = false;
        }
      }
    } catch (e) {}
  }

  patchYtcfg();

  // ---------------------------------------------------------------------------
  // 4. Hook Fetch & XMLHttpRequest (Zero-Latency Ad Pruning & Telemetry Spoofing)
  // ---------------------------------------------------------------------------
  const originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = async function (...args) {
      checkDomState();
      if (!isEnabled || isWhitelisted) {
        return originalFetch.apply(this, args);
      }

      const input = args[0];
      const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

      // A. Intercept ad telemetry pings and respond with synthetic 204 No Content
      // This prevents YouTube from triggering anti-adblock detection on failed requests!
      if (
        url.includes('/api/stats/ads') ||
        url.includes('/pagead/') ||
        url.includes('/ptracking') ||
        url.includes('/api/stats/qoe?adformat')
      ) {
        notifyBlocked(1);
        return new Response('', {
          status: 204,
          statusText: 'No Content',
          headers: new Headers({ 'content-type': 'text/plain' })
        });
      }

      // B. Intercept YouTube Player and Navigation responses
      if (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next')) {
        const response = await originalFetch.apply(this, args);
        try {
          const clone = response.clone();
          const text = await clone.text();
          const data = JSON.parse(text);
          pruneAdData(data);
          const modifiedJson = JSON.stringify(data);

          return new Response(modifiedJson, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (err) {
          return response;
        }
      }

      return originalFetch.apply(this, args);
    };
  }

  // Hook XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._ampblock_req_url = typeof url === 'string' ? url : '';
    return origOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    checkDomState();
    if (isEnabled && !isWhitelisted && this._ampblock_req_url) {
      const url = this._ampblock_req_url;

      // Telemetry spoofing
      if (
        url.includes('/api/stats/ads') ||
        url.includes('/pagead/') ||
        url.includes('/ptracking') ||
        url.includes('/api/stats/qoe?adformat')
      ) {
        notifyBlocked(1);
        try {
          Object.defineProperty(this, 'status', { value: 204, writable: false });
          Object.defineProperty(this, 'statusText', { value: 'No Content', writable: false });
          Object.defineProperty(this, 'responseText', { value: '', writable: false });
          Object.defineProperty(this, 'readyState', { value: 4, writable: false });
          setTimeout(() => {
            if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
            if (typeof this.onload === 'function') this.onload();
          }, 0);
          return;
        } catch (e) {}
      }

      // Player API JSON pruning
      if (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next')) {
        this.addEventListener('readystatechange', () => {
          if (this.readyState === 4 && this.status === 200) {
            try {
              const data = JSON.parse(this.responseText);
              pruneAdData(data);
              const modified = JSON.stringify(data);
              Object.defineProperty(this, 'responseText', { value: modified, writable: false });
              Object.defineProperty(this, 'response', { value: modified, writable: false });
            } catch (e) {}
          }
        });
      }
    }

    return origSend.apply(this, args);
  };

  // ---------------------------------------------------------------------------
  // 5. Native Movie Player API & Microsecond Fallback Stream Fast-Forwarder
  // ---------------------------------------------------------------------------
  const modernSkipSelectors = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-skip-ad-button',
    '.ytp-ad-skip-button-slot',
    'button.ytp-ad-skip-button-text',
    'button[id^="skip-button"]',
    '.ytp-ad-overlay-close-button',
    '.ytp-ad-message-container button',
    '[class*="ytp-ad-skip"]',
    'button[aria-label*="Skip" i]'
  ];

  function processVideoAd() {
    checkDomState();
    if (!isEnabled || isWhitelisted) return;

    const moviePlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    const videos = document.querySelectorAll('video');

    if (!moviePlayer || videos.length === 0) return;

    // Detect active ad through CSS classes, player overlay, and native player state
    const hasAdClass = moviePlayer.classList.contains('ad-showing') ||
                       moviePlayer.classList.contains('ad-interrupting');
    const hasAdOverlay = Boolean(document.querySelector('.ytp-ad-player-overlay')) ||
                         Boolean(document.querySelector('.video-ads.ytp-ad-module:not(:empty)')) ||
                         Boolean(document.querySelector('.ytp-ad-preview-container')) ||
                         Boolean(document.querySelector('.ytp-ad-persistent-progress-bar-container'));

    let isNativeAdActive = false;
    try {
      if (typeof moviePlayer.getAdState === 'function') {
        const state = moviePlayer.getAdState();
        isNativeAdActive = (state === 1 || state === 2);
      }
    } catch (e) {}

    const isAdActive = hasAdClass || hasAdOverlay || isNativeAdActive;

    if (isAdActive) {
      videos.forEach((video) => {
        // 1. Instant Audio Cloaking (Mute promotional audio blast)
        if (!video.muted) {
          video.muted = true;
          wasMutedByAdblock = true;
        }

        // 2. Microsecond Keyframe Fast-Forward (Jump to terminal keyframe)
        try {
          if (video.playbackRate < 16) {
            originalPlaybackRate = video.playbackRate;
            video.playbackRate = 16.0;
          }
          if (isFinite(video.duration) && video.duration > 0) {
            video.currentTime = video.duration - 0.01;
          }
        } catch (e) {}
      });

      // 3. Dispatch Native Player skipAd API in MAIN world
      try {
        if (typeof moviePlayer.skipAd === 'function') {
          moviePlayer.skipAd();
        }
        if (typeof moviePlayer.cancelPlayback === 'function') {
          moviePlayer.cancelPlayback();
        }
      } catch (e) {}

      // 4. Click all synthetic Skip Buttons
      const buttons = document.querySelectorAll(modernSkipSelectors.join(', '));
      buttons.forEach((btn) => {
        if (btn && typeof btn.click === 'function') {
          btn.click();
        }
      });

      notifyBlocked(1);
    } else {
      // Normal video restored: reset volume & standard playback speed
      if (wasMutedByAdblock) {
        videos.forEach((video) => {
          video.muted = false;
          if (video.playbackRate === 16.0) {
            video.playbackRate = originalPlaybackRate || 1.0;
          }
        });
        wasMutedByAdblock = false;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Anti-Adblock Enforcement Modal Auto-Terminator & Instant Playback Resumer
  // ---------------------------------------------------------------------------
  function annihilateEnforcementModals() {
    checkDomState();
    if (!isEnabled || isWhitelisted) return;

    // A. Terminate specific YouTube enforcement modal
    const enforcement = document.querySelector('ytd-enforcement-message-view-model');
    if (enforcement) {
      const dialog = enforcement.closest('tp-yt-paper-dialog') || enforcement;
      dialog.remove();

      // Clear dark backdrops
      document.querySelectorAll('tp-yt-iron-overlay-backdrop').forEach(el => el.remove());

      // Re-enable page scrolling
      if (document.documentElement) document.documentElement.style.overflow = 'auto';
      if (document.body) document.body.style.overflow = 'auto';

      // Resume video
      const videos = document.querySelectorAll('video');
      videos.forEach((v) => {
        if (v.paused) v.play().catch(() => {});
      });

      notifyBlocked(1);
    }

    // B. Generic promotional and terms modals
    const dialogs = document.querySelectorAll('tp-yt-paper-dialog, ytd-mealbar-promo-renderer');
    dialogs.forEach((dlg) => {
      const txt = (dlg.textContent || '').toLowerCase();
      if (txt.includes('ad blocker') || txt.includes('terms of service') || txt.includes('allow ads')) {
        dlg.remove();
        document.querySelectorAll('tp-yt-iron-overlay-backdrop').forEach(el => el.remove());
        if (document.documentElement) document.documentElement.style.overflow = 'auto';
        if (document.body) document.body.style.overflow = 'auto';

        const video = document.querySelector('video');
        if (video && video.paused) video.play().catch(() => {});
        notifyBlocked(1);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Event-Driven + Micro-Loop Engine
  // ---------------------------------------------------------------------------
  function startEngine() {
    // 1. Hook video element events directly
    document.addEventListener('play', (e) => {
      if (e.target && e.target.tagName === 'VIDEO') {
        processVideoAd();
        annihilateEnforcementModals();
      }
    }, true);

    document.addEventListener('timeupdate', (e) => {
      if (e.target && e.target.tagName === 'VIDEO') {
        const moviePlayer = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
        if (moviePlayer && (moviePlayer.classList.contains('ad-showing') || moviePlayer.classList.contains('ad-interrupting'))) {
          processVideoAd();
        }
      }
    }, true);

    // 2. High-performance observer on player container
    const observer = new MutationObserver(() => {
      processVideoAd();
      annihilateEnforcementModals();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'src']
    });

    // 3. Fast backup heartbeat (50ms interval)
    setInterval(() => {
      processVideoAd();
      annihilateEnforcementModals();
      patchYtcfg();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startEngine, { once: true });
  } else {
    startEngine();
  }
})();
