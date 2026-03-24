// File Path: js/ui/skill-renderer.js
import { skillData, skillInfo } from "../data/skill-data.js";
import { state, incrementSkill } from "../state/skill-state.js";
import { updatePoints } from "../systems/skill-utils.js";

export function renderSkills(character, elements) {
  const {
    skillTreeArea,
    skillCard,
    jobLevelSelect,
    pointsLeftInput,
    pointsUsedInput,
  } = elements;
  skillTreeArea.innerHTML = "";
  skillTreeArea.classList.remove(
    "novice-layout",
    "swordsman-layout",
    "magician-layout",
    "archer-layout",
    "acolyte-layout",
    "merchant-layout",
    "thief-layout",
  );
  if (character) skillTreeArea.classList.add(`${character}-layout`);

  // Helper: compute map of prerequisites (skill => neededLevels) for targetSkill
  function computeNeededPrereqs(targetSkill) {
    const needed = new Map();
    const visited = new Set();

    function dfs(key) {
      if (visited.has(key)) return;
      visited.add(key);
      const info = skillInfo[key];
      if (!info || !info.req) return;
      for (const r of info.req) {
        const reqSkill = r.skill;
        const cur = state.characterSkillLevels[reqSkill] || 0;
        const need = Math.max(0, r.lv - cur);
        if (need > 0) {
          const prev = needed.get(reqSkill) || 0;
          // keep the maximum needed level for the same skill
          needed.set(reqSkill, Math.max(prev, need));
        }
        dfs(reqSkill);
      }
    }

    dfs(targetSkill);
    return needed; // Map of skillKey => levels needed (only prerequisites)
  }

  // Helper: produce post-order purchase list so prerequisites are bought first
  function producePostOrder(targetSkill) {
    const order = [];
    const visited = new Set();
    function dfs(key) {
      if (visited.has(key)) return;
      visited.add(key);
      const info = skillInfo[key];
      if (!info || !info.req) {
        order.push(key);
        return;
      }
      for (const r of info.req) dfs(r.skill);
      order.push(key);
    }
    dfs(targetSkill);
    return order; // includes target at end
  }

  (skillData[character] || []).forEach((skillFile) => {
    const skillKey = skillFile.replace(".png", "");
    const info = skillInfo[skillKey];

    // DIAGNOSTIC: if skillInfo missing, mark node and warn
    let missingInfo = false;
    if (!info) {
      missingInfo = true;
      console.warn(`skill-renderer: missing skillInfo for ${skillKey}`);
    }

    // Determine prerequisite state but DO NOT skip rendering — show locked skills
    let locked = false;
    let unmetReqs = [];
    if (info && info.req) {
      const allMet = info.req.every(
        (r) => (state.characterSkillLevels[r.skill] || 0) >= r.lv,
      );
      locked = !allMet;
      if (locked) {
        unmetReqs = info.req.filter(
          (r) => (state.characterSkillLevels[r.skill] || 0) < r.lv,
        );
        // mark missing prereq definitions
        unmetReqs.forEach((r) => {
          if (!skillInfo[r.skill]) {
            console.warn(`skill-renderer: missing prereq definition ${r.skill} (required by ${skillKey})`);
            r._missingDefinition = true;
          } 
        });
      }
    }

    // Root skill = no prerequisites
    const isRoot = !(info && info.req && info.req.length > 0);

    // If info missing, add a visual marker later

    if (state.characterSkillLevels[skillKey] === undefined)
      state.characterSkillLevels[skillKey] = 0;

    const maxLv = info?.maxLv || 10;
    const node = document.createElement("div");
    node.classList.add("skill-node");

    if (missingInfo) node.classList.add('missing-info');

    if (isRoot) node.classList.add("root-skill");

    if (locked) {
      node.classList.add("is-locked");
    } else {
      node.classList.add("is-unlocked");
      // connected indicates its prereqs are satisfied and should show gold line
      node.classList.add("connected");
    }

    if (state.characterSkillLevels[skillKey] > 0) {
      node.classList.add("is-active");
    }

    // include a lock overlay when locked
    node.innerHTML = `
      <div class="skill-thumb-wrap">
        <img class="skill-thumb ${locked ? "locked-skill" : "active-skill"}" src="images/${character}-skilltree-images/${skillFile}" alt="Skill">
        ${locked ? '<div class="skill-lock">🔒</div>' : ''}
        ${missingInfo ? '<div class="skill-missing">!</div>' : ''}
      </div>
      <span class="skill-level">Lvl ${state.characterSkillLevels[skillKey]}/${maxLv}</span>
    `;

    // if missing info, slightly dim and add tooltip
    if (missingInfo) {
      node.title = `Missing definition for ${skillKey} — check skill-data.js keys`;
    }

    // Single click handler handles both locked (auto-purchase) and unlocked (+1) behavior
    node.addEventListener("click", async () => {
      // If skill already at max, do nothing
      const curLv = state.characterSkillLevels[skillKey] || 0;
      if (curLv >= maxLv) return;

      if (locked) {
        // Option 1: auto-purchase prerequisites (recursively) then buy +1 level for target
        const neededMap = computeNeededPrereqs(skillKey); // Map(skill=>levelsNeeded)

        // include target: need 1 level (unless already at required min from prereqs)
        const targetNeed = 1; // per-click increment for the target

        // total points needed
        let totalNeeded = targetNeed;
        for (const v of neededMap.values()) totalNeeded += v;

        if (state.skillPointsLeft >= totalNeeded) {
          // perform purchases in post-order so deep prereqs are bought first
          const order = producePostOrder(skillKey);

          // Buy prerequisites (exclude target until later)
          for (const key of order) {
            if (key === skillKey) continue;
            const need = neededMap.get(key) || 0;
            if (need > 0) {
              const infoKey = skillInfo[key];
              const maxForKey = infoKey?.maxLv || 10;
              for (let i = 0; i < need; i++) {
                // incrementSkill will update used points count
                incrementSkill(key, maxForKey);
              }
            }
          }

          // Finally buy 1 level for the target
          for (let i = 0; i < targetNeed; i++) incrementSkill(skillKey, maxLv);

          // Update point displays and re-render
          updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
          renderSkills(character, elements);

          // Optionally show a brief success indicator on the node
          node.classList.add("clicked");
          setTimeout(() => node.classList.remove("clicked"), 220);
        } else {
          // not enough points: give feedback (shake)
          node.classList.add("shake");
          setTimeout(() => node.classList.remove("shake"), 400);
        }
      } else {
        // unlocked: normal +1 purchase behavior
        if (incrementSkill(skillKey, maxLv)) {
          updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
          renderSkills(character, elements);
        } else {
          // not enough points
          node.classList.add("shake");
          setTimeout(() => node.classList.remove("shake"), 400);
        }
      }
    });

    // HOVER: always show info, but include unmet requirements when locked
    node.addEventListener("mouseenter", () => {
      if (!info || !skillCard) return;
      skillCard.querySelector(".header-main h2").innerHTML =
        `${info.title} <span class="skill-id">${info.id}</span>`;

      // build base stats table HTML
      let statsHtml = `
        <tr>
          <th>Type</th><td>${info.type}</td>
          <th>Max Lv</th><td>${info.maxLv}</td>
          <th>Target</th><td>${info.target || "-"} </td>
          <th>Range</th><td>${info.range || "-"} </td>
        </tr>
        <tr>
          <th>Effect</th><td colspan="7">${info.effect || "No description available."}</td>
        </tr>
      `;

      // Append requirements block if any
      if (info.req && info.req.length > 0) {
        const reqHtml = info.req
          .map((r) => {
            const cur = state.characterSkillLevels[r.skill] || 0;
            const ok = cur >= r.lv;
            return `<div class="req-line">${r.skill} ${cur}/${r.lv} ${ok ? "✔" : "✖"}</div>`;
          })
          .join("");

        statsHtml += `
          <tr>
            <th>Req</th>
            <td colspan="7">${reqHtml}</td>
          </tr>
        `;
      }

      skillCard.querySelector(".skill-stats").innerHTML = statsHtml;

      // level table
      let levelHtml = "";
      if (info.levels?.length > 0) {
        info.levels.forEach(
          (lv) =>
            (levelHtml += `<tr><td class="lv-num">${lv.lv}</td><td>${lv.desc}</td></tr>`),
        );
      } else if (info.otherNotes?.length > 0) {
        info.otherNotes.forEach(
          (note) =>
            (levelHtml += `<tr><td class="lv-num">-</td><td>${note}</td></tr>`),
        );
      }

      const levelTable = skillCard.querySelector(".level-table");
      if (levelHtml === "") {
        levelTable.style.display = "none";
      } else {
        levelTable.style.display = "table";
        levelTable.querySelector("tbody").innerHTML = levelHtml;
      }

      skillCard.classList.add("show");
    });

    node.addEventListener("mouseleave", () =>
      skillCard.classList.remove("show"),
    );
    skillTreeArea.appendChild(node);
  });
}
