window.addEventListener('load', () => {      
  const classIcons = document.querySelectorAll('.class-icons img');
  const heroImage = document.getElementById('heroImage');
  const heroShadow = document.getElementById('heroShadow');
  const messageText = document.querySelector('.message-text');
  const skillTreeTitle = document.querySelector('.skill-tree-title');

  // Job Level Select
  const jobLevelSelect = document.getElementById('jobLevel');

  // Skill Tree Container
  const skillTreeArea = document.querySelector('.skill-tree-area');

  // Skill Card
  const skillCard = document.querySelector('.ro-skill-card');

  // Skill Card follow mouse
  document.addEventListener("mousemove", function(e) {
    if(skillCard){
      skillCard.style.top = (e.clientY + 20) + "px";
      skillCard.style.left = (e.clientX + 20) + "px";
    }
  });

  // Populate Job Levels
  function populateJobLevels(min = 40, max = 255) {
    jobLevelSelect.innerHTML = '';
    for (let i = min; i <= max; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      jobLevelSelect.appendChild(option);
    }
  }

  // Skill Data
  const skillData = {
    novice: ['NoviceBasicSkill.png','NoviceFirstAid.png','NoviceTrickDead.png'],
    swordsman: Array.from({length:10},(_,i)=>`SwordsmanSkill${i+1}.png`),
    magician: Array.from({length:18},(_,i)=>`MagicianSkill${i+1}.png`),
    archer: Array.from({length:7},(_,i)=>`ArcherSkill${i+1}.png`),
    acolyte: Array.from({length:15},(_,i)=>`AcolyteSkill${i+1}.png`),
    merchant: Array.from({length:12},(_,i)=>`MerchantSkill${i+1}.png`),
    thief: Array.from({length:10},(_,i)=>`ThiefSkill${i+1}.png`)
  };

  // Skill Info for dynamic hover card
  const skillInfo = {
    NoviceBasicSkill: {
      title: "Basic Skill",
      id: "Skill ID# 1 (NV_BASIC)",
      type: "Passive",
      maxLv: 9,
      target: "-",
      range: "-",
      effect: "Enable to apply Basic Interface Skills.",
      levels: [
        { lv: 1, desc: "Initialize Trade: allows trading items with other characters." },
        { lv: 2, desc: "Express Emotions: use Alt+0~9; list with Alt+M." },
        { lv: 3, desc: "Sit: regenerates HP/SP faster. Use /sit or Insert." },
        { lv: 4, desc: "Open Chat Room: create a personal chat room (Alt+C)." },
        { lv: 5, desc: "Join Party: allows joining a party." },
        { lv: 6, desc: "Kafra Storage: access 300-slot extra inventory." },
        { lv: 7, desc: "Organize Party: /organize [Party Name]." },
        { lv: 9, desc: "Transform: change into 1st profession." }
      ]
    },
    NoviceFirstAid: {
      title: "First Aid [Quest Skill]",
      id: "Skill ID# 142 (NV_FIRSTAID)",
      type: "Active",
      maxLv: 1,
      target: "Self",
      range: "-",
      effect: "Heal yourself for 5 HP. Not very powerful, but useful for saving money on healing items.",
      levels: [],
      otherNotes: []
    },
    NoviceTrickDead: {
      title: "Trick Dead [Quest Skill]",
      id: "Skill ID# 143 (NV_TRICKDEAD)",
      type: "Active",
      maxLv: 1,
      target: "Self",
      range: "-",
      effect: "Lay on the ground like you were dead. Aggressive monsters won't target you. Cannot recover HP/SP while dead. Cancels on second use. Lost after job change.",
      otherNotes: ["Skill can be toggled on and off", "Stay Duration: 10 min"],
      levels: []
    }
  };

  // Render Skills
  function renderSkills(character) {
    skillTreeArea.innerHTML = '';

    skillTreeArea.classList.remove('novice-layout', 'swordsman-layout', 'magician-layout', 'archer-layout', 'acolyte-layout');

    if (character==='novice') skillTreeArea.classList.add('novice-layout');
    if (character==='swordsman') skillTreeArea.classList.add('swordsman-layout');
    if (character==='magician') skillTreeArea.classList.add('magician-layout');
    if (character==='archer') skillTreeArea.classList.add('archer-layout');
    if (character==='acolyte') skillTreeArea.classList.add('acolyte-layout');

    // Create skill nodes
    skillData[character].forEach(skill => {
      const node = document.createElement('div');
      node.classList.add('skill-node');
      node.innerHTML = `<img src="skill-images/${skill}" alt="Skill"><span class="skill-level">Lvl 1</span>`;
      skillTreeArea.appendChild(node);
    });

    // Hover Skill Card (dynamic content)
    const skillIcons = skillTreeArea.querySelectorAll('.skill-node img');
    skillIcons.forEach(icon => {
      icon.addEventListener("mouseenter", () => {
        if(skillCard){
          const skillName = icon.src.split("/").pop().replace(".png","");
          const info = skillInfo[skillName];
          if(!info) return;

          // Update header
          skillCard.querySelector(".header-main h2").innerHTML = `${info.title} <span class="skill-id">${info.id}</span>`;

          // Update stats
          skillCard.querySelector(".skill-stats").innerHTML = `
            <tr>
              <th>Type</th><td>${info.type}</td>
              <th>Max Lv</th><td>${info.maxLv}</td>
              <th>Target</th><td>${info.target}</td>
              <th>Range</th><td>${info.range}</td>
            </tr>
            <tr>
              <th>Effect</th><td colspan="7">${info.effect}${info.spCost ? " <br>SP Cost: " + info.spCost : ""}</td>
            </tr>
          `;

          // Update Other Notes / Levels
          let levelHtml = '';
          if(info.levels && info.levels.length > 0){
            info.levels.forEach(lv => {
              levelHtml += `<tr><td class="lv-num">${lv.lv}</td><td>${lv.desc}</td></tr>`;
            });
          } else if(info.otherNotes && info.otherNotes.length > 0){
            info.otherNotes.forEach(note => {
              levelHtml += `<tr><td class="lv-num">-</td><td>${note}</td></tr>`;
            });
          }

          // Show/hide the entire level table if empty
          const levelTableContainer = skillCard.querySelector(".level-table");
          if(levelHtml === ''){
            levelTableContainer.style.display = 'none';
          } else {
            levelTableContainer.style.display = 'table';
            levelTableContainer.querySelector('tbody').innerHTML = levelHtml;
          }

          skillCard.classList.add("show");
        }
      });

      icon.addEventListener("mouseleave", () => {
        if(skillCard){
          skillCard.classList.remove("show");
        }
      });
    });

    // === Keep all your existing grid layout code for other classes ===
    const nodes = skillTreeArea.querySelectorAll('.skill-node');
    // ... [existing grid positioning code unchanged]
  }

  // Character Images
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
    novice: `NOVICE SKILL TREE`,
    swordsman: `SWORDSMAN SKILL TREE`,
    magician: `MAGICIAN SKILL TREE`,
    archer: `ARCHER SKILL TREE`,
    acolyte: `ACOLYTE SKILL TREE`,
    merchant: `MERCHANT SKILL TREE`,
    thief: `THIEF SKILL TREE`
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
  function updateHeroImages(charName){if(currentGender==='male'){heroImage.src=characterImages[charName].hero;heroShadow.src=characterImages[charName].shadow}else{heroImage.src=characterImages[charName].femaleHero;heroShadow.src=characterImages[charName].femaleShadow}}
  function updateSkillTreeTitle(title){skillTreeTitle.style.opacity=0;setTimeout(()=>{skillTreeTitle.textContent=title;skillTreeTitle.style.opacity=1},300)}

  const urlParams=new URLSearchParams(window.location.search);
  const selectedJob=urlParams.get('job')||'novice';
  const selectedGender=urlParams.get('gender')||'male';
  currentGender=selectedGender;

  const maleBtn=document.getElementById('maleBtn');
  const femaleBtn=document.getElementById('femaleBtn');
  if(currentGender==='male'){maleBtn.src='skill-images/maleactive.png';femaleBtn.src='skill-images/femaleinactive.png'}
  else{femaleBtn.src='skill-images/femaleactive.png';maleBtn.src='skill-images/maleinactive.png'}

  populateJobLevels(40,255);

  classIcons.forEach(icon=>{const charName=icon.dataset.character;if(charName===selectedJob){icon.src=characterImages[charName].active;icon.classList.add('active');updateHeroImages(charName);typeMessage(characterMessages[charName]);updateSkillTreeTitle(skillTreeTitles[charName]);renderSkills(charName)}
  else{icon.src=characterImages[charName].inactive;icon.classList.remove('active')}});

  classIcons.forEach(icon=>{icon.addEventListener('click',()=>{const clickedChar=icon.dataset.character;classIcons.forEach(i=>{const charName=i.dataset.character;i.src=characterImages[charName].inactive;i.classList.remove('active')});icon.src=characterImages[clickedChar].active;icon.classList.add('active');updateHeroImages(clickedChar);typeMessage(characterMessages[clickedChar]);updateSkillTreeTitle(skillTreeTitles[clickedChar]);populateJobLevels(40,255);renderSkills(clickedChar)})});

  maleBtn.addEventListener('click',()=>{maleBtn.src='skill-images/maleactive.png';femaleBtn.src='skill-images/femaleinactive.png';currentGender='male';const activeChar=document.querySelector('.class-icons img.active').dataset.character;updateHeroImages(activeChar)});
  femaleBtn.addEventListener('click',()=>{femaleBtn.src='skill-images/femaleactive.png';maleBtn.src='skill-images/maleinactive.png';currentGender='female';const activeChar=document.querySelector('.class-icons img.active').dataset.character;updateHeroImages(activeChar)});
});