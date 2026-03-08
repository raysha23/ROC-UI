document.addEventListener("DOMContentLoaded", function () { 

    // ================= HERO DATA =================
    const heroes = [
        { name: "NOVICE", innateLeft: ["images/novice11.png","images/novice22.png","images/novice33.png"] },
        { name: "SWORDSMAN", innateLeft: ["images/swordsman11.png","images/swordsman22.png","images/swordsman33.png"] },
        { name: "MAGICIAN", innateLeft: ["images/magician11.png","images/magician22.png","images/magician33.png"] },
        { name: "ARCHER", innateLeft: ["images/archer11.png","images/archer22.png","images/archer33.png"] },
        { name: "ACOLYTE", innateLeft: ["images/acolyte11.png","images/acolyte22.png","images/acolyte33.png"] },
        { name: "MERCHANT", innateLeft: ["images/merchant11.png","images/merchant22.png","images/merchant33.png"] },
        { name: "THIEF", innateLeft: ["images/thief11.png","images/thief22.png","images/thief33.png"] }
    ];

    const heroImage = document.getElementById("heroImage");
    const innateLeftImgs = document.querySelectorAll(".innate-left img");
    const barsCharacter = document.querySelector(".bars-character");
    const heroSelection = document.querySelector(".hero-selection img");
    const jobItems = document.querySelectorAll(".job-item");
    const weaponSelect = document.getElementById("weapon-select");
    const jobTitle = document.getElementById("jobTitle");
    const descText = document.getElementById("descText");
    let currentGender = "male";

    if (!heroImage || innateLeftImgs.length === 0) { console.error("Hero elements not found."); return; }

    // ================= JOB DESCRIPTIONS =================
    const jobDescriptions = {
        novice: "Novices are the spark of potential. They <br>focus on learning fundamentals and support <br>their teams as adaptable beginners.",
        swordsman: "Swordsmen are strong melee fighters. They <br>excel at physical combat and protecting allies.",
        magician: "Magicians harness magical powers. They <br>specialize in ranged attacks and elemental spells.",
        archer: "Archers are expert ranged fighters. They <br>attack from afar with precision and agility.",
        acolyte: "Acolytes are supportive healers. They <br>boost allies’ strength and restore health.",
        merchant: "Merchants excel in trade and profit. <br>They can buy, sell, and craft effectively.",
        thief: "Thieves are agile and cunning. They strike <br> quickly and specialize in stealth."
    };

    // ================= INITIAL HERO =================
  function initializeHero(heroName) {

    const hero = heroes.find(h => h.name.toLowerCase() === heroName.toLowerCase()) || heroes[0];

    const job = heroName.toLowerCase();

    if(currentGender === "male"){
        heroImage.src = `images/${job}male.gif`;
    }else{
        heroImage.src = `images/${job}female.gif`;
    }

    hero.innateLeft.forEach((src, i) => {
        if (innateLeftImgs[i]) innateLeftImgs[i].src = src;
    });

}
    function animateInnates() {
        innateLeftImgs.forEach(img => {
            img.classList.remove("innate-slide-up");
            void img.offsetWidth;
            img.classList.add("innate-slide-up");
        });
    }

    // ================= WEAPON TYPES =================
    const weaponTypes = {
        novice: ["Hand","Dagger","One-handed Sword","One-handed Axe","One-handed Mace","Two-handed Mace","Rod & Staff","Two-handed Staff"],
        swordsman: ["Hand","Dagger","One-handed Sword","Two-handed Sword","One-handed Spear","Two-handed Spear","One-handed Axe","Two-handed Axe","One-handed Mace","Two-handed Mace"],
        magician: ["Hand","Dagger","Rod & Staff","Two-handed Staff"],
        archer: ["Hand","Dagger","Bow"],
        acolyte: ["Hand","One-handed Mace","Two-handed Mace","Rod & Staff","Two-handed Staff"],
        merchant: ["Hand","Dagger","One-handed Sword","One-handed Axe","Two-handed Axe","One-handed Mace","Two-handed Mace"],
        thief: ["Hand","Dagger","One-handed Sword","One-handed Axe"]
    };

    function updateWeaponDropdown(job) {
        if (!weaponSelect) return;
        weaponSelect.innerHTML = "";
        const weapons = weaponTypes[job];
        if (!weapons) return;
        weapons.forEach(weapon => {
            const option = document.createElement("option");
            option.value = weapon.toLowerCase().replace(/ /g, "-");
            option.textContent = weapon;
            weaponSelect.appendChild(option);
        });
        weaponSelect.selectedIndex = 0;
    }

    // ================= JOB ICONS =================
    const jobIcons = {
        novice: {active:"images/noviceactive.png", inactive:"images/noviceinactive.png"},
        swordsman: {active:"images/swordactive.png", inactive:"images/swordinactive.png"},
        magician: {active:"images/mageactive.png", inactive:"images/mageinactive.png"},
        archer: {active:"images/archeractive.png", inactive:"images/archerinactive.png"},
        acolyte: {active:"images/acolyteactive.png", inactive:"images/acolyteinactive.png"},
        merchant: {active:"images/merchantactive.png", inactive:"images/merchantinactive.png"},
        thief: {active:"images/thieftactive.png", inactive:"images/thieftinactive.png"}
    };

    let barsCharacterImages = {
        novice: "images/noviceman1.png", swordsman: "images/swordsman2.png", magician: "images/magicianman3.png",
        archer: "images/archerman4.png", acolyte: "images/acolyteman5.png", merchant: "images/merchantman6.png", thief: "images/thiefman7.png"
    };

    let heroSelectionImages = {
        novice: "images/novice.png", swordsman: "images/swordsman.png", magician: "images/magician.png",
        archer: "images/archer.png", acolyte: "images/acolyte.png", merchant: "images/merchant.png", thief: "images/thief.png"
    };

    const leftJobHeadIcons = {
        male: {
            novice:"images/leftnovice.png", swordsman:"images/leftswordsman.png", magician:"images/leftmagician.png",
            archer:"images/leftarcher.png", acolyte:"images/leftacolyte.png", merchant:"images/leftmerchant.png",
            thief:"images/leftthief.png"
        },
        female: {
            novice:"images/leftfemalenovice.png", swordsman:"images/leftfemaleswordsman.png", magician:"images/leftfemalemagician.png",
            archer:"images/leftfemalearcher.png", acolyte:"images/leftfemaleacolyte.png", merchant:"images/leftfemalemerchant.png",
            thief:"images/leftfemalethief.png"
        }
    };

    // ================= GENDER SYSTEM =================
    const maleBtn = document.getElementById("maleBtn");
    const femaleBtn = document.getElementById("femaleBtn");

    function updateGenderImages() {

        const maleBars = {
            novice: "images/noviceman1.png", swordsman: "images/swordsman2.png", magician: "images/magicianman3.png",
            archer: "images/archerman4.png", acolyte: "images/acolyteman5.png", merchant: "images/merchantman6.png", thief: "images/thiefman7.png"
        };

        const femaleBars = {
            novice: "images/novicefemale1.png", swordsman: "images/swordsmanfemale2.png", magician: "images/magicianfemale3.png",
            archer: "images/archerfemale4.png", acolyte: "images/acolytefemale5.png", merchant: "images/merchantfemale6.png", thief: "images/thieffemale7.png"
        };

        const maleHero = {
            novice:"images/novice.png", swordsman:"images/swordsman.png", magician:"images/magician.png",
            archer:"images/archer.png", acolyte:"images/acolyte.png", merchant:"images/merchant.png", thief:"images/thief.png"
        };

        const femaleHero = {
            novice:"images/femalenovice.png", swordsman:"images/femaleswordsman.png", magician:"images/femalemagician.png",
            archer:"images/femalearcher.png", acolyte:"images/femaleacolyte.png", merchant:"images/femalemerchant.png", thief:"images/femalethief.png"
        };

        barsCharacterImages = currentGender === "male" ? maleBars : femaleBars;
        heroSelectionImages = currentGender === "male" ? maleHero : femaleHero;

        jobItems.forEach(item => {
            const job = item.dataset.job.toLowerCase();
            const headIcon = item.querySelector(".job-head-icon");
            if (headIcon) headIcon.src = leftJobHeadIcons[currentGender][job];
        });
    }

    if (maleBtn && femaleBtn) {
        maleBtn.addEventListener("click", () => {
            currentGender = "male";
            maleBtn.src = "images/maleactive.png";
            femaleBtn.src = "images/femaleinactive.png";
            updateGenderImages();
            const activeJob = document.querySelector(".job-item.active");
            if (activeJob) activeJob.click();
        });

        femaleBtn.addEventListener("click", () => {
            currentGender = "female";
            maleBtn.src = "images/maleinactive.png";
            femaleBtn.src = "images/femaleactive.png";
            updateGenderImages();
            const activeJob = document.querySelector(".job-item.active");
            if (activeJob) activeJob.click();
        });
    }

    // ================= UPDATE DESCRIPTION WITH FADE =================
    function updateDescription(job) {
        if (!jobTitle || !descText) return;

        jobTitle.style.opacity = 0;
        descText.style.opacity = 0;

        setTimeout(() => {
            jobTitle.innerText = job.toUpperCase();
            descText.innerHTML = jobDescriptions[job];

            jobTitle.style.opacity = 1;
            descText.style.opacity = 1;
        }, 200);
    }

    // ================= JOB CLICK =================
    jobItems.forEach(item => {
        item.addEventListener("click", () => {

            const job = item.dataset.job.toLowerCase();

            updateWeaponDropdown(job);

            jobItems.forEach(i => {
                i.classList.remove("active");

                const icon = i.querySelector(".job-icon");

                if (icon) {
                    const j = i.dataset.job.toLowerCase();
                    icon.src = jobIcons[j].inactive;
                }
            });

            item.classList.add("active");

            const icon = item.querySelector(".job-icon");
            if (icon) icon.src = jobIcons[job].active;

            if (barsCharacter && barsCharacterImages[job])
                barsCharacter.src = barsCharacterImages[job];

            if (heroSelection && heroSelectionImages[job])
                heroSelection.src = heroSelectionImages[job];

            initializeHero(job);
            animateInnates();
            updateDescription(job);

        });
    });

    // ================= DEFAULT LOAD =================
    const defaultJob = "novice";
    const defaultJobItem = document.querySelector(`.job-item[data-job="${defaultJob}"]`);

    if (defaultJobItem) defaultJobItem.click();

    updateWeaponDropdown("novice");

});