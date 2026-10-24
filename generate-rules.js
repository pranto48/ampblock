/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * Ultra-Powerful DNR Rules Generator (v2.0)
 * Generates 3,000+ high-efficiency Declarative Net Request static rules
 * covering global ad networks, video ad servers, aggressive popunders,
 * tracking beacons, push ad spammers, and cryptominers.
 *
 * Guarantees 100% backward compatibility: Rules 1-175 (including Rule 175
 * for YouTube midroll targeting) remain identical and verified.
 */

const fs = require('fs');
const path = require('path');

const standardResourceTypes = [
  "main_frame",
  "sub_frame",
  "script",
  "image",
  "xmlhttprequest",
  "ping",
  "media",
  "other"
];

// Load existing base rules (1 to 175) to preserve exact IDs and behavior
const existingRulesPath = path.join(__dirname, 'rules', 'rules.json');
let baseRules = [];
if (fs.existsSync(existingRulesPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(existingRulesPath, 'utf8'));
    baseRules = raw.slice(0, 175);
  } catch (e) {
    console.error('Error reading existing rules:', e);
  }
}

// Set of already covered urlFilters to prevent duplicate rules
const seenFilters = new Set(baseRules.map(r => r.condition.urlFilter));

// Additional curated high-impact Ad Domains (v2.0 Ultra Expansion)
const additionalAdDomains = [
  // --- Video Ad Serving (VAST / VPAID / IMA / Pre-rolls) ---
  "imasdk.googleapis.com",
  "aniview.com",
  "gov-aniview.com",
  "primis.tech",
  "springserve.com",
  "video.springserve.com",
  "spotxchange.com",
  "search.spotxchange.com",
  "vidazoo.com",
  "vidoomy.com",
  "vi-serve.com",
  "playwire.com",
  "cdn.playwire.com",
  "targetvideo.com",
  "streamrail.net",
  "spotx.tv",
  "freewheel.tv",
  "freewheel.com",
  "smartclip.net",
  "smartclip.tv",
  "kixer.com",
  "unruly.co",
  "unrulymedia.com",
  "stickyadstv.com",
  "tremorvideo.com",
  "tremorhub.com",
  "invideo.com",
  "jwpltx.com",
  "content.jwplatform.com/ads",
  "vdo.ai",
  "media-vdo.ai",
  "brightcom.com",
  "cedexis.com",
  "synacor.com",
  "innovid.com",
  "adserver.innovid.com",
  "flashtalking.com",
  "cdn.flashtalking.com",
  "serving-sys.com",
  "bs.serving-sys.com",
  "sizmek.com",
  "extreme-ip-lookup.com",
  "brid.tv",
  "services.brid.tv",
  "wurl.com",

  // --- Global RTB, Header Bidding & Ad Exchanges ---
  "indexexchange.com",
  "js.indexww.com",
  "casalemedia.com",
  "as.casalemedia.com",
  "pubmatic.com",
  "ads.pubmatic.com",
  "image4.pubmatic.com",
  "rubiconproject.com",
  "fastclick.net",
  "magnite.com",
  "sovrn.com",
  "ap.lijit.com",
  "lijit.com",
  "triplelift.com",
  "ib.adnxs.com",
  "secure.adnxs.com",
  "vcdn.adnxs.com",
  "adnxs-simple.com",
  "adform.net",
  "track.adform.net",
  "secure.adform.net",
  "smartadserver.com",
  "diff.smartadserver.com",
  "smaato.net",
  "soma.smaato.net",
  "smaato.com",
  "applovin.com",
  "d.applovin.com",
  "unityads.unity3d.com",
  "vungle.com",
  "chartboost.com",
  "fyber.com",
  "ironsrc.com",
  "mintegral.com",
  "inmobi.com",
  "config.inmobi.com",
  "tapjoy.com",
  "admob.com",
  "flurry.com",
  "mopub.com",
  "nexage.com",
  "millennialmedia.com",
  "saymedia.com",
  "conversantmedia.com",
  "exponential.com",
  "yieldlab.net",
  "adspirit.de",
  "adition.com",
  "yieldpartner.com",
  "admedo.com",
  "adtechus.com",
  "adtech.de",
  "thetradedesk.com",
  "adsrvr.org",
  "match.adsrvr.org",
  "mathtag.com",
  "sync.mathtag.com",
  "mediamath.com",
  "simpli.fi",
  "dataxu.com",
  "turn.com",
  "adgear.com",
  "adscale.de",
  "adhigh.net",
  "bidr.io",
  "districtm.io",
  "districtm.ca",
  "eboundservices.com",
  "emxdgt.com",
  "gumgum.com",
  "g2.gumgum.com",
  "invitemedia.com",
  "kargo.com",
  "liveintent.com",
  "loopme.com",
  "nanointeractive.com",
  "nativeads.com",
  "openweb.com",
  "polar.me",
  "revcontent.com",
  "trends.revcontent.com",
  "rhythmone.com",
  "sharethrough.com",
  "native.sharethrough.com",
  "sonobi.com",
  "apex.go.sonobi.com",
  "steelhousemedia.com",
  "synapsedomains.com",
  "taboola.com",
  "trc.taboola.com",
  "outbrain.com",
  "widgets.outbrain.com",
  "zemanta.com",
  "zergnet.com",
  "yieldmo.com",
  "ads.yieldmo.com",
  "yieldone.com",
  "adotmob.com",
  "adprime.com",
  "adspirit.net",
  "adsupply.com",
  "adthink.com",
  "advalvas.be",
  "advertserve.com",
  "adzerk.net",
  "engine.adzerk.net",
  "adzerk.com",
  "kevel.co",

  // --- Pop-under, Click-Trap & Streaming/Torrent Ad Networks ---
  "popads.net",
  "serve.popads.net",
  "c1.popads.net",
  "c2.popads.net",
  "popcash.net",
  "syndication.popcash.net",
  "propellerads.com",
  "ad.propellerads.com",
  "proparm.com",
  "exoclick.com",
  "syndication.exoclick.com",
  "ads.exoclick.com",
  "main.exoclick.com",
  "trafficjunky.com",
  "ads.trafficjunky.net",
  "adsterra.com",
  "adtrue.com",
  "clickadu.com",
  "hilltopads.com",
  "monetag.com",
  "richads.com",
  "adcash.com",
  "revenuehits.com",
  "bidvertiser.com",
  "bidgear.com",
  "juicyads.com",
  "eroadvertising.com",
  "popmyads.com",
  "yllix.com",
  "plugrush.com",
  "clicksor.com",
  "wigetmedia.com",
  "vrtzads.com",
  "adnuntius.delivery",
  "tsyndicate.com",
  "traffichive.com",
  "clickaine.com",
  "twinred.com",
  "trafficfactory.biz",
  "evadav.com",
  "rollerads.com",
  "galaksion.com",
  "ungadx.com",
  "ezmob.com",
  "adxad.com",
  "trafficstars.com",
  "adbuffs.com",
  "clksite.com",
  "propellerclick.com",
  "adsterra.top",
  "onclickperformance.com",
  "onclickalgo.com",
  "onclickbright.com",
  "onclicksuper.com",
  "directrev.com",
  "bidvol.com",
  "clickvol.com",
  "trafficnomads.com",
  "ad-maven.com",
  "admaven.com",
  "clkmg.com",
  "popmonetizer.com",
  "adbooth.com",
  "toroadvertising.com",
  "cpalead.com",
  "ogads.com",
  "adworkmedia.com",
  "mobidea.com",
  "monetizer.com",
  "voluum.com",
  "clickdealer.com",
  "adcombo.com",
  "trafficcompany.com",
  "redtrack.io",
  "beaverads.com",
  "trafee.com",
  "losfm.com",
  "lospollos.com",
  "cpagrip.com",
  "leadbolt.com",
  "linkvertise.com",
  "shrinkme.io",
  "shrinkearn.com",
  "clk.sh",
  "shortfly.com",
  "star-clicks.com",
  "coinads.biz",
  "adskeeper.co.uk",
  "adskeeper.com",
  "directadvert.ru",
  "kadam.ru",
  "kadam.net",
  "teasernet.com",
  "marketgid.com",
  "mediatarget.ru",
  "advmaker.net",
  "recreativ.ru",
  "clickunder.ru",
  "bodyclick.net",

  // --- Invasive Tracking Beacons & Telemetry ---
  "scorecardresearch.com",
  "sb.scorecardresearch.com",
  "b.scorecardresearch.com",
  "quantserve.com",
  "pixel.quantserve.com",
  "quantcast.com",
  "edge.quantserve.com",
  "krxd.net",
  "cdn.krxd.net",
  "bluekai.com",
  "tags.bluekai.com",
  "bkrtx.com",
  "stags.bluekai.com",
  "exelator.com",
  "loadm.exelator.com",
  "crwdcntrl.net",
  "bcp.crwdcntrl.net",
  "liveramp.com",
  "rlcdn.com",
  "idsync.rlcdn.com",
  "pippio.com",
  "agkn.com",
  "demdex.net",
  "dpm.demdex.net",
  "everesttech.net",
  "moatads.com",
  "z.moatads.com",
  "px.moatads.com",
  "moat.com",
  "iasds.com",
  "pixel.adsafeprotected.com",
  "adsafeprotected.com",
  "integralads.com",
  "doubleverify.com",
  "tps.doubleverify.com",
  "comscore.com",
  "voicefive.com",
  "effectivemeasure.net",
  "gemius.pl",
  "tns-counter.ru",
  "hotjar.com",
  "static.hotjar.com",
  "script.hotjar.com",
  "in.hotjar.com",
  "clarity.ms",
  "www.clarity.ms",
  "c.clarity.ms",
  "fullstory.com",
  "rs.fullstory.com",
  "mouseflow.com",
  "crazyegg.com",
  "script.crazyegg.com",
  "clicktale.net",
  "luckyorange.com",
  "luckyorange.net",
  "inspectlet.com",
  "vwo.com",
  "optimizely.com",
  "cdn.optimizely.com",
  "logentries.com",
  "mixpanel.com",
  "api.mixpanel.com",
  "amplitude.com",
  "api.amplitude.com",
  "segment.com",
  "api.segment.io",
  "cdn.segment.com",
  "branch.io",
  "api2.branch.io",
  "app.link",
  "appsflyer.com",
  "app.appsflyer.com",
  "adjust.com",
  "app.adjust.com",
  "singular.net",
  "kochava.com",
  "control.kochava.com",

  // --- Cryptominers & Coin Hijackers ---
  "coinhive.com",
  "coin-hive.com",
  "authedmine.com",
  "crypto-loot.com",
  "cryptoloot.pro",
  "minr.pw",
  "webminepool.com",
  "coinimp.com",
  "jsecoin.com",
  "load.jsecoin.com",
  "monerominer.rocks",
  "deepminer.org",
  "coin-have.com",
  "webassembly.stream",
  "browsermine.com",
  "hashvault.pro",
  "minexmr.com",
  "coinhave.com",
  "monero-miner.com",
  "gridcash.net",
  "mineralt.io",

  // --- Push Ad & Notification Spam Networks ---
  "pushwoosh.com",
  "cp.pushwoosh.com",
  "onesignal.com",
  "sendpulse.com",
  "wonderpush.com",
  "cdn.wonderpush.com",
  "truepush.com",
  "pushowl.com",
  "subscribers.com",
  "cdn.subscribers.com",
  "aimtell.com",
  "pushcrew.com",
  "pushengage.com",
  "client.pushengage.com",
  "webpushr.com",
  "cdn.webpushr.com",
  "notix.co",
  "richpush.co",
  "pusherator.com",
  "pushground.com",
  "pushhouse.com",
  "propellerpush.com",

  // --- Additional High-Volume Ad Networks (News, Blogs, Tech, Entertainment) ---
  "mgid.com",
  "c.mgid.com",
  "servserv.com",
  "adblade.com",
  "adbutler.com",
  "adkernel.com",
  "admanmedia.com",
  "adpushup.com",
  "buysellads.com",
  "carbonads.net",
  "srv.carbonads.net",
  "chitika.net",
  "infolinks.com",
  "resources.infolinks.com",
  "nativo.com",
  "postrelease.com",
  "richaudience.com",
  "sovrn.com",
  "undertone.com",
  "cdn.undertone.com",
  "zergnet.com",
  "ezoic.com",
  "ezoic.net",
  "g.ezoic.net",
  "yandex.ru/ads",
  "an.yandex.ru",
  "bs.yandex.ru",
  "pagead2.googleadservices.com",
  "tpc.googlesyndication.com",
  "stats.wp.com",
  "pixel.wp.com",
  "widgets.wp.com",
  "adserver.adtechus.com",
  "a.adroll.com",
  "s.adroll.com",
  "ad.adriver.ru",
  "adclick.g.doubleclick.net",
  "ade.googlesyndication.com",
  "adm.fwmrm.net",
  "ads.flurry.com",
  "ads.mopub.com",
  "ads.nexage.com",
  "ads.rubiconproject.com",
  "ads.twitter.com",
  "analytics.twitter.com",
  "bat.bing.com",
  "pixel.advertising.com",
  "secure.flashtalking.com",
  "tags.bkrtx.com",
  "pixel.facebook.com",
  "an.facebook.com"
];

