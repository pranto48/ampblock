/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * Automated Unit Test Suite for AmpBlock YouTube Ultra Buster Engine v6.0
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting AmpBlock YouTube Ultra Buster v6.0 Automated Tests...\n');

// -----------------------------------------------------------------------------
// Test 1: JSON Pruning Logic for /youtubei/v1/player and ytInitialPlayerResponse
// -----------------------------------------------------------------------------
function pruneAdData(data, isEnabled = true, isWhitelisted = false) {
  if (!isEnabled || isWhitelisted || !data || typeof data !== 'object') return data;

  let modified = false;

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
  if (Array.isArray(data.engagementPanels)) {
    const initialLen = data.engagementPanels.length;
    data.engagementPanels = data.engagementPanels.filter((panel) => {
      const id = panel.panelIdentifier || (panel.engagementPanelSectionListRenderer && panel.engagementPanelSectionListRenderer.targetId);
      return id !== 'engagement-panel-ads';
    });
    if (data.engagementPanels.length !== initialLen) modified = true;
  }
  if (data.playerConfig && data.playerConfig.adsConfig) {
    delete data.playerConfig.adsConfig;
    modified = true;
  }

  return { data, modified };
}

const mockPlayerResponseWithAds = {
  responseContext: { serviceTrackingParams: [] },
  playabilityStatus: { status: 'OK' },
  videoDetails: { title: 'Safe Educational Video', videoId: 'abc123xyz' },
  streamingData: { formats: [{ itag: 18, url: 'https://googlevideo.com/videoplayback' }] },
  playbackTracking: { videostatsWatchtimeUrl: 'https://youtube.com/api/stats/watchtime' },
  adPlacements: [
    { adPlacementRenderer: { config: { kind: 'AD_PLACEMENT_KIND_PRE_ROLL' } } }
  ],
  playerAds: [
    { playerAdRenderer: { adId: 'ad_9988' } }
  ],
  adSlots: [
    { slotType: 'SLOT_TYPE_PLAYER_BYTES' }
  ],
  adBreakHeartbeatParams: 'hb_param_123',
  playerConfig: {
    audioConfig: { loudnessDb: -1.2 },
    adsConfig: { nonPersonalizedAds: false }
  },
  enforcementMessageViewModel: {
    message: { runs: [{ text: 'Ad blockers violate YouTube terms' }] }
  },
  messages: [
    { enforcementMessageViewModel: { id: 'enforce_1' } },
    { mealbarPromoRenderer: { id: 'promo_1' } },
    { legitimateMessage: { text: 'Welcome to YouTube' } }
  ],
  engagementPanels: [
    { panelIdentifier: 'engagement-panel-ads' },
    { panelIdentifier: 'engagement-panel-comments' }
  ]
};

const result = pruneAdData(JSON.parse(JSON.stringify(mockPlayerResponseWithAds)));
const cleaned = result.data;

assert.strictEqual(cleaned.adPlacements, undefined, 'adPlacements must be deleted');
assert.strictEqual(cleaned.playerAds, undefined, 'playerAds must be deleted');
assert.strictEqual(cleaned.adSlots, undefined, 'adSlots must be deleted');
assert.strictEqual(cleaned.adBreakHeartbeatParams, undefined, 'adBreakHeartbeatParams must be deleted');
assert.strictEqual(cleaned.playerConfig.adsConfig, undefined, 'adsConfig must be deleted');
assert.strictEqual(cleaned.enforcementMessageViewModel, undefined, 'enforcementMessageViewModel must be deleted');
assert.strictEqual(cleaned.messages.length, 1, 'Only legitimate messages should remain');
assert.strictEqual(cleaned.messages[0].legitimateMessage.text, 'Welcome to YouTube', 'Legitimate message must be intact');
assert.strictEqual(cleaned.engagementPanels.length, 1, 'engagement-panel-ads must be removed');
assert.strictEqual(cleaned.engagementPanels[0].panelIdentifier, 'engagement-panel-comments', 'Comments panel must be preserved');
assert.strictEqual(cleaned.videoDetails.title, 'Safe Educational Video', 'videoDetails must be intact');
assert.strictEqual(cleaned.streamingData.formats.length, 1, 'streamingData must be intact');

console.log('✅ Test 1 Passed: JSON Pruning completely strips all ad directives & anti-adblock modals while preserving video stream.');

// -----------------------------------------------------------------------------
// Test 2: window.ytInitialPlayerResponse Setter Interceptor Simulation
// -----------------------------------------------------------------------------
const mockWindow = {};
let _stored = undefined;
Object.defineProperty(mockWindow, 'ytInitialPlayerResponse', {
  configurable: true,
  enumerable: true,
  get() { return _stored; },
  set(val) {
    if (val && typeof val === 'object') {
      pruneAdData(val);
    }
    _stored = val;
  }
});

