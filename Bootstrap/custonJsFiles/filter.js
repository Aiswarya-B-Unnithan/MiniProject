document.addEventListener("DOMContentLoaded", function () {
  const dropdownButton = document.getElementById("status-button");
  const dropdownOptions = document.querySelector(".dropdown-options");

  dropdownButton.addEventListener("click", function () {
    dropdownOptions.classList.toggle("hidden");
  });

  document.body.addEventListener("click", function (event) {
    if (!event.target.matches(".dropdown-option")) {
      // Clicked outside the dropdown options, hide them
      dropdownOptions.classList.add("hidden");
    }
  });

  document.querySelectorAll(".dropdown-option").forEach((option) => {
    option.addEventListener("click", function () {
      const selectedStock = this.getAttribute("data-value");
      filterProducts(selectedStock);
    });
  });
});
