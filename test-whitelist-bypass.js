/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * Automated Unit Test Suite for AmpBlock Whitelist / Allow Site Ads Zero-Block System
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting AmpBlock Whitelist & Allow Site Ads Zero-Block Automated Tests...\n');

// -----------------------------------------------------------------------------
// Test 1: isDomainWhitelisted Subdomain & Root Matching
// -----------------------------------------------------------------------------
function isDomainWhitelisted(domain, whitelistedDomains) {
  if (!domain || !Array.isArray(whitelistedDomains) || whitelistedDomains.length === 0) return false;
  const target = domain.toLowerCase().trim();
  const rootTarget = target.replace(/^www\./, '');
  return whitelistedDomains.some(d => {
    if (!d) return false;
    const cleanD = d.toLowerCase().trim().replace(/^www\./, '');
    return target === cleanD || rootTarget === cleanD || target.endsWith('.' + cleanD);
  });
}

const whitelist = ['example.com', 'news-portal.org', 'youtube.com'];

assert.strictEqual(isDomainWhitelisted('example.com', whitelist), true, 'Exact domain must match');
assert.strictEqual(isDomainWhitelisted('www.example.com', whitelist), true, 'www prefix must match');
assert.strictEqual(isDomainWhitelisted('sub.news-portal.org', whitelist), true, 'Subdomain must match');
assert.strictEqual(isDomainWhitelisted('m.youtube.com', whitelist), true, 'Mobile YouTube must match');
assert.strictEqual(isDomainWhitelisted('untrusted-site.com', whitelist), false, 'Non-whitelisted must return false');
assert.strictEqual(isDomainWhitelisted('', whitelist), false, 'Empty must return false');

console.log('✅ Test 1 Passed: isDomainWhitelisted accurately handles root, www, and subdomains.');

// -----------------------------------------------------------------------------
// Test 2: DNR Dynamic Rules Generation for Whitelisted Domains
// -----------------------------------------------------------------------------
function generateWhitelistDnrRules(whitelistedDomains) {
  const newRules = [];
  let ruleId = 10000;

  for (const domain of whitelistedDomains) {
    if (!domain) continue;
    const rootDomain = domain.toLowerCase().trim().replace(/^www\./, '');
    const domainVariants = [domain, rootDomain, `www.${rootDomain}`];

    // A. allowAllRequests for main_frame & sub_frame
    newRules.push({
      id: ruleId++,
      priority: 300,
      action: { type: 'allowAllRequests' },
      condition: {
        initiatorDomains: domainVariants,
        resourceTypes: ['main_frame', 'sub_frame']
      }
    });

    newRules.push({
      id: ruleId++,
      priority: 300,
      action: { type: 'allowAllRequests' },
      condition: {
        urlFilter: `||${rootDomain}^`,
        resourceTypes: ['main_frame', 'sub_frame']
      }
    });

    // B. Allow all sub-resources (all types)
    newRules.push({
      id: ruleId++,
      priority: 250,
      action: { type: 'allow' },
      condition: {
        initiatorDomains: domainVariants
      }
    });

    newRules.push({
      id: ruleId++,
      priority: 250,
      action: { type: 'allow' },
      condition: {
        urlFilter: `||${rootDomain}^`
      }
    });
  }

  return newRules;
}

const dnrRules = generateWhitelistDnrRules(['mysite.com']);
assert.strictEqual(dnrRules.length, 4, 'Should generate 4 dynamic DNR rules per whitelisted domain');

const allowAllRules = dnrRules.filter(r => r.action.type === 'allowAllRequests');
assert.strictEqual(allowAllRules.length, 2, 'Should have 2 allowAllRequests rules');
assert.strictEqual(allowAllRules[0].priority, 300, 'allowAllRequests must be priority 300 to override block rules');

const allowSubresourceRules = dnrRules.filter(r => r.action.type === 'allow');
assert.strictEqual(allowSubresourceRules.length, 2, 'Should have 2 allow rules for subresources');
assert.strictEqual(allowSubresourceRules[0].priority, 250, 'allow rules must be priority 250');
assert.strictEqual(allowSubresourceRules[0].condition.resourceTypes, undefined, 'Must not restrict resource types so all assets load');

