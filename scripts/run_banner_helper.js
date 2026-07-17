import { world } from "@minecraft/server";
import { bannerHelper } from "./banner_helper";

// Entrypoint for manually running the banner helper.
// Usage: configure manifest scripts entry to point to this file OR
// temporarily import and call from scripts/main.js.

const OVERWORLD = world.getDimension("overworld");

export function run() {
  const players = OVERWORLD.getPlayers();
  bannerHelper.runFor(players);
}

// If the engine auto-executes the entrypoint module, calling run() here is enough.
run();

