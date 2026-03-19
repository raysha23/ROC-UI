//Folder Path: RagnarokOnlineClone/UI/js/systems/regen-system.js

export function calculateHPRegen(maxHP, character) {
  const vit = character.stats.vit;
  const hprMod = character.hprMod || 0;

  // base regen
  let HPR = 1 + Math.floor(maxHP / 200);

  // vit bonus
  HPR += Math.floor(vit / 5);

  // modifiers
  HPR = Math.floor(HPR * (1 + hprMod * 0.01));

  return HPR;
}

export function calculateSPRegen(maxSP, character) {
  const intStat = character.stats.int;
  const sprMod = character.sprMod || 0;

  let SPR = 1;

  SPR += Math.floor(maxSP / 100);
  SPR += Math.floor(intStat / 6);

  if (intStat >= 120) {
    SPR += Math.floor(intStat / 2 - 56);
  }

  SPR = Math.floor(SPR * (1 + sprMod * 0.01));

  return SPR;
}
