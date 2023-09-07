document.addEventListener("DOMContentLoaded", function () {
  const sortingButtons = document.getElementById("sortingButtons");
  const itemsContainer = document.querySelector(".items");
  const li = Array.from(itemsContainer.querySelectorAll("li"));

  const ar = li.map((item) => {
    const last = item.lastElementChild;
    const x = last.textContent.trim();
    const y = Number(x.substring(1));
    item.setAttribute("data-price", y);
    return item;
  });

  sortingButtons.addEventListener("click", function (event) {
    const target = event.target;

    if (target.id === "defaultSort") {
      applySorting(ar);
    } else if (target.id === "lowToHighSort") {
      applySorting(
        [...ar].sort(
          (a, b) => a.getAttribute("data-price") - b.getAttribute("data-price")
        )
      );
    } else if (target.id === "highToLowSort") {
      applySorting(
        [...ar].sort(
          (a, b) => b.getAttribute("data-price") - a.getAttribute("data-price")
        )
      );
    }
  });

  function applySorting(sortedItems) {
    while (itemsContainer.firstChild) {
      itemsContainer.removeChild(itemsContainer.firstChild);
    }
    itemsContainer.append(...sortedItems);
  }
});
