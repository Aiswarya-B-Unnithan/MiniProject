const populateEditModal = async (selectElement) => {
  console.log("from javascript");
  const selectedAddressId = selectElement.value;
  console.log(selectedAddressId);
  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId
  );

  if (selectedAddress) {
    document.getElementById("fName").value = selectedAddress.fName;
    document.getElementById("lName").value = selectedAddress.lName;
    // Populate other fields similarly
  }
};
