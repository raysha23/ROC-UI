
//ADDED
document.addEventListener("DOMContentLoaded", function () {

    // 🔥 Array of heroes with corresponding innate-left and innate-right abilities
    const heroes = [
        {
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
    const leftArrow = document.querySelector(".arrow-btn.left");
    const rightArrow = document.querySelector(".arrow-btn.right");

    const innateLeftImgs = document.querySelectorAll(".innate-left img");
    const innateRightImgs = document.querySelectorAll(".innate-right img");

    if (!heroImage || !leftArrow || !rightArrow || 
        innateLeftImgs.length === 0 || innateRightImgs.length === 0) {
        console.error("Elements not found.");
        return;
    }

    // ✅ Slide up animation function
    function animateInnates() {
        [...innateLeftImgs, ...innateRightImgs].forEach(img => {
            img.classList.remove("innate-slide-up");   // remove first
            void img.offsetWidth;                      // force reflow
            img.classList.add("innate-slide-up");      // add to trigger animation
        });
    }

  function changeHero(direction) {
    if (isAnimating) return;
    isAnimating = true;

    // Determine slide classes based on direction
    const slideOutClass = direction === "right" ? "slide-out-left" : "slide-out-right";
    const slideInClass = direction === "right" ? "slide-in-right" : "slide-in-left";

    // Slide out current GIF
    heroImage.classList.add(slideOutClass);

    setTimeout(() => {
        // Update index
        currentIndex = direction === "right"
            ? (currentIndex + 1) % heroes.length
            : (currentIndex - 1 + heroes.length) % heroes.length;

        // Update hero GIF
        heroImage.src = heroes[currentIndex].gif;

        // Update innate-left images
        heroes[currentIndex].innateLeft.forEach((src, i) => {
            if (innateLeftImgs[i]) innateLeftImgs[i].src = src;
        });

        // Update innate-right images
        heroes[currentIndex].innateRight.forEach((src, i) => {
            if (innateRightImgs[i]) innateRightImgs[i].src = src;
        });

        // Trigger slide-up animation
        animateInnates();

        // Remove previous slide-out class
        heroImage.classList.remove(slideOutClass);

        // Add slide-in class
        heroImage.classList.add(slideInClass);

        // Remove slide-in class after animation
        heroImage.addEventListener("animationend", function handler() {
            heroImage.classList.remove(slideInClass);
            heroImage.removeEventListener("animationend", handler);
            isAnimating = false;
        });

    }, 400); // match original transition
}


    rightArrow.addEventListener("click", () => changeHero("right"));
    leftArrow.addEventListener("click", () => changeHero("left"));
});
