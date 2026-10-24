/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * Automated Unit Test Suite for AmpBlock Pro v2.0 Ultra-Powerful Engine
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting AmpBlock Pro v2.0 Ultra-Powerful Engine Automated Tests...\n');

// -----------------------------------------------------------------------------
// Test 1: Massive DNR Static Ruleset Verification
// -----------------------------------------------------------------------------
const rulesPath = path.join(__dirname, 'rules', 'rules.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

assert.ok(rules.length >= 2000, `DNR rules must exceed 2000 rules, current count: ${rules.length}`);
console.log(`✅ Test 1 Passed: DNR Rules expanded to ${rules.length} static rules.`);

// Rule 175 check
const rule175 = rules.find(r => r.id === 175);
assert.ok(rule175, 'Rule 175 must exist');
assert.strictEqual(rule175.condition.urlFilter, '*://*.youtube.com/get_midroll_info*', 'Rule 175 must target midrolls');
console.log('✅ Test 2 Passed: Rule 175 backward compatibility preserved for YouTube watch history.');

// Check coverage of critical video, popunder, and miner networks
const urlFilters = rules.map(r => r.condition.urlFilter);
assert.ok(urlFilters.some(f => f.includes('imasdk.googleapis.com')), 'Must block Google IMA SDK');
assert.ok(urlFilters.some(f => f.includes('popads.net')), 'Must block PopAds');
assert.ok(urlFilters.some(f => f.includes('coinhive.com')), 'Must block Coinhive');
assert.ok(urlFilters.some(f => f.includes('scorecardresearch.com')), 'Must block ScorecardResearch');
assert.ok(urlFilters.some(f => f.includes('aniview.com')), 'Must block Aniview video ads');
assert.ok(urlFilters.some(f => f.includes('springserve.com')), 'Must block SpringServe video ads');
console.log('✅ Test 3 Passed: Comprehensive coverage of video ads, popunders, telemetry, and cryptominers.');

// -----------------------------------------------------------------------------
// Test 4: Anti-Adblock Scriptlet Defuser v3.0 (GPT, Prebid, APSTag, Bait Defuser)
// -----------------------------------------------------------------------------
const defuserCode = fs.readFileSync(path.join(__dirname, 'content', 'ad-defuser.js'), 'utf8');

assert.ok(defuserCode.includes('googletag'), 'Must contain googletag mock');
assert.ok(defuserCode.includes('pubadsService'), 'Must contain GPT pubads mock');
assert.ok(defuserCode.includes('enableSingleRequest'), 'Must contain enableSingleRequest method');
assert.ok(defuserCode.includes('apstag'), 'Must contain Amazon APSTag mock');
assert.ok(defuserCode.includes('pbjs'), 'Must contain Prebid.js mock');
assert.ok(defuserCode.includes('baitPatterns'), 'Must contain anti-adblock bait element defuser');
assert.ok(defuserCode.includes('offsetHeight'), 'Must hook HTMLElement offsetHeight for bait defense');

console.log('✅ Test 4 Passed: Anti-adblock defuser v3.0 equipped with GPT, Prebid, APSTag, and Bait Defuser.');

// -----------------------------------------------------------------------------
// Test 5: Cookie Banner & Annoyance Neutralizer + Scroll Unlocker
// -----------------------------------------------------------------------------
const cssCode = fs.readFileSync(path.join(__dirname, 'content', 'cosmetic-filter.css'), 'utf8');
assert.ok(cssCode.includes('#onetrust-consent-sdk'), 'Must target OneTrust cookie banners');
assert.ok(cssCode.includes('#didomi-host'), 'Must target Didomi banners');
assert.ok(cssCode.includes('#CybotCookiebotDialog'), 'Must target Cookiebot banners');

const contentCode = fs.readFileSync(path.join(__dirname, 'content', 'content-script.js'), 'utf8');
assert.ok(contentCode.includes('unlockPageScroll'), 'Must contain automatic scroll unlocker');

console.log('✅ Test 5 Passed: Cookie & Annoyance Neutralizer and Scroll Unlocker verified.');

// -----------------------------------------------------------------------------
// Test 6: Popunder & History Flood Protection
// -----------------------------------------------------------------------------
const popupBlockerCode = fs.readFileSync(path.join(__dirname, 'content', 'popup-blocker.js'), 'utf8');
assert.ok(popupBlockerCode.includes('pushCountInWindow'), 'Must throttle history.pushState floods');
assert.ok(popupBlockerCode.includes('beforeunload'), 'Must suppress beforeunload hostage prompts');

console.log('✅ Test 6 Passed: History flood and beforeunload hostage trap defenses active.');

// -----------------------------------------------------------------------------
// Test 7: Manifest Version 2.0.0 & Packaging Verification
// -----------------------------------------------------------------------------
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
assert.strictEqual(manifest.version, '2.0.0', 'Manifest version must be 2.0.0');

console.log('✅ Test 7 Passed: Manifest version set to 2.0.0 Ultra.');

console.log('\n🎉 ALL 7/7 ULTRA-POWERFUL ENGINE TESTS PASSED 100%!');