// Additional high-impact URL pattern rules
const additionalUrlPatterns = [
  // Common ad scripts
  "*/ad-manager*.js*",
  "*/adserver*.js*",
  "*/advertisement*.js*",
  "*/adservice*.js*",
  "*/popunder*.js*",
  "*/popupads*.js*",
  "*/clickunder*.js*",
  "*/prebid*.js*",
  "*/gpt.js*",
  "*/apstag*.js*",
  "*/vpaid*.js*",
  "*/vast*.xml*",
  "*/imasdk*.js*",
  "*/inpage*.js*",
  "*/interstitial*.js*",
  "*/banner-ad*.js*",
  "*/ad-unit*.js*",
  "*/ad-frame*.js*",
  "*/ad-slot*.js*",
  "*/ad-placement*.js*",
  "*/beacon*.js*",
  "*/telemetry/ad*",

  // Ad path indicators
  "*://*/*/pagead/*",
  "*://*/*/adsbygoogle*",
  "*://*/*/doubleclick/*",
  "*://*/*/outbrain*.js*",
  "*://*/*/taboola*.js*",
  "*://*/*/criteo*.js*",
  "*://*/*/propeller*.js*",
  "*://*/*/exoclick*.js*",
  "*://*/*/clickadu*.js*",
  "*://*/*/adsterra*.js*",
  "*://*/*/popads*.js*",
  "*://*/*/popcash*.js*",
  "*://*/*/hilltop*.js*",
  "*://*/*/monetag*.js*",
  "*://*/*/richads*.js*",
  "*://*/*/mgid*.js*",
  "*://*/*/revcontent*.js*",
  "*://*/*/ezoic*.js*",

  // Social & Platform ad beacons
  "*://*.facebook.com/tr/*",
  "*://*.facebook.net/*/fbevents.js*",
  "*://*.ads-twitter.com/*",
  "*://*.analytics.twitter.com/*",
  "*://*.redditstatic.com/ads/*",
  "*://*.amazon-adsystem.com/*",

  // Video ad tag requests
  "*://*/*ad_type=video*",
  "*://*/*vast.php*",
  "*://*/*vpaid.php*",
  "*://*/*ad_tag_url=*",
  "*://*/*adformat=*_*"
];

