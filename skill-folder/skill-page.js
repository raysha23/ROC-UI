window.addEventListener('load', () => {      
  const classIcons = document.querySelectorAll('.class-icons img');
  const heroImage = document.getElementById('heroImage');
  const heroShadow = document.getElementById('heroShadow');
  const messageText = document.querySelector('.message-text');
  const skillTreeTitle = document.querySelector('.skill-tree-title');

  // Skill Points & Level Tracking
  const pointsLeftInput = document.getElementById('pointsLeft');
  const pointsUsedInput = document.getElementById('pointsUsed');
  let skillPointsUsed = 0;
  let skillPointsLeft = 39; // Default for Job Level 40
  let characterSkillLevels = {}; // Stores { 'NoviceBasicSkill': 0, ... }

  // Job Level Select
  const jobLevelSelect = document.getElementById('jobLevel');

  // Skill Tree Container
  const skillTreeArea = document.querySelector('.skill-tree-area');

  // Skill Card
  const skillCard = document.querySelector('.ro-skill-card');

  // Skill Card follow mouse
  document.addEventListener("mousemove", function(e) {
    if(skillCard && skillCard.classList.contains('show')){
      skillCard.style.top = (e.clientY + 20) + "px";
      skillCard.style.left = (e.clientX + 20) + "px";
    }
  });

  // Populate Job Levels & Handle Point Calculation
  function populateJobLevels(min = 40, max = 255) {
    jobLevelSelect.innerHTML = '';
    for (let i = min; i <= max; i++) {
      const option = document.createElement('option');
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

  jobLevelSelect.addEventListener('change', updatePoints);

  // Skill Data Mapping
  const skillData = {
    novice: ['NoviceBasicSkill.png', 'NoviceFirstAid.png', 'NoviceTrickDead.png'],
    swordsman: [
      'SwordMastery.png', 'IncreaseRecuperativePower.png', 'Bash.png', 
      'Provoke.png', 'MovingHPRecovery.png', 'FatalBlow.png', 
      'AutoBerserk.png', 'TwoHandedSwordMastery.png', 'MagnumBreak.png', 'Endure.png'
    ],
    magician: [
      'IncreaseSPRecovery.png', 'Sight.png', 'NapalmBeat.png', 
      'ColdBolt.png', 'StoneCurse.png', 'FireBolt.png', 
      'LightningBolt.png', 'EnergyCoat.png', 'SoulStrike.png', 
      'SafetyWall.png', 'FrostDiver.png', 'FireBall.png', 
      'FireWall.png', 'ThunderStorm.png'
    ],
    archer: [
      'OwlsEye.png', 'DoubleStrafing.png', 'MakingArrow.png', 
      'ChargeArrow.png', 'VulturesEye.png', 'AttentionConcentrate.png', 'ArrowShower.png'
    ],
    acolyte: [
      'DivineProtection.png', 'Ruwach.png', 'Heal.png', 
      'AquaBenedicta.png', 'HolyLight.png', 'DemonBane.png', 
      'Teleportation.png', 'WarpPortal.png', 'Pneuma.png', 
      'IncreaseAgility.png', 'DecreaseAgility.png', 'SignumCrucis.png', 
      'Angelus.png', 'Blessing.png', 'Cure.png'
    ],
    merchant: [
      'EnlargeWeightLimit.png', 'Identify.png', 'Mammonite.png', 
      'CartRevolution.png', 'ChangeCart.png', 'LoudExclamation.png', 
      'CartDecoration.png', 'Discount.png', 'Overcharge.png', 
      'Pushcart.png', 'Vending.png', 'BuyingStore.png'
    ],
    thief: [
      'DoubleAttack.png', 'IncreaseDodge.png', 'Steal.png', 
      'Envenom.png', 'SprinkleSand.png', 'BackSliding.png', 
      'PickStone.png', 'ThrowStone.png', 'Hiding.png', 'Detoxify.png'
    ]
  };

  // --- LOGIC ADDED HERE: Detailed Skill Info with Requirements ---
  const skillInfo = {
    // NOVICE
    NoviceBasicSkill: { title: "Basic Skill", id: "1", type: "Passive", maxLv: 9, effect: "Basic interface skills.", levels: [] },
    NoviceFirstAid: { title: "First Aid", id: "142", type: "Quest", maxLv: 1, effect: "Heal 5 HP.", levels: [] },
    NoviceTrickDead: { title: "Trick Dead", id: "143", type: "Quest", maxLv: 1, req: [{ skill: "NoviceBasicSkill", lv: 7 }], effect: "Avoid monsters.", levels: [] },

    // SWORDSMAN
    SwordMastery: { title: "Sword Mastery", id: "50", maxLv: 10, type: "Passive" },
    IncreaseRecuperativePower: { title: "Increase Recuperative Power", id: "52", maxLv: 10, type: "Passive" },
    Bash: { title: "Bash", id: "53", maxLv: 10, type: "Active" },
    Provoke: { title: "Provoke", id: "55", maxLv: 10, type: "Active" },
    MovingHPRecovery: { title: "Moving HP Recovery", id: "1001", maxLv: 1, type: "Quest" },
    FatalBlow: { title: "Fatal Blow", id: "1002", maxLv: 1, type: "Quest" },
    AutoBerserk: { title: "Auto Berserk", id: "1003", maxLv: 1, type: "Quest" },
    TwoHandedSwordMastery: { title: "Two-Handed Sword Mastery", id: "51", maxLv: 10, type: "Passive", req: [{ skill: "SwordMastery", lv: 1 }] },
    MagnumBreak: { title: "Magnum Break", id: "54", maxLv: 10, type: "Active", req: [{ skill: "Bash", lv: 5 }] },
    Endure: { title: "Endure", id: "56", maxLv: 10, type: "Active", req: [{ skill: "Provoke", lv: 5 }] },

    // MAGICIAN
    IncreaseSPRecovery: { title: "Increase SP Recovery", id: "1", maxLv: 10, type: "Passive" },
    Sight: { title: "Sight", id: "2", maxLv: 1, type: "Active" },
    NapalmBeat: { title: "Napalm Beat", id: "3", maxLv: 10, type: "Active" },
    ColdBolt: { title: "Cold Bolt", id: "4", maxLv: 10, type: "Active" },
    StoneCurse: { title: "Stone Curse", id: "5", maxLv: 10, type: "Active" },
    FireBolt: { title: "Fire Bolt", id: "6", maxLv: 10, type: "Active" },
    LightningBolt: { title: "Lightning Bolt", id: "7", maxLv: 10, type: "Active" },
    EnergyCoat: { title: "Energy Coat", id: "1004", maxLv: 1, type: "Quest" },
    SoulStrike: { title: "Soul Strike", id: "8", maxLv: 10, type: "Active", req: [{ skill: "NapalmBeat", lv: 4 }] },
    SafetyWall: { title: "Safety Wall", id: "9", maxLv: 10, type: "Active", req: [{ skill: "SoulStrike", lv: 5 }, { skill: "NapalmBeat", lv: 5 }] },
    FrostDiver: { title: "Frost Diver", id: "10", maxLv: 10, type: "Active", req: [{ skill: "ColdBolt", lv: 5 }] },
    FireBall: { title: "Fire Ball", id: "11", maxLv: 10, type: "Active", req: [{ skill: "FireBolt", lv: 4 }] },
    FireWall: { title: "Fire Wall", id: "12", maxLv: 10, type: "Active", req: [{ skill: "Sight", lv: 1 }, { skill: "FireBall", lv: 5 }] },
    ThunderStorm: { title: "Thunder Storm", id: "13", maxLv: 10, type: "Active", req: [{ skill: "LightningBolt", lv: 4 }] },

    // ARCHER
    OwlsEye: { title: "Owl's Eye", id: "43", maxLv: 10, type: "Passive" },
    DoubleStrafing: { title: "Double Strafing", id: "44", maxLv: 10, type: "Active" },
    MakingArrow: { title: "Making Arrow", id: "1005", maxLv: 1, type: "Quest" },
    ChargeArrow: { title: "Charge Arrow", id: "1006", maxLv: 1, type: "Quest" },
    VulturesEye: { title: "Vulture's Eye", id: "45", maxLv: 10, type: "Passive", req: [{ skill: "OwlsEye", lv: 3 }] },
    AttentionConcentrate: { title: "Attention Concentrate", id: "46", maxLv: 10, type: "Active", req: [{ skill: "VulturesEye", lv: 1 }] },
    ArrowShower: { title: "Arrow Shower", id: "47", maxLv: 10, type: "Active", req: [{ skill: "DoubleStrafing", lv: 5 }] },

    // ACOLYTE
    DivineProtection: { title: "Divine Protection", id: "24", maxLv: 10, type: "Passive" },
    Ruwach: { title: "Ruwach", id: "25", maxLv: 1, type: "Active" },
    Heal: { title: "Heal", id: "26", maxLv: 10, type: "Active" },
    AquaBenedicta: { title: "Aqua Benedicta", id: "27", maxLv: 1, type: "Active" },
    HolyLight: { title: "Holy Light", id: "1007", maxLv: 1, type: "Quest" },
    DemonBane: { title: "Demon Bane", id: "28", maxLv: 10, type: "Passive", req: [{ skill: "DivineProtection", lv: 3 }] },
    Teleportation: { title: "Teleportation", id: "29", maxLv: 2, type: "Active", req: [{ skill: "Ruwach", lv: 1 }] },
    WarpPortal: { title: "Warp Portal", id: "30", maxLv: 4, type: "Active", req: [{ skill: "Teleportation", lv: 2 }] },
    Pneuma: { title: "Pneuma", id: "31", maxLv: 1, type: "Active", req: [{ skill: "WarpPortal", lv: 4 }] },
    IncreaseAgility: { title: "Increase Agility", id: "32", maxLv: 10, type: "Active", req: [{ skill: "Heal", lv: 3 }] },
    DecreaseAgility: { title: "Decrease Agility", id: "33", maxLv: 10, type: "Active", req: [{ skill: "IncreaseAgility", lv: 1 }] },
    SignumCrucis: { title: "Signum Crucis", id: "34", maxLv: 10, type: "Active", req: [{ skill: "DemonBane", lv: 3 }] },
    Angelus: { title: "Angelus", id: "35", maxLv: 10, type: "Active", req: [{ skill: "DivineProtection", lv: 3 }] },
    Blessing: { title: "Blessing", id: "36", maxLv: 10, type: "Active", req: [{ skill: "DivineProtection", lv: 5 }] },
    Cure: { title: "Cure", id: "37", maxLv: 1, type: "Active", req: [{ skill: "Heal", lv: 2 }] },

    // MERCHANT
    EnlargeWeightLimit: { title: "Enlarge Weight Limit", id: "38", maxLv: 10, type: "Passive" },
    Identify: { title: "Identify", id: "39", maxLv: 1, type: "Active" },
    Mammonite: { title: "Mammonite", id: "40", maxLv: 10, type: "Active" },
    CartRevolution: { title: "Cart Revolution", id: "1008", maxLv: 1, type: "Quest" },
    ChangeCart: { title: "Change Cart", id: "1009", maxLv: 1, type: "Quest" },
    LoudExclamation: { title: "Loud Exclamation", id: "1010", maxLv: 1, type: "Quest" },
    CartDecoration: { title: "Cart Decoration", id: "1011", maxLv: 1, type: "Quest" },
    Discount: { title: "Discount", id: "41", maxLv: 10, type: "Passive", req: [{ skill: "EnlargeWeightLimit", lv: 3 }] },
    Overcharge: { title: "Overcharge", id: "42", maxLv: 10, type: "Passive", req: [{ skill: "Discount", lv: 3 }] },
    Pushcart: { title: "Pushcart", id: "43", maxLv: 10, type: "Passive", req: [{ skill: "EnlargeWeightLimit", lv: 5 }] },
    Vending: { title: "Vending", id: "44", maxLv: 10, type: "Active", req: [{ skill: "Pushcart", lv: 3 }] },
    BuyingStore: { title: "Buying Store", id: "45", maxLv: 1, type: "Active", req: [{ skill: "Vending", lv: 1 }] },

    // THIEF
    DoubleAttack: { title: "Double Attack", id: "46", maxLv: 10, type: "Passive" },
    IncreaseDodge: { title: "Increase Dodge", id: "47", maxLv: 10, type: "Passive" },
    Steal: { title: "Steal", id: "48", maxLv: 10, type: "Active" },
    Envenom: { title: "Envenom", id: "49", maxLv: 10, type: "Active" },
    SprinkleSand: { title: "Sprinkle Sand", id: "1012", maxLv: 1, type: "Quest" },
    BackSliding: { title: "Back Sliding", id: "1013", maxLv: 1, type: "Quest" },
    PickStone: { title: "Pick Stone", id: "1014", maxLv: 1, type: "Quest" },
    ThrowStone: { title: "Throw Stone", id: "1015", maxLv: 1, type: "Quest" },
    Hiding: { title: "Hiding", id: "50", maxLv: 10, type: "Active", req: [{ skill: "Steal", lv: 5 }] },
    Detoxify: { title: "Detoxify", id: "51", maxLv: 1, type: "Active", req: [{ skill: "Envenom", lv: 3 }] }
  };

  // --- LOGIC UPDATED HERE: Prerequisite-aware rendering ---
  function renderSkills(character) {
    skillTreeArea.innerHTML = '';
    skillTreeArea.classList.remove('novice-layout', 'swordsman-layout', 'magician-layout', 'archer-layout', 'acolyte-layout', 'merchant-layout', 'thief-layout');
    if (character) skillTreeArea.classList.add(`${character}-layout`);

    skillData[character].forEach(skillFile => {
      const skillKey = skillFile.replace('.png', '');
      const info = skillInfo[skillKey];

      // PREREQUISITE FILTER: Don't draw the icon if conditions aren't met
      if (info && info.req) {
        const allMet = info.req.every(r => (characterSkillLevels[r.skill] || 0) >= r.lv);
        if (!allMet) return; // Skip this skill
      }

      if (characterSkillLevels[skillKey] === undefined) characterSkillLevels[skillKey] = 0;
      
      const maxLv = info?.maxLv || 10;
      const node = document.createElement('div');
      node.classList.add('skill-node');
      node.innerHTML = `
        <img src="skill-images/${skillFile}" alt="Skill">
        <span class="skill-level">Lvl ${characterSkillLevels[skillKey]}/${maxLv}</span>
      `;

      // CLICK TO LEVEL UP
      node.addEventListener('click', () => {
        if (skillPointsLeft > 0 && characterSkillLevels[skillKey] < maxLv) {
            characterSkillLevels[skillKey]++;
            skillPointsUsed++;
            updatePoints();
            
            // Re-render whole tree to show newly unlocked skills
            renderSkills(character);
        }
      });

      // HOVER CARD LOGIC
      node.addEventListener("mouseenter", () => {
        if(!info || !skillCard) return;

        skillCard.querySelector(".header-main h2").innerHTML = `${info.title} <span class="skill-id">${info.id}</span>`;
        skillCard.querySelector(".skill-stats").innerHTML = `
            <tr>
              <th>Type</th><td>${info.type}</td>
              <th>Max Lv</th><td>${info.maxLv}</td>
              <th>Target</th><td>${info.target || '-'}</td>
              <th>Range</th><td>${info.range || '-'}</td>
            </tr>
            <tr>
              <th>Effect</th><td colspan="7">${info.effect || 'No description available.'}</td>
            </tr>
        `;

        let levelHtml = '';
        if(info.levels?.length > 0){
          info.levels.forEach(lv => levelHtml += `<tr><td class="lv-num">${lv.lv}</td><td>${lv.desc}</td></tr>`);
        } else if(info.otherNotes?.length > 0){
          info.otherNotes.forEach(note => levelHtml += `<tr><td class="lv-num">-</td><td>${note}</td></tr>`);
        }

        const levelTable = skillCard.querySelector(".level-table");
        if(levelHtml === ''){
          levelTable.style.display = 'none';
        } else {
          levelTable.style.display = 'table';
          levelTable.querySelector('tbody').innerHTML = levelHtml;
        }
        skillCard.classList.add("show");
      });

      node.addEventListener("mouseleave", () => skillCard.classList.remove("show"));
      skillTreeArea.appendChild(node);
    });
  }

  // --- Character Configuration ---
  const characterImages = {
    novice: {active:'skill-images/noviceactive.png', inactive:'skill-images/noviceinactive.png', hero:'skill-images/novice.png', shadow:'skill-images/noviceshadow.png', femaleHero:'skill-images/novicefemale.png', femaleShadow:'skill-images/novicefemaleshadow.png'},
    swordsman: {active:'skill-images/swordactive.png', inactive:'skill-images/swordinactive.png', hero:'skill-images/swordsman.png', shadow:'skill-images/swordsmanshadow.png', femaleHero:'skill-images/swordswoman.png', femaleShadow:'skill-images/swordswomanshadow.png'},
    magician: {active:'skill-images/mageactive.png', inactive:'skill-images/mageinactive.png', hero:'skill-images/magician.png', shadow:'skill-images/magicianshadow.png', femaleHero:'skill-images/femalemagician.png', femaleShadow:'skill-images/femalemagicianshadow.png'},
    archer: {active:'skill-images/archeractive.png', inactive:'skill-images/archerinactive.png', hero:'skill-images/archer.png', shadow:'skill-images/archershadow.png', femaleHero:'skill-images/archerfemale.png', femaleShadow:'skill-images/archerfemaleshadow.png'},
    acolyte: {active:'skill-images/acolyteactive.png', inactive:'skill-images/acolyteinactive.png', hero:'skill-images/acolyte.png', shadow:'skill-images/acolyteshadow.png', femaleHero:'skill-images/femaleacolyte.png', femaleShadow:'skill-images/femaleacolyteshadow.png'},
    merchant: {active:'skill-images/merchantactive.png', inactive:'skill-images/merchantinactive.png', hero:'skill-images/merchant.png', shadow:'skill-images/merchantshadow.png', femaleHero:'skill-images/femalemerchant.png', femaleShadow:'skill-images/femalemerchantshadow.png'},
    thief: {active:'skill-images/thiefactive.png', inactive:'skill-images/thiefinactive.png', hero:'skill-images/thief.png', shadow:'skill-images/thiefshadow.png', femaleHero:'skill-images/femalethief.png', femaleShadow:'skill-images/femalethiefshadow.png'}
  };

  const characterMessages = {
    novice: `"I started with nothing… and that’s why I fear<br>nothing."`,
    swordsman: `"Break your blade on me… I am the shield<br>that never falls."`,
    magician: `"You see magic… I see the end of your<br>existence."`,
    archer: `"Run… it only makes the hunt more<br>satisfying."`,
    acolyte: `"I do not fight for glory… I fight so others<br>may stand again."`,
    merchant: `"Everything has a price… today, your life is<br>on sale."`,
    thief: `"You won’t see me coming… but you’ll feel<br>everything."`
  };

  const skillTreeTitles = {
    novice: `NOVICE SKILL TREE`, swordsman: `SWORDSMAN SKILL TREE`, magician: `MAGICIAN SKILL TREE`,
    archer: `ARCHER SKILL TREE`, acolyte: `ACOLYTE SKILL TREE`, merchant: `MERCHANT SKILL TREE`, thief: `THIEF SKILL TREE`
  };

  let typeInterval = null;
  function typeMessage(text){
    if(typeInterval) clearInterval(typeInterval);
    messageText.innerHTML='';
    let i=0;
    const chars=text.split('');
    typeInterval=setInterval(()=>{
      if(chars[i]==='<'){if(text.substr(i,4)==='<br>'){messageText.innerHTML+='<br>';i+=4}else{messageText.innerHTML+=chars[i];i++}}else{messageText.innerHTML+=chars[i];i++}
      if(i>=chars.length) clearInterval(typeInterval)
    },50)
  }

  let currentGender='male';
  function updateHeroImages(charName){
    if(currentGender==='male'){
        heroImage.src=characterImages[charName].hero;
        heroShadow.src=characterImages[charName].shadow;
    } else {
        heroImage.src=characterImages[charName].femaleHero;
        heroShadow.src=characterImages[charName].femaleShadow;
    }
  }

  function updateSkillTreeTitle(title){
    skillTreeTitle.style.opacity=0;
    setTimeout(()=>{skillTreeTitle.textContent=title;skillTreeTitle.style.opacity=1},300);
  }

  // Startup Init
  const urlParams=new URLSearchParams(window.location.search);
  const selectedJob=urlParams.get('job')||'novice';
  currentGender=urlParams.get('gender')||'male';

  const maleBtn=document.getElementById('maleBtn');
  const femaleBtn=document.getElementById('femaleBtn');
  maleBtn.src = currentGender === 'male' ? 'skill-images/maleactive.png' : 'skill-images/maleinactive.png';
  femaleBtn.src = currentGender === 'female' ? 'skill-images/femaleactive.png' : 'skill-images/femaleinactive.png';

  populateJobLevels(40,255);

  classIcons.forEach(icon => {
    const charName = icon.dataset.character;
    if(charName === selectedJob){
      icon.src = characterImages[charName].active;
      icon.classList.add('active');
      updateHeroImages(charName);
      typeMessage(characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);
      renderSkills(charName);
    } else {
      icon.src = characterImages[charName].inactive;
    }

    icon.addEventListener('click', () => {
      classIcons.forEach(i => i.src = characterImages[i.dataset.character].inactive);
      icon.src = characterImages[charName].active;
      document.querySelector('.class-icons img.active')?.classList.remove('active');
      icon.classList.add('active');
      updateHeroImages(charName);
      typeMessage(characterMessages[charName]);
      updateSkillTreeTitle(skillTreeTitles[charName]);
      renderSkills(charName);
    });
  });

  maleBtn.addEventListener('click',()=>{
    maleBtn.src='skill-images/maleactive.png'; femaleBtn.src='skill-images/femaleinactive.png';
    currentGender='male'; updateHeroImages(document.querySelector('.class-icons img.active').dataset.character);
  });
  femaleBtn.addEventListener('click',()=>{
    femaleBtn.src='skill-images/femaleactive.png'; maleBtn.src='skill-images/maleinactive.png';
    currentGender='female'; updateHeroImages(document.querySelector('.class-icons img.active').dataset.character);
  });

  // PUT THIS AT THE VERY BOTTOM OF YOUR JS FILE
const btn = document.getElementById('resetSkills');

if (btn) {
    btn.onclick = function(e) {
        e.preventDefault(); // Stop any other actions
        console.log("!!! RESET BUTTON PHYSICALLY TOUCHED !!!");
        
        if (confirm("Reset all skill points?")) {
            // Force reset the global variables
            characterSkillLevels = {}; 
            skillPointsUsed = 0;

            // Update the UI
            updatePoints(); 

            // Refresh the current active class
            const activeIcon = document.querySelector('.class-icons img.active');
            const activeChar = activeIcon ? activeIcon.dataset.character : 'novice';
            
            // Clear the area and redraw
            const skillTreeArea = document.getElementById('skill-tree-area');
            if (skillTreeArea) skillTreeArea.innerHTML = '';
            
            renderSkills(activeChar);
            console.log("Reset sequence finished.");
        }
    };
}
});