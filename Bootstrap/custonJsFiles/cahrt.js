// Fetch sales report data from the server
fetch("/admin/salesReport/Report")
  .then((response) => response.json())
  .then((data) => {
    const ctx = document.getElementById("chart-1").getContext("2d");
    const myChart = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: data.productNames,
        datasets: [
          {
            label: "Top Selling Products",
            data: data.productQuantities,
            backgroundColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  })
  .catch((error) => {
    console.log("Error fetching sales report data:", error);
  });

// Fetch sales report data from the server
fetch("/admin/salesReport/Report/lineGraph")
  .then((response) => response.json())
  .then((data) => {
    const productCategories = data.productCategories;
    const categoryNames = data.categoryNames;

    const categoryRevenueMap = {};

    // Calculate total revenue per category
    Object.keys(productCategories).forEach((productId) => {
      const categoryId = productCategories[productId].categoryId;
      const productName = productCategories[productId].productName;
      const order = data.orders.find((order) =>
        order.cartItems.some((item) => item.product === productId)
      );

      if (order) {
        const productPrice = order.cartItems.find(
          (item) => item.product === productId
        ).price;
        const revenue =
          productPrice *
          order.cartItems.find((item) => item.product === productId).quantity;

        if (!categoryRevenueMap[categoryId]) {
          categoryRevenueMap[categoryId] = {
            categoryName: categoryNames[categoryId],
            totalRevenue: revenue,
            products: [{ productName, revenue }],
          };
        } else {
          categoryRevenueMap[categoryId].totalRevenue += revenue;
          categoryRevenueMap[categoryId].products.push({
            productName,
            revenue,
          });
        }
      }
    });

    const ctx2 = document.getElementById("chart-2").getContext("2d");
    const myChart2 = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: Object.keys(categoryRevenueMap).map(
          (categoryId) => categoryRevenueMap[categoryId].categoryName
        ),
        datasets: [
          {
            label: "Earning",
            data: Object.keys(categoryRevenueMap).map(
              (categoryId) => categoryRevenueMap[categoryId].totalRevenue
            ),
            backgroundColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
              // Add more colors as needed
            ],
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  })
  .catch((error) => {
    console.log("Error fetching sales report data:", error);
  });