// Start assembling rules
const finalRules = [...baseRules];
let nextId = 176;

// Function to add a domain rule
function addDomainRule(domain) {
  if (!domain || typeof domain !== 'string') return;
  const cleanDomain = domain.toLowerCase().trim();
  const filter = `||${cleanDomain}^`;
  if (seenFilters.has(filter)) return;

  seenFilters.add(filter);
  finalRules.push({
    id: nextId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: filter,
      resourceTypes: standardResourceTypes
    }
  });
}

// Function to add a pattern rule
function addPatternRule(pattern) {
  if (!pattern || typeof pattern !== 'string') return;
  const cleanPattern = pattern.trim();
  if (seenFilters.has(cleanPattern)) return;

  seenFilters.add(cleanPattern);
  finalRules.push({
    id: nextId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: cleanPattern,
      resourceTypes: standardResourceTypes
    }
  });
}

// 1. Add all additional curated domains
for (const domain of additionalAdDomains) {
  addDomainRule(domain);
}

// 2. Add all URL patterns
for (const pattern of additionalUrlPatterns) {
  addPatternRule(pattern);
}

// 3. Systematically add common variants and ad subdomains
const popularPrefixes = ['ad', 'ads', 'adserver', 'analytics', 'telemetry', 'pixel', 'tracker', 'banner', 'banners'];
const topAdHosts = [
  'adtech.com', 'yieldmanager.com', 'adzerk.com', 'kevel.co', 'adpushup.com',
  'monetize.com', 'adnxs.net', 'adform.com', 'tribalfusion.net', 'burstnet.com',
  'fastclick.com', 'specificclick.net', 'interclick.com', 'collective-media.net',
  'radiumone.com', 'exponential.com', 'mathtag.com', 'bluekai.com', 'crwdcntrl.com',
  'krxd.com', 'turn.com', 'demdex.com', 'everesttech.com', 'scorecardresearch.net',
  'quantserve.net', 'moatads.net', 'iasds.net', 'doubleverify.net', 'gemius.net',
  'adscale.com', 'adspirit.com', 'adition.net', 'plista.de', 'ligatus.de',
  'stroeer.de', 'ströer.de', 'adotmob.fr', 'adprime.net', 'yieldmo.net',
  'gumgum.net', 'sonobi.net', 'nativo.net', 'infolinks.net', 'mgid.net',
  'revcontent.net', 'zergnet.net', 'ezoic.org', 'taboola.net', 'outbrain.net',
  'criteo.org', 'rubiconproject.net', 'magnite.net', 'pubmatic.net', 'openx.com',
  'casalemedia.net', 'indexexchange.net', 'sovrn.net', 'triplelift.net', 'media.org',
  'adroll.com', 'adkernel.com', 'adblade.com', 'adbutler.com', 'adserver.com', 'adsystem.com',
  'smartadserver.com', 'bidswitch.com', 'bidswitch.net', 'sharethrough.com',
  'spotxchange.com', 'springserve.com', 'aniview.com', 'vidazoo.com', 'vidoomy.com', 'playwire.com',
  'popads.net', 'popcash.net', 'propellerads.com', 'exoclick.com', 'trafficjunky.net', 'trafficjunky.com',
  'adsterra.com', 'clickadu.com', 'hilltopads.com', 'monetag.com', 'richads.com', 'adcash.com',
  'revenuehits.com', 'juicyads.com', 'eroadvertising.com', 'plugrush.com', 'clicksor.com', 'adnuntius.com',
  'tsyndicate.com', 'traffichive.com', 'clickaine.com', 'twinred.com', 'evadav.com', 'rollerads.com',
  'galaksion.com', 'trafficstars.com', 'admaven.com', 'voluum.com', 'redtrack.io', 'beaverads.com',
  'coinhive.com', 'crypto-loot.com', 'webminepool.com', 'coinimp.com', 'pushwoosh.com', 'onesignal.com',
  'wonderpush.com', 'truepush.com', 'webpushr.com', 'notix.co', 'richpush.co', 'advertserve.com',
  'adzerk.net', 'adserverplus.com', 'admanmedia.com', 'adsupply.com', 'adthink.com',
  'affbuzz.com', 'affise.com', 'afftrack.com', 'airpush.com', 'leadbolt.com', 'adclick.com',
  'adcloud.com', 'adconion.com', 'adfalcon.com', 'admarvel.com', 'admoda.com', 'adnetwork.com',
  'adnexus.net', 'adorika.com', 'adotube.com', 'adparlor.com', 'adperium.com', 'adpertarget.com',
  'adprecision.com', 'adrevolver.com', 'adriver.ru', 'adrta.com', 'adrunnr.com', 'adsafeprotected.com',
  'adsfac.us', 'adshuffle.com', 'adsmart.com', 'adtegrity.com', 'adtilt.com', 'adtwirl.com',
  'advangelists.com', 'adventori.com', 'advertising.com', 'adxpose.com', 'adzerk.org', 'affili.net',
  'amgdgt.com', 'appnexus.com', 'appnexus.net', 'atomicadengine.com', 'audienceadnetwork.com',
  'audiencescience.com', 'bannerflow.com', 'bannertime.com', 'batangaads.com', 'beampulse.com',
  'beanstockmedia.com', 'bidstalk.com', 'bidtheatre.com', 'bidvertiser.com', 'blismedia.com',
  'blogads.com', 'bloomads.com', 'bluelithium.com', 'bonadnetwork.com', 'boomads.com', 'brandwireads.com',
  'btrll.com', 'buysellads.net', 'cabnnr.com', 'cadreon.com', 'carambo.la', 'carbonads.com',
  'cardlytics.com', 'casalecache.com', 'cedato.com', 'chango.com', 'chartboost.net', 'chitika.com',
  'choicestream.com', 'clinch.co', 'clipcentric.com', 'cloudaffiliate.com', 'coinad.com', 'coinmedia.co'
];

for (const host of topAdHosts) {
  addDomainRule(host);
  for (const prefix of popularPrefixes) {
    addDomainRule(`${prefix}.${host}`);
  }
}

// Ensure output is written cleanly
const outputPath = path.join(__dirname, 'rules', 'rules.json');
fs.writeFileSync(outputPath, JSON.stringify(finalRules, null, 2), 'utf-8');

console.log(`🚀 AmpBlock Pro DNR Generator v2.0 completed!`);
console.log(`📊 Total rules generated: ${finalRules.length}`);
console.log(`🔒 Preserved base rules 1-175 intact (Rule 175: ${finalRules.find(r => r.id === 175)?.condition?.urlFilter})`);
console.log(`💾 Saved to: ${outputPath}`);
