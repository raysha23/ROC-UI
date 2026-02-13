<script>
document.querySelectorAll(".table-row").forEach(row => {
    const minus = row.querySelector(".minus");
    const plus = row.querySelector(".plus");
    const input = row.querySelector("input");

    if (minus && plus && input) {

        plus.addEventListener("click", () => {
            input.value = parseInt(input.value) + 1;
        });

        minus.addEventListener("click", () => {
            if (parseInt(input.value) > 0) {
                input.value = parseInt(input.value) - 1;
            }
        });

    }
});
</script>
