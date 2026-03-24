// Shared mutable state
export const state = {
  skillPointsUsed: 0,
  skillPointsLeft: 39,
  characterSkillLevels: {}
};

export function resetState() {
  state.skillPointsUsed = 0;
  state.characterSkillLevels = {};
}

export function incrementSkill(skillKey, maxLv) {
  const current = state.characterSkillLevels[skillKey] || 0;
  if (state.skillPointsLeft > 0 && current < maxLv) {
    state.characterSkillLevels[skillKey] = current + 1;
    state.skillPointsUsed++;
    return true;
  }
  return false;
}
