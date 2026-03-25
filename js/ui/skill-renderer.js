//File path: js/ui/skill-renderer.js
// ================= IMPORTS =================
import {
  skillLayout,
  skillData,
  skillInfo,
  skillConnections,
} from "../data/skill-data.js";

import { state, incrementSkill } from "../state/skill-state.js";
import { updatePoints } from "../systems/skill-utils.js";

// ================= MAIN RENDER FUNCTION =================
export function renderSkills(character, elements) {
  const {
    skillTreeArea,
    skillCard,
    jobLevelSelect,
    pointsLeftInput,
    pointsUsedInput,
  } = elements;

  resetTree(skillTreeArea, character);

  const svg = createSVG(skillTreeArea);

  const skillKeys = getSkillKeys(character);
  const connMap = buildConnectionMap(character);

  const nodesMap = new Map();

  // ================= CREATE NODES =================
  skillKeys.forEach((skillKey) => {
    const node = createSkillNode({
      skillKey,
      character,
      skillTreeArea,
      skillCard,
      jobLevelSelect,
      pointsLeftInput,
      pointsUsedInput,
      connMap,
    });

    skillTreeArea.appendChild(node);
    nodesMap.set(skillKey, node);
  });

  // ================= DRAW CONNECTIONS =================
  drawConnections(svg, skillKeys, nodesMap, connMap);
}

// ================= RESET TREE =================
function resetTree(skillTreeArea, character) {
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

  skillTreeArea.style.position = "relative";
  skillTreeArea.style.overflow = "visible";
}

// ================= SVG CREATION =================
function createSVG(container) {
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("skill-connectors-svg");

  Object.assign(svg.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "0",
  });

  container.appendChild(svg);
  return svg;
}

// ================= DATA HELPERS =================
function getSkillKeys(character) {
  return (skillData[character] || []).map((f) => f.replace(".png", ""));
}

function buildConnectionMap(character) {
  const connKey = character.charAt(0).toUpperCase() + character.slice(1);
  const charConns = skillConnections[connKey] || [];

  const map = new Map();

  charConns.forEach(([from, to]) => {
    const arr = map.get(to) || [];
    arr.push({ skill: from, lv: 1 });
    map.set(to, arr);
  });

  return map;
}

function getRequirements(skillKey, connMap) {
  const infoReq = skillInfo[skillKey]?.req || [];
  const connReq = connMap.get(skillKey) || [];

  const merged = [...infoReq];

  connReq.forEach((cr) => {
    if (!merged.some((m) => m.skill === cr.skill)) {
      merged.push(cr);
    }
  });

  return merged.length ? merged : null;
}

// ================= NODE CREATION =================
function createSkillNode(config) {
  const {
    skillKey,
    character,
    skillTreeArea,
    skillCard,
    jobLevelSelect,
    pointsLeftInput,
    pointsUsedInput,
    connMap,
  } = config;

  const skillFile = skillData[character].find(
    (f) => f.replace(".png", "") === skillKey,
  );

  const info = skillInfo[skillKey];
  const maxLv = info?.maxLv || 10;

  if (state.characterSkillLevels[skillKey] === undefined) {
    state.characterSkillLevels[skillKey] = 0;
  }
  console.log("CLICK:", skillKey);

  const reqs = getRequirements(skillKey, connMap);

  const isLocked =
    reqs && reqs.some((r) => (state.characterSkillLevels[r.skill] || 0) < r.lv);

  console.log("Is Locked?", isLocked);
  console.log("Current Levels:", state.characterSkillLevels);
  const pos = skillLayout[character]?.[skillKey];

  const node = document.createElement("div");
  node.classList.add("skill-node");
  node.classList.add(isLocked ? "is-locked" : "is-unlocked");

  if (state.characterSkillLevels[skillKey] > 0) {
    node.classList.add("is-active");
  }

  Object.assign(node.style, {
    position: "absolute",
    zIndex: "10",
    left: pos?.x + "px",
    top: pos?.y + "px",
  });

  const level = state.characterSkillLevels[skillKey] || 0;

  let skillClass = "locked-skill";

  if (level > 0) {
    skillClass = "active-skill"; // ✅ highest priority
  } else if (!isLocked) {
    skillClass = "unlocked-skill";
  }

  node.innerHTML = `
  <div class="skill-thumb-wrap">
    <img class="skill-thumb ${skillClass}"
      src="images/${character}-skilltree-images/${skillFile}">
    ${isLocked ? '<div class="skill-lock">🔒</div>' : ""}
  </div>
  <span class="skill-level">
    Lvl ${level}/${maxLv}
  </span>
`;
  attachNodeEvents({
    node,
    skillKey,
    maxLv,
    info,
    skillCard,
    jobLevelSelect,
    pointsLeftInput,
    pointsUsedInput,
    connMap,
    character,
  });

  return node;
}

