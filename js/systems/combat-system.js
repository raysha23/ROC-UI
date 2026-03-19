//Folder Path: RagnarokOnlineClone/UI/js/systems/combat-system.js
import { calculateHP } from "./hp-system.js";
import { calculateSP } from "./sp-system.js";
import { calculateHPRegen, calculateSPRegen } from "./regen-system.js";
import { calculateWeight } from "./weight-system.js";
import { calculateASPD } from "./aspd-system.js";
import { getTotalJobBonus } from "./joblevel-system.js";

// ======================================
// MAIN COMBAT STAT CALCULATIONS
// ===
// ===================================
export function calculateCombatStats(character) {
  const baseStats = character.stats;
  const jobBonus = getTotalJobBonus();

  const str = baseStats.str + jobBonus.str;
  const agi = baseStats.agi + jobBonus.agi;
  const vit = baseStats.vit + jobBonus.vit;
  const int = baseStats.int + jobBonus.int;
  const dex = baseStats.dex + jobBonus.dex;
  const luk = baseStats.luk + jobBonus.luk;
  const level = character.baseLevel;

  // ----------------------------
  // ATTACK
  const strBonus = Math.floor(str / 10) ** 2;
  const dexMeleeBonus = Math.floor(dex / 5);
  const lukAttackBonus = Math.floor(luk / 5);

  const attack = str + strBonus + dexMeleeBonus + lukAttackBonus;

  // ----------------------------
  // MAGIC ATTACK
  const baseMatk = int;
  const minMatkBonus = Math.floor(int / 7) ** 2;
  const maxMatkBonus = Math.floor(int / 5) ** 2;

  const matkMin = baseMatk + minMatkBonus;
  const matkMax = baseMatk + maxMatkBonus;

  // ----------------------------
  // HIT
  const hit = level + dex;

  // ----------------------------
  // CRITICAL
  const crit = Math.max(1, Math.floor(luk * 0.3) + 1);

  // ----------------------------
  // FLEE
  const flee = level + agi;

  // PERFECT DODGE
  const perfectDodge = 1 + Math.floor(luk / 10);

  // ----------------------------
  // DEF / MDEF
  const defense = vit;
  const mdefBase = int;

  // ----------------------------
  // OTHER SYSTEMS
  const maxHP = calculateHP(character);
  const maxSP = calculateSP(character);

  const hpRegen = calculateHPRegen(maxHP, character);
  const spRegen = calculateSPRegen(maxSP, character);

  const weightLimit = calculateWeight(character);
  const attackSpeed = calculateASPD(character);

  return {
    attack,
    matkMin,
    matkMax,
    mdefBase,
    hit,
    flee,
    crit,
    defense,
    attackSpeed,
    weightLimit,
    maxHP,
    maxSP,
    hpRegen,
    spRegen,
  };
}
