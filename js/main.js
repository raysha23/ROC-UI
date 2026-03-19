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