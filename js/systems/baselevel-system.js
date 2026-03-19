//File Path: RagnarokOnlineClone/UI/js/systems/baselevel-syster.js
import { elements } from "../ui/ui-elements.js";
import { character } from "../state/character.js";
import { updateUI } from "../ui/ui-updates.js";
import { getTotalCostToReachStat } from "../formulas/stat-formula.js";
import { getTotalStatPointsForLevel } from "../formulas/stat-formula.js";

export function updateLevel(newLevel) {
  newLevel = Math.max(1, Math.min(99, parseInt(newLevel) || 1));

  character.baseLevel = newLevel;

  const totalPoints = getTotalStatPointsForLevel(newLevel);

  adjustStatsToLevel(totalPoints);

  const spentPoints = getSpentPoints();
  character.availablePoints = Math.max(0, totalPoints - spentPoints);

  updateUI();
}
export function initializeStats() {
  // Initialize base character stats and UI on app load
  // If the UI has pre-filled base level, use that.
  const initialLevel = elements.levelInput
    ? parseInt(elements.levelInput.value, 10)
    : character.baseLevel;

  const normalizedLevel = Number.isFinite(initialLevel)
    ? Math.max(1, Math.min(99, initialLevel))
    : character.baseLevel;

  updateLevel(normalizedLevel);
}

export function adjustStatsToLevel(totalPoints) {
  let spentPoints = getSpentPoints();

  while (spentPoints > totalPoints) {
    const oldStats = { ...character.stats };

    if (!decreaseHighestStat()) break;

    const newSpentPoints = getSpentPoints();

    // Fallback safety: if decrease didn't reduce spent points, break to avoid infinite loop.
    if (newSpentPoints >= spentPoints) break;

    spentPoints = newSpentPoints;
  }
}
export function decreaseHighestStat() {
  let highestKey = null;
  let highestValue = -Infinity;

  for (const [key, value] of Object.entries(character.stats)) {
    if (value > highestValue) {
      highestValue = value;
      highestKey = key;
    }
  }

  if (!highestKey || character.stats[highestKey] <= 1) return false;

  character.stats[highestKey] -= 1;
  return true;
}
export function getSpentPoints() {
  return Object.values(character.stats).reduce((sum, value) => {
    return sum + getTotalCostToReachStat(1, value);
  }, 0);
}
