
//ADDED
document.addEventListener("DOMContentLoaded", function () {

    // 🔥 Array of heroes (NOW WITH NAMES)
    const heroes = [
        {
            name: "LINA",
            gif: "images/Lina.gif",
            innateLeft: [
                "images/talents.svg",
                "images/innate_icon.png",
            ],
            innateRight: [
                "images/lina_dragon_slave.png",
                "images/lina_light_strike_array.png",
                "images/lina_fiery_soul.png",
                "images/lina_laguna_blade.png"
            ]
        },
        {
            name: "VISAGE",
            gif: "images/Visage.gif",
            innateLeft: [
                "images/talents.svg",
                "images/innate_icon.png",
            ],
            innateRight: [
                "images/visage_grave_chill.png",
                "images/visage_soul_assumption.png",
                "images/visage_gravekeepers_cloak.png",
                "images/visage_summon_familiars.png"
            ]
        },
        {
            name: "EZALOR",
            gif: "images/KeeperoftheLight.gif",
            innateLeft: [
                "images/talents.svg",
                "images/innate_icon.png",
            ],
            innateRight: [
                "images/keeper_of_the_light_illuminate.png",
                "images/keeper_of_the_light_blinding_light.png",
                "images/keeper_of_the_light_chakra_magic.png",
                "images/keeper_of_the_light_spirit_form.png",
            ]
        }
    ];

    let currentIndex = 0;
    let isAnimating = false;

    const heroImage = document.getElementById("heroImage");
    const characterName = document.getElementById("characterName");
    const leftArrow = document.querySelector(".arrow-btn.left");
    const rightArrow = document.querySelector(".arrow-btn.right");

    const innateLeftImgs = document.querySelectorAll(".innate-left img");
    const innateRightImgs = document.querySelectorAll(".innate-right img");

    if (!heroImage || !leftArrow || !rightArrow || 
        !characterName ||
        innateLeftImgs.length === 0 || innateRightImgs.length === 0) {
        console.error("Elements not found.");
        return;
    }

    // ✅ Initialize first hero properly
    function initializeHero() {
        heroImage.src = heroes[currentIndex].gif;
        characterName.textContent = heroes[currentIndex].name;

        heroes[currentIndex].innateLeft.forEach((src, i) => {
            if (innateLeftImgs[i]) innateLeftImgs[i].src = src;
        });

        heroes[currentIndex].innateRight.forEach((src, i) => {
            if (innateRightImgs[i]) innateRightImgs[i].src = src;
        });
    }

    // ✅ Slide up animation for abilities
    function animateInnates() {
        [...innateLeftImgs, ...innateRightImgs].forEach(img => {
            img.classList.remove("innate-slide-up");
            void img.offsetWidth; // force reflow
            img.classList.add("innate-slide-up");
        });
    }

    function changeHero(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const slideOutClass = direction === "right" ? "slide-out-left" : "slide-out-right";
        const slideInClass = direction === "right" ? "slide-in-right" : "slide-in-left";

        heroImage.classList.add(slideOutClass);

        setTimeout(() => {

            currentIndex = direction === "right"
                ? (currentIndex + 1) % heroes.length
                : (currentIndex - 1 + heroes.length) % heroes.length;

            // Update GIF
            heroImage.src = heroes[currentIndex].gif;

            // 🔥 Update NAME
            characterName.textContent = heroes[currentIndex].name;

            // Update abilities
            heroes[currentIndex].innateLeft.forEach((src, i) => {
                if (innateLeftImgs[i]) innateLeftImgs[i].src = src;
            });

            heroes[currentIndex].innateRight.forEach((src, i) => {
                if (innateRightImgs[i]) innateRightImgs[i].src = src;
            });

            animateInnates();

            heroImage.classList.remove(slideOutClass);
            heroImage.classList.add(slideInClass);

            heroImage.addEventListener("animationend", function handler() {
                heroImage.classList.remove(slideInClass);
                heroImage.removeEventListener("animationend", handler);
                isAnimating = false;
            });

        }, 400);
    }

    rightArrow.addEventListener("click", () => changeHero("right"));
    leftArrow.addEventListener("click", () => changeHero("left"));

    // 🔥 Start properly
    initializeHero();
});





