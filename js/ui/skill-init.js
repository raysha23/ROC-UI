//File Path: js/ui/skill-init.js
import {
  skillData,
  characterImages,
  characterMessages,
  skillTreeTitles,
} from "../data/skill-data.js";
import { state, resetState } from "../state/skill-state.js";
import {
  populateJobLevels,
  updatePoints,
  typeMessage,
} from "../systems/skill-utils.js";
import { renderSkills } from "../ui/skill-renderer.js";

export function init() {
  const classIcons = document.querySelectorAll(".class-icons img");
  const heroImage = document.getElementById("heroImage");
  const heroShadow = document.getElementById("heroShadow");
  const messageText = document.querySelector(".message-text");
  const skillTreeTitle = document.querySelector(".skill-tree-title");

  // DOM elements used by renderer and utils
  const jobLevelSelect = document.getElementById("jobLevel");
  const skillTreeArea = document.querySelector(".skill-tree-area");
  const skillCard = document.querySelector(".ro-skill-card");
  const pointsLeftInput = document.getElementById("pointsLeft");
  const pointsUsedInput = document.getElementById("pointsUsed");

  // mouse follow for card
 document.addEventListener("mousemove", (e) => {
  if (skillCard && skillCard.classList.contains("show")) {
    skillCard.style.left =
      e.clientX - skillCard.offsetWidth - 20 + "px";

    skillCard.style.top =
      e.clientY - skillCard.offsetHeight / 2 + "px";
  }
});

  // Populate job levels for skill page: clamp to 1-50 (job level depends on home page)
  populateJobLevels(jobLevelSelect, 1, 50);
  jobLevelSelect.addEventListener("change", () =>
    updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput),
  );

  let currentGender = "male";
  function updateHeroImages(charName) {
    if (currentGender === "male") {
      heroImage.src = characterImages[charName].hero;
      heroShadow.src = characterImages[charName].shadow;
    } else {
      heroImage.src = characterImages[charName].femaleHero;
      heroShadow.src = characterImages[charName].femaleShadow;
    }
  }

  function updateSkillTreeTitle(title) {
    skillTreeTitle.style.opacity = 0;
    setTimeout(() => {
      skillTreeTitle.textContent = title;
      skillTreeTitle.style.opacity = 1;
    }, 300);
  }

  // Startup Init
  const urlParams = new URLSearchParams(window.location.search);
  const selectedJob = urlParams.get("job") || "novice";
  currentGender = urlParams.get("gender") || "male";
  // Accept jobLevel passed from home page; clamp 1-50
  const urlJobLevel = parseInt(urlParams.get("jobLevel"), 10);
  const initialJobLevel = !isNaN(urlJobLevel)
    ? Math.max(1, Math.min(50, urlJobLevel))
    : 50;
  if (jobLevelSelect) jobLevelSelect.value = initialJobLevel;
  // Update points UI based on initial job level
  updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);

  const maleBtn = document.getElementById("maleBtn");
  const femaleBtn = document.getElementById("femaleBtn");
  maleBtn.src =
    currentGender === "male"
      ? "images/maleactive.png"
      : "images/maleinactive.png";
  femaleBtn.src =
    currentGender === "female"
      ? "images/femaleactive.png"
      : "images/femaleinactive.png";

  classIcons.forEach((icon) => {
    const charName = icon.dataset.character;
    if (charName === selectedJob) {
      icon.src = characterImages[charName].active;
      icon.classList.add("active");
      updateHeroImages(charName);
      typeMessage(messageText, characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);
      renderSkills(charName, {
        skillTreeArea,
        skillCard,
        jobLevelSelect,
        pointsLeftInput,
        pointsUsedInput,
      });
    } else {
      icon.src = characterImages[charName].inactive;
    }
    icon.addEventListener("click", () => {
      // ✅ RESET EVERYTHING
      resetState();

      // ✅ FORCE JOB LEVEL TO 50
      jobLevelSelect.value = 50;

      // ✅ RECALCULATE POINTS BASED ON 50
      updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);

      // ================= EXISTING CODE =================
      classIcons.forEach(
        (i) => (i.src = characterImages[i.dataset.character].inactive),
      );

      icon.src = characterImages[charName].active;

      document
        .querySelector(".class-icons img.active")
        ?.classList.remove("active");

      icon.classList.add("active");

      updateHeroImages(charName);
      typeMessage(messageText, characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);

      renderSkills(charName, {
        skillTreeArea,
        skillCard,
        jobLevelSelect,
        pointsLeftInput,
        pointsUsedInput,
      });
    });
  });

  maleBtn.addEventListener("click", () => {
    maleBtn.src = "images/maleactive.png";
    femaleBtn.src = "images/femaleinactive.png";
    currentGender = "male";
    updateHeroImages(
      document.querySelector(".class-icons img.active").dataset.character,
    );
  });
  femaleBtn.addEventListener("click", () => {
    femaleBtn.src = "images/femaleactive.png";
    maleBtn.src = "images/maleinactive.png";
    currentGender = "female";
    updateHeroImages(
      document.querySelector(".class-icons img.active").dataset.character,
    );
  });

  // Reset button
  const btn = document.getElementById("resetSkills");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Reset all skill points?")) {
        resetState();
        updatePoints(jobLevelSelect, state, pointsLeftInput, pointsUsedInput);
        const activeIcon = document.querySelector(".class-icons img.active");
        const activeChar = activeIcon ? activeIcon.dataset.character : "novice";
        if (skillTreeArea) skillTreeArea.innerHTML = "";
        renderSkills(activeChar, {
          skillTreeArea,
          skillCard,
          jobLevelSelect,
          pointsLeftInput,
          pointsUsedInput,
        });
      }
    });
  }
}
