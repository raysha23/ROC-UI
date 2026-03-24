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

  // Ensure area is positioned so absolute SVG lines align to it
  skillTreeArea.style.position = skillTreeArea.style.position || 'relative';

  // Remove any previous connector SVG
  const prevSvg = skillTreeArea.querySelector('.skill-connectors-svg');
  if (prevSvg) prevSvg.remove();

  // Create SVG container for connectors (behind nodes)
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('skill-connectors-svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = 0; // keep behind nodes
  skillTreeArea.appendChild(svg);

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

  // Keep mapping of skillKey -> DOM node so we can draw connectors later
  const nodesMap = new Map();
  const nodesOrder = [];

  // Build keys list for this character
  const skillKeys = (skillData[character] || []).map((f) => f.replace('.png', ''));
  const skillSet = new Set(skillKeys);

  // Compute dependency layer (distance from root) so we can place skills vertically
  const layerMemo = new Map();
  function computeLayerLocal(key) {
    if (layerMemo.has(key)) return layerMemo.get(key);
    const info = skillInfo[key];
    if (!info || !info.req) {
      layerMemo.set(key, 0);
      return 0;
    }
    let max = 0;
    for (const r of info.req) {
      if (!skillSet.has(r.skill)) continue; // external prereq treat as root
      max = Math.max(max, computeLayerLocal(r.skill) + 1);
    }
    layerMemo.set(key, max);
    return max;
  }
  skillKeys.forEach((k) => computeLayerLocal(k));

  // Precompute unlocked state and whether a skill has requirements
  const unlockedMap = new Map();
  const hasReqMap = new Map();
  skillKeys.forEach((key) => {
    const info = skillInfo[key];
    const hasReq = !!(info && info.req && info.req.length > 0);
    hasReqMap.set(key, hasReq);
    const unlocked = !(info && info.req && info.req.some((r) => (state.characterSkillLevels[r.skill] || 0) < r.lv));
    unlockedMap.set(key, unlocked);
  });

  // Sort: roots (no req) first (these will be "not gray"), then skills with req (gray).
  // Within the 'with req' group, place unlocked before locked, then lower layer first.
  const sortedKeys = [...skillKeys].sort((a, b) => {
    const aHas = hasReqMap.get(a) ? 1 : 0;
    const bHas = hasReqMap.get(b) ? 1 : 0;
    if (aHas !== bHas) return aHas - bHas; // no-req (0) before has-req (1)

    const ua = unlockedMap.get(a) ? 0 : 1;
    const ub = unlockedMap.get(b) ? 0 : 1;
    if (ua !== ub) return ua - ub; // unlocked first within group

    const la = layerMemo.get(a) || 0;
    const lb = layerMemo.get(b) || 0;
    if (la !== lb) return la - lb;
    return skillKeys.indexOf(a) - skillKeys.indexOf(b);
  });

  // Determine max layer among root/no-req group so we can offset dependent skills below them
  const maxRootLayer = Math.max(0, ...skillKeys.filter(k => !hasReqMap.get(k)).map(k => layerMemo.get(k) || 0));

  // track column usage per assigned grid row (so items at same layer go into separate columns)
  const rowCols = new Map();

  sortedKeys.forEach((skillKey) => {
    const skillFile = (skillData[character] || []).find((f) => f.replace('.png', '') === skillKey);
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

    if (state.characterSkillLevels[skillKey] === undefined)
      state.characterSkillLevels[skillKey] = 0;

    const maxLv = info?.maxLv || 10;
    const node = document.createElement('div');
    node.classList.add('skill-node');

    if (missingInfo) node.classList.add('missing-info');

    if (isRoot) node.classList.add('root-skill');

    if (info && info.req && info.req.length > 0) node.classList.add('has-req');

    if (locked) {
      node.classList.add('is-locked');
    } else {
      node.classList.add('is-unlocked');
      // connected indicates its prereqs are satisfied and should show gold line
      node.classList.add('connected');
    }

    if (state.characterSkillLevels[skillKey] > 0) {
      node.classList.add('is-active');
    }

    // Ensure nodes sit above the connector SVG
    node.style.position = node.style.position || 'relative';
    node.style.zIndex = 1;

    // include a lock overlay when locked
    node.innerHTML = `
      <div class="skill-thumb-wrap">
        <img class="skill-thumb ${locked ? "locked-skill" : "active-skill"}" src="images/${character}-skilltree-images/${skillFile}" alt="Skill">
        ${locked ? '<div class="skill-lock">🔒</div>' : ''}
        ${missingInfo ? '<div class="skill-missing">!</div>' : ''}
      </div>
      <span class="skill-level">Lvl ${state.characterSkillLevels[skillKey]}/${maxLv}</span>
    `;

    // If the layout is a grid (not novice) assign gridRow/gridColumn based on grouping
    if (!skillTreeArea.classList.contains('novice-layout')) {
      const hasReq = hasReqMap.get(skillKey);
      const layer = layerMemo.get(skillKey) || 0;
      // Roots occupy top rows starting at 1; dependent (has-req) skills are offset below roots
      const gridRowIndex = hasReq ? (maxRootLayer + 2 + layer) : (layer + 1);
      // assign a column index that increments per row so items don't overlap
      const colForRow = (rowCols.get(gridRowIndex) || 0) + 1;
      rowCols.set(gridRowIndex, colForRow);
      node.style.gridRow = gridRowIndex.toString();
      node.style.gridColumn = colForRow.toString();
    }

    // if missing info, slightly dim and add tooltip
    if (missingInfo) {
      node.title = `Missing definition for ${skillKey} — check skill-data.js keys`;
    }

    // Single click handler handles both locked (auto-purchase) and unlocked (+1) behavior
    node.addEventListener('click', async () => {
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
          node.classList.add('clicked');
          setTimeout(() => node.classList.remove('clicked'), 220);
        } else {
          // not enough points: give feedback (shake)
          node.classList.add('shake');
          setTimeout(() => node.classList.remove('shake'), 400);
        }
      } else {
        // unlocked: normal +1 purchase behavior
        if (incrementSkill(skillKey, maxLv)) {
          updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
          renderSkills(character, elements);
        } else {
          // not enough points
          node.classList.add('shake');
          setTimeout(() => node.classList.remove('shake'), 400);
        }
      }
    });

    // HOVER: always show info, but include unmet requirements when locked
    node.addEventListener('mouseenter', () => {
      if (!info || !skillCard) return;
      skillCard.querySelector('.header-main h2').innerHTML =
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

      skillCard.querySelector('.skill-stats').innerHTML = statsHtml;

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

      const levelTable = skillCard.querySelector('.level-table');
      if (levelHtml === "") {
        levelTable.style.display = 'none';
      } else {
        levelTable.style.display = 'table';
        levelTable.querySelector('tbody').innerHTML = levelHtml;
      }

      skillCard.classList.add('show');
    });

    node.addEventListener('mouseleave', () =>
      skillCard.classList.remove('show'),
    );

    // append node and store mapping for connectors
    skillTreeArea.appendChild(node);
    nodesMap.set(skillKey, node);
    nodesOrder.push(skillKey);
  });

  // After DOM nodes are placed, draw connector lines between prereq -> target
  requestAnimationFrame(() => {
    // remove any existing lines inside svg (fresh redraw)
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const areaRect = skillTreeArea.getBoundingClientRect();

    for (const skillKey of nodesOrder) {
      const info = skillInfo[skillKey];
      if (!info || !info.req) continue;
      const targetNode = nodesMap.get(skillKey);
      if (!targetNode) continue;

      const toRect = targetNode.getBoundingClientRect();
      const toX = toRect.left - areaRect.left + toRect.width / 2;
      const toY = toRect.top - areaRect.top + toRect.height / 2;

      for (const r of info.req) {
        const fromNode = nodesMap.get(r.skill);
        if (!fromNode) continue; // missing prereq node (skill may not belong to this tree)

        const fromRect = fromNode.getBoundingClientRect();
        const fromX = fromRect.left - areaRect.left + fromRect.width / 2;
        const fromY = fromRect.top - areaRect.top + fromRect.height / 2;

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        const met = (state.characterSkillLevels[r.skill] || 0) >= r.lv;
        line.setAttribute('stroke', met ? 'var(--gold-bright)' : '#555');
        line.setAttribute('stroke-width', met ? '4' : '3');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', met ? '0.95' : '0.5');
        svg.appendChild(line);
      }
    }
  });
}
