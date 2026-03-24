import { initializeElements } from "./ui/ui-elements.js";
import { initializeStats } from "./systems/baselevel-system.js";
import { initializeUIEvents } from "./ui/ui-events.js";
import { updateDescription } from "./ui/ui-updates.js";
import { init as initSkills } from "./ui/skill-init.js";

// Application entrypoint
window.addEventListener("DOMContentLoaded", () => {
  initializeElements();

  const hasJobUI = !!document.querySelector('.job-item');

  if (hasJobUI) {
    initializeStats();
    initializeUIEvents();
    updateDescription("novice");
  }

  // If this page contains the skill tree area (or is the skill-page), initialize skills
  const isSkillPage = window.location.pathname.endsWith('skill-page.html') || !!document.querySelector('.skill-tree-area');
  if (isSkillPage) {
    try {
      initSkills();
    } catch (err) {
      console.error('Failed to initialize skills module:', err);
    }
  }
});

async function goToSkills() {
  const skillContainer = document.getElementById('skillContainer');

  const activeJob = document.querySelector('.job-item.active')?.dataset.job || 'novice';
  const maleBtn = document.getElementById('maleBtn');
  const gender = maleBtn && maleBtn.src && maleBtn.src.includes('maleactive') ? 'male' : 'female';

  const jobLevelEl = document.getElementById('jobLevel');
  let jobLevel = '1';
  if (jobLevelEl && jobLevelEl.value) {
    const jl = parseInt(jobLevelEl.value, 10);
    if (!isNaN(jl)) jobLevel = Math.max(1, Math.min(50, jl)).toString();
  }

  // If SPA container exists, load skill page fragments and animate in-place
  if (skillContainer) {
    try {
      // prevent double clicks
      if (skillContainer.dataset.loading === '1') return;
      skillContainer.dataset.loading = '1';

      // animate character move-left
      const charEl = document.querySelector('.character-selector') || document.querySelector('.hero-selection');
      if (charEl) {
        charEl.classList.add('move-left');
      }

      // small delay for character move before showing skill panel
      await new Promise((res) => setTimeout(res, 380));

      // fetch skill page and extract relevant parts
      const res = await fetch('skill-page.html');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const selectors = [
        '.class-icons',
        '.skill-tree-title',
        '.character-skill-container',
        '.skill-points-panel',
        '.job-level-panel',
        '.ro-skill-card'
      ];

      // ensure skill stylesheet is present
      if (!document.querySelector('link[href="css/skill-styles.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/skill-styles.css';
        document.head.appendChild(link);
      }

      skillContainer.innerHTML = '';
      selectors.forEach(sel => {
        const el = doc.querySelector(sel);
        if (!el) return;
        // remove hero images inside hero-selection-panel to avoid id conflicts
        if (sel === '.class-icons' && el.querySelectorAll) {
          // import as-is
        }
        const cloned = document.importNode(el, true);
        skillContainer.appendChild(cloned);
      });

      // show container with slide-in
      skillContainer.style.display = 'block';
      skillContainer.classList.add('skill-slide-in');

      // initialize skills (skill-init exports init as initSkills)
      try {
        initSkills();
      } catch (e) {
        console.error('Failed to initialize skills in SPA mode', e);
      }

      // done loading
      delete skillContainer.dataset.loading;
      return;
    } catch (err) {
      console.error('SPA load failed, falling back to full navigation', err);
      // fallback to navigation below
    }
  }

  // Fallback: full-page navigation with exit animation
  const wrapper = document.getElementById('pageWrapper') || document.body;
  wrapper.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = `skill-page.html?job=${activeJob}&gender=${gender}&jobLevel=${jobLevel}`;
  }, 600);
}

window.goToSkills = goToSkills;

/* helper spinner animation */
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
document.head.appendChild(style);