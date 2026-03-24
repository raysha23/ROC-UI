export function populateJobLevels(jobLevelSelect, min = 40, max = 255, onChange) {
  jobLevelSelect.innerHTML = '';
  for (let i = min; i <= max; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    jobLevelSelect.appendChild(option);
  }
  if (onChange) onChange();
}

export function updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput) {
  const jobLv = parseInt(jobLevelSelect.value);
  const totalPointsEarned = jobLv - 1;
  state.skillPointsLeft = totalPointsEarned - state.skillPointsUsed;

  if (pointsLeftInput) pointsLeftInput.value = state.skillPointsLeft;
  if (pointsUsedInput) pointsUsedInput.value = state.skillPointsUsed;
}

export function typeMessage(element, text, speed = 50) {
  if (!element) return;
  let typeInterval = element._typeInterval;
  if (typeInterval) clearInterval(typeInterval);
  element.innerHTML = '';
  let i = 0;
  const chars = text.split('');
  typeInterval = setInterval(() => {
    if (chars[i] === '<') {
      if (text.substr(i, 4) === '<br>') {
        element.innerHTML += '<br>';
        i += 4;
      } else {
        element.innerHTML += chars[i];
        i++;
      }
    } else {
      element.innerHTML += chars[i];
      i++;
    }
    if (i >= chars.length) clearInterval(typeInterval);
  }, speed);
  element._typeInterval = typeInterval;
}
