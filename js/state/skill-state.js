// ================= STATE =================
export const state = {
  skillPointsUsed: 0,
  skillPointsLeft: 0,
  characterSkillLevels: {},
};

// ================= RESET =================
export function resetState() {
  state.skillPointsUsed = 0;
  state.skillPointsLeft = 0;
  state.characterSkillLevels = {};
}

// ================= INCREMENT =================
export function incrementSkill(skillKey, maxLv) {
  const current = state.characterSkillLevels[skillKey] || 0;

  if (state.skillPointsLeft > 0 && current < maxLv) {
    state.characterSkillLevels[skillKey] = current + 1;
    state.skillPointsUsed++;
    state.skillPointsLeft--;
    return true;
  }

  return false;
}