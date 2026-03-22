import { initializeElements } from "./ui/ui-elements.js";
import { initializeStats } from "./systems/baselevel-system.js";
import { initializeUIEvents } from "./ui/ui-events.js";
import { updateDescription } from "./ui/ui-updates.js";
// Application entrypoint
window.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  initializeStats();
  initializeUIEvents();
  updateDescription("novice");
});


// ✅ ADD THIS FUNCTION
function goToSkills() {
  // Get selected job
  const activeJob = document.querySelector(".job-item.active")?.dataset.job || "novice";
  
  // Get selected gender
  const maleBtn = document.getElementById("maleBtn");
  const gender = maleBtn.src.includes("maleactive") ? "male" : "female";

  // Redirect with query params (relative path)
  window.location.href = `./skill-folder/skill-page.html?job=${activeJob}&gender=${gender}`;
}

// ✅ MAKE IT GLOBAL (IMPORTANT for onclick to work)
window.goToSkills = goToSkills;