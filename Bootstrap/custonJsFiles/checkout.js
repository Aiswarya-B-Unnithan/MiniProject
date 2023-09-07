let selectedCoupon = "";
let discountedTotal = 0;
let discountPercent = 0;
let subTotal = totalAmountWithTax;
let selectedAddressId = null;
let selectAddressId = null;

document.addEventListener("DOMContentLoaded", function () {
  // Define the takeAddressId function
  function takeAddressId(selectElement) {
    selectedAddressId = selectElement.value;
  }
});

// Define the openEditModal function
function openEditModal() {
  const editButton = document.getElementById("editButton");
  const addressId = editButton.getAttribute("data-address-id");
  // Rest of your openEditModal code...
}

document.addEventListener("DOMContentLoaded", function () {
  function placeOrder() {
    const confirmationUrl = `/address/confirmation?discountedTotal=${totalAmountWithTax}&subTotal=${subTotal}&addressId=${selectedAddressId}&selectedCoupon=${selectedCoupon}&discountPercent=${discountPercent}`;
    window.location.href = confirmationUrl;
  }
});

// Define the placeOrder function

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("editButton").addEventListener("click", function () {
    const selectElement = document.getElementById("selectedAddress");
    selectAddressId = selectElement.value;
    document
      .getElementById("editButton")
      .setAttribute("data-address-id", selectAddressId);
    openEditModal();
  });

  document
    .getElementById("updateAddressBtn")
    .addEventListener("click", function () {
      const addressId = selectAddressId;
      const editAddressForm = document.getElementById("editAddressForm");
      editAddressForm.action = `http://localhost:3000/address/editaddress/${addressId}`;
    });
});
