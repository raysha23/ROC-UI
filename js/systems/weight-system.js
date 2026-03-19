//Folder Path: RagnarokOnlineClone/UI/js/systems/weight-system.js
import { jobData } from "../data/job-data.js";
export function calculateWeight(character) {
  const str = character.stats?.str || 0;
  const job = character.job;

  const data = jobData[job]?.stats;
  if (!data) {
    console.warn(`Unknown job "${job}" encountered in calculateWeight.`);
    return 2000 + str * 30;
  }

  const jobWeight = data.weight || 0;

  // optional modifiers
  const enlargeWeight = character.skills?.enlargeWeight || 0; // merchant skill level
  const gymPass = character.mods?.gymPass || 0; // kafra gym pass levels
  const pecoRide = character.mods?.pecoRide ? 1000 : 0;

  const WGT_MOD = (enlargeWeight + gymPass) * 200 + pecoRide;

  let MAX_WGT = 2000;
  MAX_WGT += 30 * str;
  MAX_WGT += jobWeight;
  MAX_WGT += WGT_MOD;

  return MAX_WGT;
}