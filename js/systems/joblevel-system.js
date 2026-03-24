//Folder Path: RagnarokOnlineClone/UI/js/systems/joblevel-system.js

import { character } from "../state/character.js";
import { jobData } from "../data/job-data.js";
import { updateUI } from "../ui/ui-updates.js";
import { elements } from "../ui/ui-elements.js";
// ======================================================
// JOB LEVEL SYSTEM
// ======================================================

export function updateJobLevel(newLevel) {
  newLevel = Math.max(1, Math.min(50, parseInt(newLevel) || 1));

  character.jobLevel = newLevel;

  updateUI();
}

// ======================================================
// JOB BONUS CALCULATION
// ======================================================

export function getTotalJobBonus() {
  // Prefer elements.jobTitle if available, otherwise fall back to active job item or 'novice'
  let job = 'novice';
  try {
    if (elements && elements.jobTitle && elements.jobTitle.textContent) {
      job = elements.jobTitle.textContent.toLowerCase();
    } else {
      const activeJobItem = document.querySelector('.job-item.active');
      if (activeJobItem && activeJobItem.dataset && activeJobItem.dataset.job) {
        job = activeJobItem.dataset.job.toLowerCase();
      }
    }
  } catch (e) {
    // ignore and use default
  }

  const currentLevel = (character && character.jobLevel) || 1;
  const jobEntry = (jobData && jobData[job]) ? jobData[job] : (jobData && jobData['novice']) ? jobData['novice'] : {};
  const bonusData = jobEntry.jobBonus || {};

  // Initialize stats
  const totalBonus = { str: 0, agi: 0, vit: 0, int: 0, dex: 0, luk: 0 };

  // Loop through each level in bonusData
  for (let lvl in bonusData) {
    if (parseInt(lvl, 10) <= currentLevel) {
      const stats = bonusData[lvl];
      for (let key in stats) {
        if (totalBonus[key] !== undefined) {
          totalBonus[key] += stats[key];
        }
      }
    }
  }

  return totalBonus;
}
