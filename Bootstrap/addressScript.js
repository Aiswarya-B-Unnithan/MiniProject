$(document).ready(function () {
  // Attach event listener for the "Select Address" button
  $(".select-button").on("click", function () {
    const addressId = $(this).data("addressid");
    // Send the selected addressId to the server to store the selected address
    $.post("/select-address", { addressId }, function (response) {
      // Redirect to the pay page after successful address selection
      if (response.success) {
        window.location.href = "/pay";
      } else {
        alert("Error selecting address. Please try again.");
      }
    });
  });

  // Attach event listener for the "Add New Address" button
  $(".add-address-button").on("click", function () {
    // Redirect to the add address page
    window.location.href = "/add-address";
  });
});
$(document).ready(function () {
  // Attach event listener for the "Proceed to Pay" button
  $(".proceed-button").on("click", function (event) {
    event.preventDefault();
    const selectedAddressId = $("input[name='selectedAddress']:checked").val();
    if (!selectedAddressId) {
      alert("Please select an address.");
      return;
    }
    // Redirect to the payment page with the selected address ID as a query parameter
    window.location.href = `/address/payment?addressId=${selectedAddressId}`;
  });
});