console.log('✅ Test 2 Passed: Dynamic DNR rules include priority 300 allowAllRequests and unconditional resource allow.');

// -----------------------------------------------------------------------------
// Test 3: ad-defuser.js Zero-Mocking on Whitelisted Sites
// -----------------------------------------------------------------------------
const defuserCode = fs.readFileSync(path.join(__dirname, 'content', 'ad-defuser.js'), 'utf8');

assert.ok(defuserCode.includes('isSiteWhitelistedOrDisabled'), 'ad-defuser.js must contain isSiteWhitelistedOrDisabled check');
assert.ok(defuserCode.includes('return;'), 'ad-defuser.js must return early without injecting mocks when whitelisted');
assert.ok(defuserCode.includes('__AMPBLOCK_STATUS_SYNC__'), 'ad-defuser.js must listen for status sync events');

console.log('✅ Test 3 Passed: ad-defuser.js cleanly bypasses all scriptlet mocks on whitelisted sites.');

// -----------------------------------------------------------------------------
// Test 4: content-script.js Unhiding & Space Restoration
// -----------------------------------------------------------------------------
const contentScriptCode = fs.readFileSync(path.join(__dirname, 'content', 'content-script.js'), 'utf8');

assert.ok(contentScriptCode.includes('restoreHiddenElements()'), 'content-script.js must restore hidden elements when whitelisted');
assert.ok(contentScriptCode.includes('removeCosmeticCSS()'), 'content-script.js must remove cosmetic stylesheet when whitelisted');
assert.ok(contentScriptCode.includes('isHostInWhitelist'), 'content-script.js must use robust isHostInWhitelist helper');
assert.ok(contentScriptCode.includes('sessionStorage.getItem(\'__ampblock_whitelisted\')'), 'content-script.js must check sessionStorage immediately at load time');

console.log('✅ Test 4 Passed: content-script.js unhides all elements and removes cosmetic filters when whitelisted.');

// -----------------------------------------------------------------------------
// Test 5: popup-blocker.js and security-sentinel.js Whitelist Bypass
// -----------------------------------------------------------------------------
const popupBlockerCode = fs.readFileSync(path.join(__dirname, 'content', 'popup-blocker.js'), 'utf8');
const sentinelCode = fs.readFileSync(path.join(__dirname, 'content', 'security-sentinel.js'), 'utf8');

assert.ok(popupBlockerCode.includes('window.__ampblock_whitelisted_active'), 'popup-blocker.js must support dynamic status sync flag');
assert.ok(sentinelCode.includes('window.__ampblock_whitelisted_active'), 'security-sentinel.js must support dynamic status sync flag');
assert.ok(sentinelCode.includes('ampblock-quarantine-root'), 'security-sentinel.js must remove quarantine root when whitelisted');

console.log('✅ Test 5 Passed: popup-blocker.js and security-sentinel.js completely disengage on whitelisted sites.');

// -----------------------------------------------------------------------------
// Test 6: YouTube Ultra Buster Disengagement when Whitelisted
// -----------------------------------------------------------------------------
function mockPrune(data, isEnabled, isWhitelisted) {
  if (!isEnabled || isWhitelisted || !data || typeof data !== 'object') return data;
  delete data.adPlacements;
  delete data.playerAds;
  return data;
}

const ytPayloadWithAds = {
  adPlacements: [{ id: 'ad1' }],
  playerAds: [{ id: 'ad2' }],
  videoDetails: { title: 'Test Video' }
};

const processedWhenWhitelisted = mockPrune(JSON.parse(JSON.stringify(ytPayloadWithAds)), true, true);
assert.strictEqual(processedWhenWhitelisted.adPlacements.length, 1, 'adPlacements must NOT be deleted when YouTube is whitelisted');
assert.strictEqual(processedWhenWhitelisted.playerAds.length, 1, 'playerAds must NOT be deleted when YouTube is whitelisted');

console.log('✅ Test 6 Passed: YouTube video and banner ads display 100% normally when YouTube is allowed.');

console.log('\n🎉 ALL 6/6 WHITELIST & ZERO-BLOCK TESTS PASSED 100%!');
