//Folder Path: RagnarokOnlineClone/UI/js/systems/aspd-system.js
import { weaponData } from "../data/weapon-data.js";
import { getTotalJobBonus } from "./joblevel-system.js";

export function calculateASPD(character) {
  const baseStats = character.stats;
  const jobBonus = getTotalJobBonus();
  const agi = baseStats.agi + jobBonus.agi;
  const dex = baseStats.dex + jobBonus.dex;
  const job = character.job;
  const weapon = character.weapon;

  const btba = weaponData[job]?.[weapon] || 1.5;
  const WD = btba * 50;

  const totalBonus = Math.round((WD * agi) / 25) + Math.round((WD * dex) / 100);
  const delayReduction = totalBonus / 10;

  const SM = character.speedMod || 0;

  const aspdValue = 200 - (WD - delayReduction) * (1 - SM);
  // console.log(`ASPD Calculation Debug:
  // AGI: ${agi}
  // DEX: ${dex}
  // Job: ${job}
  // Weapon: ${weapon}
  // BTBA: ${btba}
  // WD: ${WD}
  // Total Bonus: ${totalBonus}
  // Delay Reduction: ${delayReduction}
  // Speed Mod: ${SM}
  // Final ASPD Value: ${aspdValue}
  // `);
  return Math.floor(aspdValue);
}
