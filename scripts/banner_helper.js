import { world, system, Player } from "@minecraft/server";

/**
 * Banner Helper
 * Run a command that loads/executes this script entry point, or temporarily
 * import+invoke it from scripts/main.js during testing.
 *
 * Purpose:
 * - When run, reads the banner item in the player's main hand
 * - Outputs base color + all available banner pattern/permutation state keys
 *   to chat so you can hardcode detection in scripts/main.js.
 *
 * How to trigger:
 * - Easiest: temporarily call `bannerHelper.runFor(world.getPlayers())`
 *   from main tick.
 */

const CHAT_PREFIX = "§6[BannerHelper]§r";

function tryGetPermutationStates(item) {
  const perm = item?.permutation;
  if (!perm) return { error: "No permutation on held item" };

  // Bedrock scripting permutations vary by version/type.
  // We will attempt common state key reads and also dump what keys exist.
  const out = {
    typeId: item.typeId,
    permutationStates: {},
    permutation: perm,
  };

  // Helper for safe state reads.
  const safeRead = (key) => {
    try {
      const v = perm.getState?.(key);
      if (v !== undefined) out.permutationStates[key] = v;
    } catch {
      // ignore
    }
  };

  // Common banner state keys
  const commonKeys = [
    "color",
    "base_color",
    "BaseColor",
    "basecolor",
    "pattern",
    "patterns",
    "base",
    "banner_patterns",
    "BasePattern",
  ];

  for (const k of commonKeys) safeRead(k);

  // Attempt to discover keys by scanning known label-like states.
  // Not all perm objects support enumeration.
  // We still try for indexed banner pattern layers if exposed.
  for (let i = 0; i < 20; i++) {
    safeRead(`pattern${i}`);
    safeRead(`Pattern${i}`);
    safeRead(`pattern_${i}`);
    safeRead(`layer${i}`);
    safeRead(`Layer${i}`);
    safeRead(`Color${i}`);
    safeRead(`color${i}`);
  }

  return out;
}

function formatPermutationStates(obj) {
  if (obj.error) return `${CHAT_PREFIX} ${obj.error}`;
  const entries = obj?.permutationStates ? Object.entries(obj.permutationStates) : [];
  if (!entries.length) {
    return `${CHAT_PREFIX} No readable permutation state keys were found.`;
  }
  const lines = entries
    .slice(0, 30)
    .map(([k, v]) => `§e${k}§r = §b${String(v)}§r`);
  return `${CHAT_PREFIX} typeId=${obj.typeId}\n` + lines.join("\n");
}

export const bannerHelper = {
  /**
   * Reads banner in mainhand and prints state keys to chat.
   */
  runFor(players) {
    for (const p of players) {
      try {
        const invComp = p.getComponent("minecraft:inventory");
        if (!invComp) {
          p.sendMessage(`${CHAT_PREFIX} No inventory component.`);
          continue;
        }

        // Bedrock scripting: main hand is container slot 0 usually.
        // We attempt getItem with common mainhand slot.
        const mainhand = invComp.container?.getItem?.("slot.weapon.mainhand");
        const mainhand2 = invComp.container?.getItem?.(0);
        const item = mainhand ?? mainhand2;

        if (!item) {
          p.sendMessage(`${CHAT_PREFIX} Hold a banner item in your main hand.`);
          continue;
        }

        // Identify banner item by typeId substring.
        const id = String(item.typeId ?? "").toLowerCase();
        if (!id.includes("banner")) {
          p.sendMessage(`${CHAT_PREFIX} Held item is not a banner. typeId=${item.typeId}`);
          continue;
        }

        const dump = tryGetPermutationStates(item);
        p.sendMessage(formatPermutationStates(dump));
      } catch (e) {
        p.sendMessage(`${CHAT_PREFIX} Error: ${e?.message ?? String(e)}`);
      }
    }
  },
};

// Optional: if this file is ever executed directly by entrypoint, expose helper.
// (No automatic run to avoid spamming.)

