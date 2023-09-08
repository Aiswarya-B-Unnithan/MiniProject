document.addEventListener("DOMContentLoaded", function () {
  const lowToHighSortButton = document.getElementById("lowToHighSort");
  const highToLowSortButton = document.getElementById("highToLowSort");
  const productsContainer = document.querySelector(".album .row");
  console.log("productsContainer", productsContainer);

  lowToHighSortButton.addEventListener("click", function () {
    sortProducts(true);
  });

  highToLowSortButton.addEventListener("click", function () {
    sortProducts(false);
  });

  function sortProducts(ascending) {
    const productCards = Array.from(
      productsContainer.querySelectorAll(".col-sm")
    );

    const sortedProductCards = productCards.slice().sort((a, b) => {
      const aPriceElement = a.querySelector(".offer-price.price");
      const bPriceElement = b.querySelector(".offer-price.price");
      const aRegularPriceElement = a.querySelector("h3");
      const bRegularPriceElement = b.querySelector("h3");

      let aPrice, bPrice;

      if (aPriceElement && bPriceElement) {
        aPrice = parseFloat(
          aPriceElement.textContent.replace("Now Only ₹", "")
        );
        bPrice = parseFloat(
          bPriceElement.textContent.replace("Now Only ₹", "")
        );
      } else {
        // Check if regular price elements exist, otherwise set to a default value
        aPrice = aRegularPriceElement
          ? parseFloat(aRegularPriceElement.textContent.replace("₹", ""))
          : 0;
        bPrice = bRegularPriceElement
          ? parseFloat(bRegularPriceElement.textContent.replace("₹", ""))
          : 0;
      }

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
