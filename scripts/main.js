// scripts/main.js
import { world, system, BlockPermutation } from "@minecraft/server";
import { bannerHelper } from "./banner_helper";


// === Debuff phases (tick-based, matching existing scoreboard windows) ===
// Phase 1: 1..1728000
// Phase 2: 1728001..13824000
// Phase 3: 13824001..
const PHASE_1_TICKS = 1728000;
const PHASE_2_TICKS = 13824000;

// Apply effects every N ticks to reduce overhead.
const EFFECT_REAPPLY_EVERY_TICKS = 10;

const OVERWORLD = world.getDimension("overworld");

// Team colors you currently tag in functions.
const TEAMS = ["red", "blue", "green", "yellow"];

/**
 * Determine team from banner placement.
 *
 * NOTE: Option B (blocks) requires we can identify team-owned banners.
 * This implementation assumes your banners are placed as real banner blocks
 * and are uniquely identifiable by their block permutation pattern (or via
 * nearby armor_stand name if you still keep them).
 *
 * For now we implement a minimal, configurable placeholder mapping:
 * - We read the block's "color" via its permutation when possible.
 * - If permutation doesn't expose color reliably, you must provide a tagging
 *   mechanism (e.g., place a marker block next to it).
 */
function getBannerTeamFromBlock(block) {
  // Bedrock scripting can expose permutation; keep safe.
  const perm = block.permutation;
  const q = perm.getState?.("color") ?? perm.getState?.("BaseColor");
  if (!q) return null;
  const color = String(q).toLowerCase();
  if (TEAMS.includes(color)) return color;
  // Some engines return "red" etc. directly.
  if (color.includes("red")) return "red";
  if (color.includes("blue")) return "blue";
  if (color.includes("green")) return "green";
  if (color.includes("yellow")) return "yellow";
  return null;
}

// Track banner break state per team.
// brokenAtTick[team] = world tick count when banner was first observed missing.
const brokenAtTick = new Map(TEAMS.map((t) => [t, null]));

// Cache banner block locations once discovered.
// bannerLocations[team] = { x, y, z }
const bannerLocations = new Map(TEAMS.map((t) => [t, null]));

let initialized = false;
let lastTick = 0;
let effectCounter = 0;

function applyDebuffs(player, phase) {
  // phase: 1 | 2 | 3
  // weakness/slowness in phase 1+2, hunger only in phase 3.
  if (phase === 1 || phase === 2 || phase === 3) {
    player.addEffect("weakness", 12, 0, false);
    player.addEffect("slowness", 12, 0, false);
  }
  if (phase === 3) {
    player.addEffect("hunger", 12, 0, false);
  }
}

function clearDebuffs(player) {
  // duration 0 clears.
  player.addEffect("weakness", 0, 0, false);
  player.addEffect("slowness", 0, 0, false);
  player.addEffect("hunger", 0, 0, false);
}

function getPhaseForTeam(team, nowTick) {
  const bt = brokenAtTick.get(team);
  if (bt === null) return 0;
  const elapsed = nowTick - bt;
  if (elapsed <= 0) return 0;
  if (elapsed <= PHASE_1_TICKS) return 1;
  if (elapsed <= PHASE_2_TICKS) return 2;
  return 3;
}

function ensureInit() {
  if (initialized) return;
  initialized = true;

  // Discover banners by scanning the area is expensive.
  // For a simple server, you should define banner positions via constants.
  // For now, we try to locate banners near spawn within a radius.
  const spawn = OVERWORLD.getBlock({ x: 0, y: 64, z: 0 });
  void spawn;

  // TODO: Replace this discovery with your actual banner coordinates.
  // For now, no discovery means no debuffs will trigger.
}

function setBrokenIfBannerMissing(team, loc, nowTick) {
  if (!loc) return;
  const block = OVERWORLD.getBlock({ x: loc.x, y: loc.y, z: loc.z });
  if (!block) return;

  // If banner block isn't present, consider it broken.
  // Banner block ids vary; we check for "banner" substring.
  const id = block.typeId ?? "";
  const isBanner = String(id).toLowerCase().includes("banner");

  if (!isBanner) {
    if (brokenAtTick.get(team) === null) {
      brokenAtTick.set(team, nowTick);
    }
  }
}

// One-time helper trigger (TEST ONLY):
// Tag players first if you don't want everyone spamming chat.
// Change this to your preferred trigger later.
let helperRan = false;
function tick() {

  ensureInit();

  const nowTick = system.currentTick ?? lastTick + 1;
  lastTick = nowTick;

  // Run banner inspection once at startup.
  // Remove/disable after you collect chat output.
  if (!helperRan) {
    helperRan = true;
    const players = OVERWORLD.getPlayers();
    bannerHelper.runFor(players);
  }

  // Detect banner break state per team.
  for (const team of TEAMS) {
    const loc = bannerLocations.get(team);
    setBrokenIfBannerMissing(team, loc, nowTick);
  }

  effectCounter++;
  if (effectCounter < EFFECT_REAPPLY_EVERY_TICKS) return;
  effectCounter = 0;

  // Apply phase debuffs based on broken state.
  for (const team of TEAMS) {
    const phase = getPhaseForTeam(team, nowTick);

    // Your players are tagged with team_red/team_blue/... in the existing pack.
    const tag = `team_${team}`;
    for (const p of OVERWORLD.getPlayers({ tags: [tag] })) {
      if (phase === 0) {
        clearDebuffs(p);
      } else {
        applyDebuffs(p, phase);
      }
    }
  }
}

system.runInterval(tick, 10);



