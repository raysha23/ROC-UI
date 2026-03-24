// File Path: js/ui/skill-renderer.js
import {
  skillLayout,
  skillData,
  skillInfo,
  skillConnections,
} from "../data/skill-data.js";
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

  // Reset character layout classes
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

  skillTreeArea.style.position = "relative";
  skillTreeArea.style.overflow = "visible"; // allow lines outside

  // ================= SVG =================
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("skill-connectors-svg");
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none"; // avoid blocking clicks
  svg.style.zIndex = "0"; // behind nodes
  skillTreeArea.appendChild(svg);

  // ================= DATA =================
  const skillKeys = (skillData[character] || []).map((f) =>
    f.replace(".png", "")
  );

  const connKey = character.charAt(0).toUpperCase() + character.slice(1);
  const charConns = skillConnections[connKey] || [];
  const connMap = new Map();
  charConns.forEach(([from, to]) => {
    const arr = connMap.get(to) || [];
    arr.push({ skill: from, lv: 1 });
    connMap.set(to, arr);
  });

  function getReqList(key) {
    const infoReq = skillInfo[key]?.req ? [...skillInfo[key].req] : [];
    const connReq = connMap.get(key) || [];
    const merged = [...infoReq];
    connReq.forEach((cr) => {
      if (!merged.some((m) => m.skill === cr.skill)) merged.push(cr);
    });
    return merged.length > 0 ? merged : null;
  }

  // ================= NODES =================
  const nodesMap = new Map();
  skillKeys.forEach((skillKey) => {
    const skillFile = skillData[character].find(
      (f) => f.replace(".png", "") === skillKey
    );
    const info = skillInfo[skillKey];

    if (state.characterSkillLevels[skillKey] === undefined)
      state.characterSkillLevels[skillKey] = 0;

    const reqs = getReqList(skillKey);
    const isLocked =
      reqs &&
      reqs.some((r) => (state.characterSkillLevels[r.skill] || 0) < r.lv);

    const pos = skillLayout[character]?.[skillKey];

    const node = document.createElement("div");
    node.classList.add("skill-node");
    node.classList.add(isLocked ? "is-locked" : "is-unlocked");
    if (state.characterSkillLevels[skillKey] > 0) node.classList.add("is-active");

    node.style.position = "absolute";
    node.style.zIndex = "10";

    // Use exact pixel position, no CSS transforms
    if (pos) {
      node.style.left = pos.x + "px";
      node.style.top = pos.y + "px";
    }

    const maxLv = info?.maxLv || 10;

    node.innerHTML = `
      <div class="skill-thumb-wrap">
        <img class="skill-thumb ${isLocked ? "locked-skill" : "active-skill"}"
          src="images/${character}-skilltree-images/${skillFile}">
        ${isLocked ? '<div class="skill-lock">🔒</div>' : ""}
      </div>
      <span class="skill-level">
        Lvl ${state.characterSkillLevels[skillKey]}/${maxLv}
      </span>
    `;

    // CLICK + HOVER
    node.addEventListener("click", () => {
      const reqs = getReqList(skillKey);
      const currentlyLocked =
        reqs &&
        reqs.some((r) => (state.characterSkillLevels[r.skill] || 0) < r.lv);

      if (currentlyLocked) {
        const neededMap = new Map();
        function dfs(key) {
          const rlist = getReqList(key);
          if (!rlist) return;
          for (const r of rlist) {
            const cur = state.characterSkillLevels[r.skill] || 0;
            const need = Math.max(0, r.lv - cur);
            if (need > 0)
              neededMap.set(r.skill, Math.max(need, neededMap.get(r.skill) || 0));
            dfs(r.skill);
          }
        }
        dfs(skillKey);

        let totalNeeded = 1 + [...neededMap.values()].reduce((a, b) => a + b, 0);
        if (state.skillPointsLeft >= totalNeeded) {
          [...neededMap.entries()].forEach(([k, v]) => {
            const maxForK = skillInfo[k]?.maxLv || 10;
            for (let i = 0; i < v; i++) incrementSkill(k, maxForK);
          });
          incrementSkill(skillKey, maxLv);
          updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
          renderSkills(character, elements);
        } else {
          jobLevelSelect?.classList.add("insufficient");
          setTimeout(() => jobLevelSelect?.classList.remove("insufficient"), 3000);
          node.classList.add("shake");
          setTimeout(() => node.classList.remove("shake"), 400);
        }
        return;
      }

      if (incrementSkill(skillKey, maxLv)) {
        updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
        renderSkills(character, elements);
      } else {
        jobLevelSelect?.classList.add("insufficient");
        setTimeout(() => jobLevelSelect?.classList.remove("insufficient"), 3000);
        node.classList.add("shake");
        setTimeout(() => node.classList.remove("shake"), 400);
      }
    });

    node.addEventListener("mouseenter", () => {
      if (!info) return;
      skillCard.querySelector(".header-main h2").innerHTML =
        `${info.title} <span class="skill-id">${info.id}</span>`;
      skillCard.querySelector(".skill-stats").innerHTML = `
        <tr>
          <th>Type</th><td>${info.type}</td>
          <th>Max Lv</th><td>${info.maxLv}</td>
        </tr>
        <tr>
          <th>Effect</th><td colspan="3">
            ${info.effect || "No description"}
          </td>
        </tr>
      `;
      skillCard.classList.add("show");
    });
    node.addEventListener("mouseleave", () => skillCard.classList.remove("show"));

    skillTreeArea.appendChild(node);
    nodesMap.set(skillKey, node);
  });

  // ================= DRAW LINES =================
  requestAnimationFrame(() => {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Helper: exact center relative to SVG
    function getNodeCenter(node) {
      const rect = node.getBoundingClientRect();
      const containerRect = svg.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    }

    skillKeys.forEach((skillKey) => {
      const reqs = getReqList(skillKey);
      if (!reqs) return;

      const toNode = nodesMap.get(skillKey);
      if (!toNode) return;
      const toCenter = getNodeCenter(toNode);

      reqs.forEach((r) => {
        const fromNode = nodesMap.get(r.skill);
        if (!fromNode) return;
        const fromCenter = getNodeCenter(fromNode);

        const line = document.createElementNS(svgNS, "line");
        const met = (state.characterSkillLevels[r.skill] || 0) >= r.lv;

        line.setAttribute("x1", fromCenter.x);
        line.setAttribute("y1", fromCenter.y);
        line.setAttribute("x2", toCenter.x);
        line.setAttribute("y2", toCenter.y);
        line.setAttribute("stroke", met ? "var(--gold-bright)" : "#555");
        line.setAttribute("stroke-width", met ? "4" : "3");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", met ? "0.95" : "0.5");

        svg.appendChild(line);
      });
    });
  });
}