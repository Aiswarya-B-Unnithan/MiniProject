function generateInvoiceHtml(order, orderId) {
  const formattedOrderDate = formatDate(order.orderDate);

  const itemsHtml = order.cartItems
    .map(
      (item) => `
        <tr>
          <td>${item.product.productName}</td>
          <td>₹${item.price}</td>
          <td>₹${item.product.offerPrice}</td>
          <td>${item.quantity}</td>
          <td>₹${item.product.offerPrice * item.quantity}</td>
        </tr>
      `
    )
    .join("");

  const discountedPriceHtml = order.finalPrice
    ? `<p>Discounted Price: ₹${order.finalPrice}</p>`
    : "";

  const invoiceHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <h1>Invoice for Order #${order.customOrderID}</h1>
          <p>Order Date: ${formattedOrderDate}</p>
          <p>Total Price: ₹${order.totalPrice}</p>
          ${discountedPriceHtml}
          <p>Status: ${order.status}</p>
          <p>Customer Name: ${order.user.username}</p>
          <p>Shipping Address:  ${order.user.username}<br>${
    order.deliveringAddress.email
  } <br> ${order.deliveringAddress.address1} <br>${
    order.deliveringAddress.city
  }<br>${order.deliveringAddress.postalCode}<br>${
    order.deliveringAddress.state
  }</p>
          <p>Total Tax Percentage: 5% of Orginal MRP</p>
          <h2>Order Items:</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Orginal Price</th>
                <th>Offer Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <h3>Total Amount: ₹${order.finalPrice || order.totalPrice}</h3>
        </div>
      </body>
    </html>
  `;

  return invoiceHtml;
}

module.exports = generateInvoiceHtml;

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
