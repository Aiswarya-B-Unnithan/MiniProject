document.addEventListener("DOMContentLoaded", function () {
  const lowToHighSortButton = document.getElementById("lowToHighSort");
  const highToLowSortButton = document.getElementById("highToLowSort");
  const productsContainer = document.querySelector(".album .row");

  lowToHighSortButton.addEventListener("click", function () {
    sortProducts(true);
  });

  highToLowSortButton.addEventListener("click", function () {
    sortProducts(false);
  });

  function sortProducts(ascending) {
    const productCards = Array.from(
      productsContainer.querySelectorAll(".col-md-4")
    );

    const sortedProductCards = productCards.slice().sort((a, b) => {
      const aPriceElement =
        a.querySelector(".px-2 .original-price-cross") ||
        a.querySelector(".px-2 h3");
      const bPriceElement =
        b.querySelector(".px-2 .original-price-cross") ||
        b.querySelector(".px-2 h3");

      const aPrice = parseFloat(aPriceElement.textContent.replace("₹", ""));

      const bPrice = parseFloat(bPriceElement.textContent.replace("₹", ""));

      if (ascending) {
        return aPrice - bPrice;
      } else {
        return bPrice - aPrice;
      }
    });

    productsContainer.innerHTML = "";
    sortedProductCards.forEach((card) => {
      productsContainer.appendChild(card);
    });
  }
});
