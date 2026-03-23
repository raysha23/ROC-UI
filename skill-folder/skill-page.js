window.addEventListener("load", () => {
  const classIcons = document.querySelectorAll(".class-icons img");
  const heroImage = document.getElementById("heroImage");
  const heroShadow = document.getElementById("heroShadow");
  const messageText = document.querySelector(".message-text");
  const skillTreeTitle = document.querySelector(".skill-tree-title");

  // Skill Points & Level Tracking
  const pointsLeftInput = document.getElementById("pointsLeft");
  const pointsUsedInput = document.getElementById("pointsUsed");
  let skillPointsUsed = 0;
  let skillPointsLeft = 39; // Default for Job Level 40
  let characterSkillLevels = {}; // Stores { 'NoviceBasicSkill': 0, ... }

  // Job Level Select
  const jobLevelSelect = document.getElementById("jobLevel");

  // Skill Tree Container
  const skillTreeArea = document.querySelector(".skill-tree-area");

  // Skill Card
  const skillCard = document.querySelector(".ro-skill-card");

  // Skill Card follow mouse
  document.addEventListener("mousemove", function (e) {
    if (skillCard && skillCard.classList.contains("show")) {
      skillCard.style.top = e.clientY + 20 + "px";
      skillCard.style.left = e.clientX + 20 + "px";
    }
  });

  // Populate Job Levels & Handle Point Calculation
  function populateJobLevels(min = 40, max = 255) {
    jobLevelSelect.innerHTML = "";
    for (let i = min; i <= max; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      jobLevelSelect.appendChild(option);
    }
    updatePoints();
  }

  function updatePoints() {
    const jobLv = parseInt(jobLevelSelect.value);
    const totalPointsEarned = jobLv - 1;
    skillPointsLeft = totalPointsEarned - skillPointsUsed;

    pointsLeftInput.value = skillPointsLeft;
    pointsUsedInput.value = skillPointsUsed;
  }

  jobLevelSelect.addEventListener("change", updatePoints);

  // Skill Data Mapping
  const skillData = {
    novice: [
      "NoviceBasicSkill.png",
      "NoviceFirstAid.png",
      "NoviceTrickDead.png",
    ],
    swordsman: [
      "SwordsmanSwordMastery.png",
      "SwordsmanIncreaseRP.png",
      "SwordsmanBash.png",
      "SwordsmanProvoke.png",
      "SwordsmanMovingHP.png",
      "SwordsmanFatalBlow.png",
      "SwordsmanAutoBerserk.png",
      "SwordsmanTwoHandedSM.png",
      "SwordsmanMagnumBreak.png",
      "SwordsmanEndure.png",
    ],
    magician: [
      "MagicianIncreaseSPRecovery.png",
      "MagicianSight.png",
      "MagicianNepalmBeat.png",
      "MagicianColdBolt.png",
      "MagicianStoneCurse.png",
      "MagicianFireBolt.png",
      "MagicianLightningBolt.png",
      "MagicianEnergyCoat.png",
      "MagicianSoulStrike.png",
      "MagicianSafetyWall.png",
      "MagicianFrostDiver.png",
      "MagicianFireBall.png",
      "MagicianFireWall.png",
      "MagicianThunderStorm.png",
    ],
    archer: [
      "ArcherOwlsEye.png",
      "ArcherDoubleStrafing.png",
      "ArcherMakingArrow.png",
      "ArcherChargeArrow.png",
      "ArcherVulturesEye.png",
      "ArcherAttentionConcentrate.png",
      "ArcherArrowShower.png",
    ],
    acolyte: [
      "AcolyteDivineProtection.png",
      "AcolyteRuwach.png",
      "AcolyteHeal.png",
      "AcolyteAquaBenedicta.png",
      "AcolyteHolyLight.png",
      "AcolyteDemonBane.png",
      "AcolyteTeleportation.png",
      "AcolyteWarpPortal.png",
      "AcolytePneuma.png",
      "AcolyteIncreaseAgility.png",
      "AcolyteDecreaseAgility.png",
      "AcolyteSignumCrucis.png",
      "AcolyteAngelus.png",
      "AcolyteBlessing.png",
      "AcolyteCure.png",
    ],
    merchant: [
      "MerchantEnlargeWL.png",
      "MerchantIdentify.png",
      "MerchantMammonite.png",
      "MerchantCartRevolution.png",
      "MerchantChangeCart.png",
      "MerchantLoudExclamation.png",
      "MerchantCartDecoration.png",
      "MerchantDiscount.png",
      "MerchantOvercharge.png",
      "MerchantPushcart.png",
      "MerchantVending.png",
      "MerchantBuyingStore.png",
    ],
    thief: [
      "ThiefDoubleAttack.png",
      "ThiefIncreaseDodge.png",
      "ThiefSteal.png",
      "ThiefEnvenom.png",
      "ThiefSprinkleSand.png",
      "ThiefBackSliding.png",
      "ThiefPickStone.png",
      "ThiefThrowStone.png",
      "ThiefHiding.png",
      "ThiefDetoxify.png",
    ],
  };

  // --- LOGIC ADDED HERE: Detailed Skill Info with Requirements ---
  const skillInfo = {
    // NOVICE
    NoviceBasicSkill: {
      title: "Basic Skill",
      id: "1",
      type: "Passive",
      maxLv: 9,
      effect: "Basic interface skills.",
      levels: [],
    },
    NoviceFirstAid: {
      title: "First Aid",
      id: "142",
      type: "Quest",
      maxLv: 1,
      effect: "Heal 5 HP.",
      levels: [],
    },
    NoviceTrickDead: {
      title: "Trick Dead",
      id: "143",
      type: "Quest",
      maxLv: 1,
      req: [{ skill: "NoviceBasicSkill", lv: 7 }],
      effect: "Avoid monsters.",
      levels: [],
    },

    // SWORDSMAN (prefixed keys)
    SwordsmanSwordMastery: {
      title: "Sword Mastery",
      id: "50",
      maxLv: 10,
      type: "Passive",
    },
    SwordsmanIncreaseRP: {
      title: "Increase Recuperative Power",
      id: "52",
      maxLv: 10,
      type: "Passive",
    },
    SwordsmanBash: { title: "Bash", id: "53", maxLv: 10, type: "Active" },
    SwordsmanProvoke: { title: "Provoke", id: "55", maxLv: 10, type: "Active" },
    SwordsmanMovingHP: {
      title: "Moving HP Recovery",
      id: "1001",
      maxLv: 1,
      type: "Quest",
    },
    SwordsmanFatalBlow: {
      title: "Fatal Blow",
      id: "1002",
      maxLv: 1,
      type: "Quest",
    },
    SwordsmanAutoBerserk: {
      title: "Auto Berserk",
      id: "1003",
      maxLv: 1,
      type: "Quest",
    },
    SwordsmanTwoHandedSM: {
      title: "Two-Handed Sword Mastery",
      id: "51",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "SwordsmanSwordMastery", lv: 1 }],
    },
    SwordsmanMagnumBreak: {
      title: "Magnum Break",
      id: "54",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "SwordsmanBash", lv: 5 }],
    },
    SwordsmanEndure: {
      title: "Endure",
      id: "56",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "SwordsmanProvoke", lv: 5 }],
    },

    // MAGICIAN (prefixed keys)
    MagicianIncreaseSPRecovery: {
      title: "Increase SP Recovery",
      id: "1",
      maxLv: 10,
      type: "Passive",
    },
    MagicianSight: { title: "Sight", id: "2", maxLv: 1, type: "Active" },
    MagicianNapalmBeat: {
      title: "Napalm Beat",
      id: "3",
      maxLv: 10,
      type: "Active",
    },
    MagicianColdBolt: {
      title: "Cold Bolt",
      id: "4",
      maxLv: 10,
      type: "Active",
    },
    MagicianStoneCurse: {
      title: "Stone Curse",
      id: "5",
      maxLv: 10,
      type: "Active",
    },
    MagicianFireBolt: {
      title: "Fire Bolt",
      id: "6",
      maxLv: 10,
      type: "Active",
    },
    MagicianLightningBolt: {
      title: "Lightning Bolt",
      id: "7",
      maxLv: 10,
      type: "Active",
    },
    MagicianEnergyCoat: {
      title: "Energy Coat",
      id: "1004",
      maxLv: 1,
      type: "Quest",
    },
    MagicianSoulStrike: {
      title: "Soul Strike",
      id: "8",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "MagicianNapalmBeat", lv: 4 }],
    },
    MagicianSafetyWall: {
      title: "Safety Wall",
      id: "9",
      maxLv: 10,
      type: "Active",
      req: [
        { skill: "MagicianSoulStrike", lv: 5 },
        { skill: "MagicianNapalmBeat", lv: 5 },
      ],
    },
    MagicianFrostDiver: {
      title: "Frost Diver",
      id: "10",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "MagicianColdBolt", lv: 5 }],
    },
    MagicianFireBall: {
      title: "Fire Ball",
      id: "11",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "MagicianFireBolt", lv: 4 }],
    },
    MagicianFireWall: {
      title: "Fire Wall",
      id: "12",
      maxLv: 10,
      type: "Active",
      req: [
        { skill: "MagicianMagicianSight", lv: 1 },
        { skill: "MagicianFireBall", lv: 5 },
      ],
    },
    MagicianThunderStorm: {
      title: "Thunder Storm",
      id: "13",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "MagicianLightningBolt", lv: 4 }],
    },

    // ARCHER (prefixed keys)
    ArcherOwlsEye: {
      title: "Owl's Eye",
      id: "43",
      maxLv: 10,
      type: "Passive",
      levels: [],
      effect: "",
    },
    ArcherDoubleStrafing: {
      title: "Double Strafing",
      id: "44",
      maxLv: 10,
      type: "Active",
      levels: [],
      effect: "",
    },
    ArcherMakingArrow: {
      title: "Making Arrow",
      id: "1005",
      maxLv: 1,
      type: "Quest",
      levels: [],
      effect: "",
    },
    ArcherChargeArrow: {
      title: "Charge Arrow",
      id: "1006",
      maxLv: 1,
      type: "Quest",
      levels: [],
      effect: "",
    },
    ArcherVulturesEye: {
      title: "Vulture's Eye",
      id: "45",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "ArcherOwlsEye", lv: 3 }],
      levels: [],
      effect: "",
    },
    ArcherAttentionConcentrate: {
      title: "Attention Concentrate",
      id: "46",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "ArcherVulturesEye", lv: 1 }],
      levels: [],
      effect: "",
    },
    ArcherArrowShower: {
      title: "Arrow Shower",
      id: "47",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "ArcherDoubleStrafing", lv: 5 }],
      levels: [],
      effect: "",
    },

    // ACOLYTE (prefixed keys)
    AcolyteDivineProtection: {
      title: "Divine Protection",
      id: "24",
      maxLv: 10,
      type: "Passive",
    },
    AcolyteRuwach: { title: "Ruwach", id: "25", maxLv: 1, type: "Active" },
    AcolyteHeal: { title: "Heal", id: "26", maxLv: 10, type: "Active" },
    AcolyteAquaBenedicta: {
      title: "Aqua Benedicta",
      id: "27",
      maxLv: 1,
      type: "Active",
    },
    AcolyteHolyLight: {
      title: "Holy Light",
      id: "1007",
      maxLv: 1,
      type: "Quest",
    },
    AcolyteDemonBane: {
      title: "Demon Bane",
      id: "28",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "AcolyteDivineProtection", lv: 3 }],
    },
    AcolyteTeleportation: {
      title: "Teleportation",
      id: "29",
      maxLv: 2,
      type: "Active",
      req: [{ skill: "AcolyteRuwach", lv: 1 }],
    },
    AcolyteWarpPortal: {
      title: "Warp Portal",
      id: "30",
      maxLv: 4,
      type: "Active",
      req: [{ skill: "AcolyteTeleportation", lv: 2 }],
    },
    AcolytePneuma: {
      title: "Pneuma",
      id: "31",
      maxLv: 1,
      type: "Active",
      req: [{ skill: "AcolyteWarpPortal", lv: 4 }],
    },
    AcolyteIncreaseAgility: {
      title: "Increase Agility",
      id: "32",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "AcolyteHeal", lv: 3 }],
    },
    AcolyteDecreaseAgility: {
      title: "Decrease Agility",
      id: "33",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "AcolyteIncreaseAgility", lv: 1 }],
    },
    AcolyteSignumCrucis: {
      title: "Signum Crucis",
      id: "34",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "AcolyteDemonBane", lv: 3 }],
    },
    AcolyteAngelus: {
      title: "Angelus",
      id: "35",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "AcolyteDivineProtection", lv: 3 }],
    },
    AcolyteBlessing: {
      title: "Blessing",
      id: "36",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "AcolyteDivineProtection", lv: 5 }],
    },
    AcolyteCure: {
      title: "Cure",
      id: "37",
      maxLv: 1,
      type: "Active",
      req: [{ skill: "AcolyteHeal", lv: 2 }],
    },

    // MERCHANT (prefixed keys)
    MerchantEnlargeWeightLimit: {
      title: "Enlarge Weight Limit",
      id: "38",
      maxLv: 10,
      type: "Passive",
    },
    MerchantIdentify: { title: "Identify", id: "39", maxLv: 1, type: "Active" },
    MerchantMammonite: {
      title: "Mammonite",
      id: "40",
      maxLv: 10,
      type: "Active",
    },
    MerchantCartRevolution: {
      title: "Cart Revolution",
      id: "1008",
      maxLv: 1,
      type: "Quest",
    },
    MerchantChangeCart: {
      title: "Change Cart",
      id: "1009",
      maxLv: 1,
      type: "Quest",
    },
    MerchantLoudExclamation: {
      title: "Loud Exclamation",
      id: "1010",
      maxLv: 1,
      type: "Quest",
    },
    MerchantCartDecoration: {
      title: "Cart Decoration",
      id: "1011",
      maxLv: 1,
      type: "Quest",
    },
    MerchantDiscount: {
      title: "Discount",
      id: "41",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "MerchantEnlargeWeightLimit", lv: 3 }],
    },
    MerchantOvercharge: {
      title: "Overcharge",
      id: "42",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "MerchantDiscount", lv: 3 }],
    },
    MerchantPushcart: {
      title: "Pushcart",
      id: "43",
      maxLv: 10,
      type: "Passive",
      req: [{ skill: "MerchantEnlargeWeightLimit", lv: 5 }],
    },
    MerchantVending: {
      title: "Vending",
      id: "44",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "MerchantPushcart", lv: 3 }],
    },
    MerchantBuyingStore: {
      title: "Buying Store",
      id: "45",
      maxLv: 1,
      type: "Active",
      req: [{ skill: "MerchantVending", lv: 1 }],
    },

    // THIEF (prefixed keys)
    ThiefDoubleAttack: {
      title: "Double Attack",
      id: "46",
      maxLv: 10,
      type: "Passive",
    },
    ThiefIncreaseDodge: {
      title: "Increase Dodge",
      id: "47",
      maxLv: 10,
      type: "Passive",
    },
    ThiefSteal: { title: "Steal", id: "48", maxLv: 10, type: "Active" },
    ThiefEnvenom: { title: "Envenom", id: "49", maxLv: 10, type: "Active" },
    ThiefSprinkleSand: {
      title: "Sprinkle Sand",
      id: "1012",
      maxLv: 1,
      type: "Quest",
    },
    ThiefBackSliding: {
      title: "Back Sliding",
      id: "1013",
      maxLv: 1,
      type: "Quest",
    },
    ThiefPickStone: {
      title: "Pick Stone",
      id: "1014",
      maxLv: 1,
      type: "Quest",
    },
    ThiefThrowStone: {
      title: "Throw Stone",
      id: "1015",
      maxLv: 1,
      type: "Quest",
    },
    ThiefHiding: {
      title: "Hiding",
      id: "50",
      maxLv: 10,
      type: "Active",
      req: [{ skill: "ThiefSteal", lv: 5 }],
    },
    ThiefDetoxify: {
      title: "Detoxify",
      id: "51",
      maxLv: 1,
      type: "Active",
      req: [{ skill: "ThiefEnvenom", lv: 3 }],
    },
  };

  // --- LOGIC UPDATED HERE: Prerequisite-aware rendering ---
  function renderSkills(character) {
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

    skillData[character].forEach((skillFile) => {
      const skillKey = skillFile.replace(".png", "");
      const info = skillInfo[skillKey];

      // PREREQUISITE FILTER: Don't draw the icon if conditions aren't met
      if (info && info.req) {
        const allMet = info.req.every(
          (r) => (characterSkillLevels[r.skill] || 0) >= r.lv,
        );
        if (!allMet) return; // Skip this skill
      }

      if (characterSkillLevels[skillKey] === undefined)
        characterSkillLevels[skillKey] = 0;

      const maxLv = info?.maxLv || 10;
      const node = document.createElement("div");
      node.classList.add("skill-node");
      node.innerHTML = `
        <img src="skill-images/${character}-skilltree-images/${skillFile}" alt="Skill">
        <span class="skill-level">Lvl ${characterSkillLevels[skillKey]}/${maxLv}</span>
      `;

      // CLICK TO LEVEL UP
      node.addEventListener("click", () => {
        if (skillPointsLeft > 0 && characterSkillLevels[skillKey] < maxLv) {
          characterSkillLevels[skillKey]++;
          skillPointsUsed++;
          updatePoints();
          console.log("test!");

          // Re-render whole tree to show newly unlocked skills
          renderSkills(character);
        }
      });

      // HOVER CARD LOGIC
      node.addEventListener("mouseenter", () => {
        if (!info || !skillCard) return;

        skillCard.querySelector(".header-main h2").innerHTML =
          `${info.title} <span class="skill-id">${info.id}</span>`;
        skillCard.querySelector(".skill-stats").innerHTML = `
            <tr>
              <th>Type</th><td>${info.type}</td>
              <th>Max Lv</th><td>${info.maxLv}</td>
              <th>Target</th><td>${info.target || "-"}</td>
              <th>Range</th><td>${info.range || "-"}</td>
            </tr>
            <tr>
              <th>Effect</th><td colspan="7">${info.effect || "No description available."}</td>
            </tr>
        `;

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

  // --- Character Configuration ---
  const characterImages = {
    novice: {
      active: "skill-images/noviceactive.png",
      inactive: "skill-images/noviceinactive.png",
      hero: "skill-images/novice.png",
      shadow: "skill-images/noviceshadow.png",
      femaleHero: "skill-images/novicefemale.png",
      femaleShadow: "skill-images/novicefemaleshadow.png",
    },
    swordsman: {
      active: "skill-images/swordactive.png",
      inactive: "skill-images/swordinactive.png",
      hero: "skill-images/swordsman.png",
      shadow: "skill-images/swordsmanshadow.png",
      femaleHero: "skill-images/swordswoman.png",
      femaleShadow: "skill-images/swordswomanshadow.png",
    },
    magician: {
      active: "skill-images/mageactive.png",
      inactive: "skill-images/mageinactive.png",
      hero: "skill-images/magician.png",
      shadow: "skill-images/magicianshadow.png",
      femaleHero: "skill-images/femalemagician.png",
      femaleShadow: "skill-images/femalemagicianshadow.png",
    },
    archer: {
      active: "skill-images/archeractive.png",
      inactive: "skill-images/archerinactive.png",
      hero: "skill-images/archer.png",
      shadow: "skill-images/archershadow.png",
      femaleHero: "skill-images/archerfemale.png",
      femaleShadow: "skill-images/archerfemaleshadow.png",
    },
    acolyte: {
      active: "skill-images/acolyteactive.png",
      inactive: "skill-images/acolyteinactive.png",
      hero: "skill-images/acolyte.png",
      shadow: "skill-images/acolyteshadow.png",
      femaleHero: "skill-images/femaleacolyte.png",
      femaleShadow: "skill-images/femaleacolyteshadow.png",
    },
    merchant: {
      active: "skill-images/merchantactive.png",
      inactive: "skill-images/merchantinactive.png",
      hero: "skill-images/merchant.png",
      shadow: "skill-images/merchantshadow.png",
      femaleHero: "skill-images/femalemerchant.png",
      femaleShadow: "skill-images/femalemerchantshadow.png",
    },
    thief: {
      active: "skill-images/thiefactive.png",
      inactive: "skill-images/thiefinactive.png",
      hero: "skill-images/thief.png",
      shadow: "skill-images/thiefshadow.png",
      femaleHero: "skill-images/femalethief.png",
      femaleShadow: "skill-images/femalethiefshadow.png",
    },
  };

  const characterMessages = {
    novice: `"I started with nothing… and that’s why I fear<br>nothing."`,
    swordsman: `"Break your blade on me… I am the shield<br>that never falls."`,
    magician: `"You see magic… I see the end of your<br>existence."`,
    archer: `"Run… it only makes the hunt more<br>satisfying."`,
    acolyte: `"I do not fight for glory… I fight so others<br>may stand again."`,
    merchant: `"Everything has a price… today, your life is<br>on sale."`,
    thief: `"You won’t see me coming… but you’ll feel<br>everything."`,
  };

  const skillTreeTitles = {
    novice: `NOVICE SKILL TREE`,
    swordsman: `SWORDSMAN SKILL TREE`,
    magician: `MAGICIAN SKILL TREE`,
    archer: `ARCHER SKILL TREE`,
    acolyte: `ACOLYTE SKILL TREE`,
    merchant: `MERCHANT SKILL TREE`,
    thief: `THIEF SKILL TREE`,
  };

  let typeInterval = null;
  function typeMessage(text) {
    if (typeInterval) clearInterval(typeInterval);
    messageText.innerHTML = "";
    let i = 0;
    const chars = text.split("");
    typeInterval = setInterval(() => {
      if (chars[i] === "<") {
        if (text.substr(i, 4) === "<br>") {
          messageText.innerHTML += "<br>";
          i += 4;
        } else {
          messageText.innerHTML += chars[i];
          i++;
        }
      } else {
        messageText.innerHTML += chars[i];
        i++;
      }
      if (i >= chars.length) clearInterval(typeInterval);
    }, 50);
  }

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

  const maleBtn = document.getElementById("maleBtn");
  const femaleBtn = document.getElementById("femaleBtn");
  maleBtn.src =
    currentGender === "male"
      ? "skill-images/maleactive.png"
      : "skill-images/maleinactive.png";
  femaleBtn.src =
    currentGender === "female"
      ? "skill-images/femaleactive.png"
      : "skill-images/femaleinactive.png";

  populateJobLevels(40, 255);

  classIcons.forEach((icon) => {
    const charName = icon.dataset.character;
    if (charName === selectedJob) {
      icon.src = characterImages[charName].active;
      icon.classList.add("active");
      updateHeroImages(charName);
      typeMessage(characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);
      renderSkills(charName);
    } else {
      icon.src = characterImages[charName].inactive;
    }

    icon.addEventListener("click", () => {
      classIcons.forEach(
        (i) => (i.src = characterImages[i.dataset.character].inactive),
      );
      icon.src = characterImages[charName].active;
      document
        .querySelector(".class-icons img.active")
        ?.classList.remove("active");
      icon.classList.add("active");
      updateHeroImages(charName);
      typeMessage(characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);
      renderSkills(charName);
    });
  });

  maleBtn.addEventListener("click", () => {
    maleBtn.src = "skill-images/maleactive.png";
    femaleBtn.src = "skill-images/femaleinactive.png";
    currentGender = "male";
    updateHeroImages(
      document.querySelector(".class-icons img.active").dataset.character,
    );
  });
  femaleBtn.addEventListener("click", () => {
    femaleBtn.src = "skill-images/femaleactive.png";
    maleBtn.src = "skill-images/maleinactive.png";
    currentGender = "female";
    updateHeroImages(
      document.querySelector(".class-icons img.active").dataset.character,
    );
  });

  // PUT THIS AT THE VERY BOTTOM OF YOUR JS FILE
  const btn = document.getElementById("resetSkills");

  if (btn) {
    btn.onclick = function (e) {
      e.preventDefault(); // Stop any other actions
      console.log("!!! RESET BUTTON PHYSICALLY TOUCHED !!!");

      if (confirm("Reset all skill points?")) {
        // Force reset the global variables
        characterSkillLevels = {};
        skillPointsUsed = 0;

        // Update the UI
        updatePoints();

        // Refresh the current active class
        const activeIcon = document.querySelector(".class-icons img.active");
        const activeChar = activeIcon ? activeIcon.dataset.character : "novice";

        // Clear the area and redraw
        const skillTreeArea = document.getElementById("skill-tree-area");
        if (skillTreeArea) skillTreeArea.innerHTML = "";

        renderSkills(activeChar);
        console.log("Reset sequence finished.");
      }
    };
  }
});
