//Folder Path: RagnarokOnlineClone/UI/js/systems/hp-system.js
import { jobData } from "../data/job-data.js";
import { getTotalJobBonus } from "./joblevel-system.js";

// Base HP calculation (triangular growth)
function calculateBaseHP(level, hpFactor, job) {
  // Swordsmen get a +2 head-start
  let baseHP = job === "swordsman" ? 37 : 35;

  // Add level-based growth (hpB)
  baseHP += level * 5; // use 5 as default if hpB not passed

  // Triangular growth
  for (let i = 2; i <= level; i++) {
    baseHP += Math.round(hpFactor * i);
  }

  return baseHP;
}

export function calculateHP(character) {
  const jobBonus = getTotalJobBonus();
  const level = character.baseLevel;
  const job = character.job;

  const VIT = (character.stats?.vit || 0) + (jobBonus.vit || 0);
  const data = jobData[job]?.stats;
  if (!data) return 0;

  const hpA = data.hpA || 0;
  const hpB = data.hpB || 5; // used only for display, actual triangular growth uses hpA

  // 1️⃣ Base HP using the cleaner function
  let BASE_HP = calculateBaseHP(level, hpA, job);

  // 2️⃣ Max HP with VIT modifier
  let MAX_HP = Math.floor(BASE_HP * (1 + VIT * 0.01) * (data.TRANS_MOD || 1));

  // 3️⃣ Additive modifiers
  MAX_HP += data.HP_MOD_A || 0;

  // 4️⃣ Multiplicative modifiers
  MAX_HP = Math.floor(MAX_HP * (1 + (data.HP_MOD_B || 0) * 0.01));

  return MAX_HP;
}
