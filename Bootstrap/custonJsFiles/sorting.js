document.addEventListener("DOMContentLoaded", async function () {
  const sortingButtons = document.getElementById("sortingButtons");
  // Fetch products from the API

  const response = await fetch("/sorting");
  const products = [];
  const data = response.json().then((data) => {
    products.push(data);
    // Get the sorting buttons
    const defaultSort = document.getElementById("defaultSort");
    const lowToHighSort = document.getElementById("lowToHighSort");
    const highToLowSort = document.getElementById("highToLowSort");
    const productContainer = document.querySelector(".album .container .row"); // Container for product cards

    // Function to render products based on the provided array
    function renderProducts(productArray) {
      productContainer.innerHTML = ""; // Clear existing product cards

      productArray.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("col-md-3", "card", "mb-3", "box-shadow");
        card.innerHTML = `
                <a href="#">
                  <img src="/${product.image}" alt="" class="product-image" />
                </a>
                <div class="card-body">
                  <a href="/product/${product._id}">
                    <h5 class="card-title">${product.productName}</h5>
                  </a>
                  <p class="card-text">${product.description}</p>
                  <p class="card-text">${product.category.name}</p>
                  <p class="card-text">${product.price}</p>
                  
                </div>
            `;

        productContainer.appendChild(card);
      });
    }

    defaultSort.addEventListener("click", function () {
      // Render products array in default order
      renderProducts(products);
    });

    lowToHighSort.addEventListener("click", function () {
      const sortedProducts = products.slice().sort((a, b) => a.price - b.price);
      // Render sortedProducts array
      renderProducts(sortedProducts);
    });

    highToLowSort.addEventListener("click", function () {
      const sortedProducts = products.slice().sort((a, b) => b.price - a.price);
      // Render sortedProducts array
      renderProducts(sortedProducts);
    });

    // Initial rendering of products array
    renderProducts(products);
  });
});
