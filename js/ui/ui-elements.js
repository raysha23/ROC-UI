//Folder Path: RagnarokOnlineClone/UI/js/ui/ui-elements.js
// ui-elements.js
export const elements = {};

export function initializeElements() {
  elements.heroImage = document.getElementById("heroImage");
  elements.innateLeftImgs = document.querySelectorAll(".innate-left img");
  elements.barsCharacter = document.querySelector(".bars-character");
  elements.heroSelection = document.querySelector(".hero-selection img");
  elements.jobItems = document.querySelectorAll(".job-item");
  elements.weaponSelect = document.getElementById("weapon-select");
  elements.jobTitle = document.getElementById("jobTitle");
  elements.descText = document.getElementById("descText");
  elements.maleBtn = document.getElementById("maleBtn");
  elements.femaleBtn = document.getElementById("femaleBtn");

  // Main stat/UI inputs used by updateUI
  elements.attackInput = document.querySelector(".atk-value");
  elements.MinmagicAttackInput = document.querySelector(".matk-min");
  elements.MaxmagicAttackInput = document.querySelector(".matk-max");
  elements.critInput = document.querySelector(".crit-value");
  elements.defenseInput = document.querySelector(".def-base");
  elements.magicDefenseInput = document.querySelector(".mdef-base");
  elements.attackSpeedInput = document.querySelector(".aspd-value");
  elements.hitRateInput = document.querySelector(".hit-value");
  elements.fleeBaseInput = document.querySelector(".flee-base");
  elements.fleeLukInput = document.querySelector(".flee-luk");
  elements.levelInput = document.querySelector(".lvl-value-input");
  elements.jobLevelInput = document.getElementById("job-level");
  elements.statusPointInput = document.querySelector(".status-value");
  elements.jobBonusValues = document.querySelectorAll(".job-bonus-value");

  const statKeys = ["str", "agi", "vit", "int", "dex", "luk"];
  const statRows = document.querySelectorAll(".stats-top .column:nth-child(1) .table-row");
  elements.statRows = {};
  statRows.forEach((row, idx) => {
    const statKey = statKeys[idx];
    if (statKey) {
      elements.statRows[statKey] = row;
    }
  });

  elements.ptsReqDisplays = document.querySelectorAll(".stats-top .column:nth-child(3) .value");
}