// ================= NODE EVENTS =================
function attachNodeEvents(config) {
  const {
    node,
    skillKey,
    maxLv,
    info,
    skillCard,
    jobLevelSelect,
    pointsLeftInput,
    pointsUsedInput,
    connMap,
    character,
  } = config;

  node.addEventListener("click", () => {
    skillCard.classList.remove("show");
    handleSkillClick(
      skillKey,
      maxLv,
      jobLevelSelect,
      pointsLeftInput,
      pointsUsedInput,
      connMap,
      character,
    );
  });

  node.addEventListener("mouseenter", () => {
    showSkillCard(node, info, skillCard);
  });

  node.addEventListener("mouseleave", () => {
    skillCard.classList.remove("show");
  });
}
function fulfillRequirements(skillKey, connMap) {
  const reqs = getRequirements(skillKey, connMap);
  if (!reqs) return true;

  for (const r of reqs) {
    let currentLv = state.characterSkillLevels[r.skill] || 0;

    // 🔁 FIRST: fulfill THIS skill's own requirements
    const ok = fulfillRequirements(r.skill, connMap);
    if (!ok) return false;

    // 🔁 THEN: raise level to required
    while (currentLv < r.lv) {
      const success = incrementSkill(r.skill, skillInfo[r.skill]?.maxLv || 10);

      if (!success) return false;

      currentLv++;
    }
  }

  return true;
}

// ================= CLICK LOGIC =================
function handleSkillClick(
  skillKey,
  maxLv,
  jobLevelSelect,
  pointsLeftInput,
  pointsUsedInput,
  connMap,
  character,
) {
  const reqs = getRequirements(skillKey, connMap);

  // ================= AUTO UNLOCK (RECURSIVE) =================
  const ok = fulfillRequirements(skillKey, connMap);

  if (!ok) {
    shakeUI(jobLevelSelect);
    return;
  }

  // ================= APPLY TARGET SKILL =================
  if (incrementSkill(skillKey, maxLv)) {
    updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);

    renderSkills(character, {
      skillTreeArea: document.querySelector(".skill-tree-area"),
      skillCard: document.querySelector(".ro-skill-card"),
      jobLevelSelect,
      pointsLeftInput,
      pointsUsedInput,
    });
  } else {
    shakeUI(jobLevelSelect);
  }
}

// ================= SKILL CARD =================
function showSkillCard(node, info, skillCard) {
  if (!info || !skillCard) return;

  // CONTENT
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

  // ONLY SHOW
  skillCard.classList.add("show");
  skillCard.style.position = "fixed";
  skillCard.style.visibility = "visible";
}
// ================= DRAW CONNECTIONS =================
function drawConnections(svg, skillKeys, nodesMap, connMap) {
  const svgNS = "http://www.w3.org/2000/svg";

  requestAnimationFrame(() => {
    svg.innerHTML = "";

    function getCenter(node) {
      const rect = node.getBoundingClientRect();
      const containerRect = svg.getBoundingClientRect();

      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    }

    skillKeys.forEach((key) => {
      const reqs = getRequirements(key, connMap);
      if (!reqs) return;

      const toNode = nodesMap.get(key);
      if (!toNode) return;

      const toCenter = getCenter(toNode);

      reqs.forEach((r) => {
        const fromNode = nodesMap.get(r.skill);
        if (!fromNode) return;

        const fromCenter = getCenter(fromNode);

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

// ================= UTIL =================
function shakeUI(el) {
  el?.classList.add("insufficient");
  setTimeout(() => el?.classList.remove("insufficient"), 3000);
}