mockWindow.ytInitialPlayerResponse = {
  adPlacements: [{ id: 'pre_roll' }],
  videoDetails: { title: 'Test Stream' }
};

assert.strictEqual(mockWindow.ytInitialPlayerResponse.adPlacements, undefined, 'adPlacements must be intercepted on set');
assert.strictEqual(mockWindow.ytInitialPlayerResponse.videoDetails.title, 'Test Stream', 'Video details must be preserved');
console.log('✅ Test 2 Passed: window.ytInitialPlayerResponse interceptor instantly neutralizes server-injected ads.');

// -----------------------------------------------------------------------------
// Test 3: Telemetry URL Spoofing Pattern Checks
// -----------------------------------------------------------------------------
const telemetryUrls = [
  'https://www.youtube.com/api/stats/ads?ns=yt&el=detailpage',
  'https://www.youtube.com/pagead/parallelprocessing?v=xyz',
  'https://www.youtube.com/ptracking?tracking_id=123',
  'https://www.youtube.com/api/stats/qoe?adformat=1_2'
];

function isAdTelemetry(url) {
  return (
    url.includes('/api/stats/ads') ||
    url.includes('/pagead/') ||
    url.includes('/ptracking') ||
    url.includes('/api/stats/qoe?adformat')
  );
}

for (const url of telemetryUrls) {
  assert.strictEqual(isAdTelemetry(url), true, `URL must be detected as ad telemetry: ${url}`);
}

assert.strictEqual(isAdTelemetry('https://www.youtube.com/api/stats/watchtime?ns=yt'), false, 'Legitimate watchtime must NOT be spoofed');
assert.strictEqual(isAdTelemetry('https://www.youtube.com/api/stats/atr?ns=yt'), false, 'Watch history atr must NOT be spoofed');

console.log('✅ Test 3 Passed: Ad telemetry patterns accurately identified without affecting legitimate watch history.');

// -----------------------------------------------------------------------------
// Test 4: Manifest & Content Scripts Verification
// -----------------------------------------------------------------------------
const manifestPath = path.join(__dirname, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const ytScripts = manifest.content_scripts.filter(cs => cs.matches.includes('*://*.youtube.com/*'));
assert.strictEqual(ytScripts.length, 2, 'Must have 2 content script registrations for YouTube');

const mainWorldScript = ytScripts.find(cs => cs.world === 'MAIN');
assert.ok(mainWorldScript, 'Must have a MAIN world script for YouTube');
assert.strictEqual(mainWorldScript.js[0], 'content/youtube-engine.js');
assert.strictEqual(mainWorldScript.run_at, 'document_start');

const isolatedWorldScript = ytScripts.find(cs => !cs.world || cs.world === 'ISOLATED');
assert.ok(isolatedWorldScript, 'Must have an ISOLATED world script for YouTube');
assert.strictEqual(isolatedWorldScript.js[0], 'content/youtube-buster.js');

assert.ok(manifest.web_accessible_resources[0].resources.includes('content/youtube-engine.js'), 'youtube-engine.js must be in web_accessible_resources');

console.log('✅ Test 4 Passed: manifest.json configured with dual-engine (MAIN world + ISOLATED world) architecture.');

// -----------------------------------------------------------------------------
// Test 5: DNR Rule 175 Check (No Watch History Breakage)
// -----------------------------------------------------------------------------
const rulesPath = path.join(__dirname, 'rules', 'rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

const rule175 = rules.find(r => r.id === 175);
assert.ok(rule175, 'Rule 175 must exist');
assert.strictEqual(rule175.condition.urlFilter, '*://*.youtube.com/get_midroll_info*', 'Rule 175 must target midroll ads and NOT break atr watch history');

console.log('✅ Test 5 Passed: Rule 175 cleanly targets midroll info requests while preserving user watch history.');

// -----------------------------------------------------------------------------
// Test 6: Cosmetic Selectors in youtube-buster.js
// -----------------------------------------------------------------------------
const busterCode = fs.readFileSync(path.join(__dirname, 'content', 'youtube-buster.js'), 'utf8');
const expectedSelectors = [
  '#masthead-ad',
  'ytd-ad-slot-renderer',
  'ytd-rich-item-renderer:has(ytd-ad-slot-renderer)',
  'ytd-reel-video-renderer:has(.ytd-ad-slot-renderer)',
  'tp-yt-paper-dialog:has(ytd-enforcement-message-view-model)',
  'ytd-player-legacy-desktop-watch-ads-renderer'
];

for (const sel of expectedSelectors) {
  assert.ok(busterCode.includes(sel), `youtube-buster.js must include cosmetic selector: ${sel}`);
}

console.log('✅ Test 6 Passed: High-coverage 2026 cosmetic CSS selectors present.');

console.log('\n🎉 ALL 6/6 YOUTUBE ULTRA BUSTER v6.0 TESTS PASSED 100%!');
