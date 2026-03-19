//Folder Path: RagnarokOnlineClone/UI/js/systems/sp-system.js
import { jobData } from "../data/job-data.js";
import { getTotalJobBonus } from "./joblevel-system.js";

export function calculateSP(character) {
  const level = character.baseLevel;
  const job = character.job;

  // Include job bonus for INT
  const jobBonus = getTotalJobBonus();
  const INT = (character.stats?.int || 0) + (jobBonus.int || 0);

  const data = jobData[job]?.stats;
  if (!data) return 0;

  const baseSP = data.baseSP || 0;
  const spB = data.spB || 5; // default if undefined

  // 1️⃣ Base SP: baseSP + level * spB
  let BASE_SP = baseSP + level * spB;

  // 2️⃣ Apply INT modifier (+1% per INT)
  let MAX_SP = Math.floor(BASE_SP * (1 + INT * 0.01));

  // 3️⃣ Add flat SP modifier
  MAX_SP += data.SP_MOD_A || 0;

  // 4️⃣ Apply percent modifier
  MAX_SP = Math.floor(MAX_SP * (1 + (data.SP_MOD_B || 0) * 0.01));

  // 5️⃣ Apply transformation multiplier
  MAX_SP = Math.floor(MAX_SP * (data.TRANS_MOD || 1));

  return MAX_SP;
}
