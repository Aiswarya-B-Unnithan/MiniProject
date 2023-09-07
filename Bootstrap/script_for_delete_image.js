// script.js
$(document).ready(function () {
  $(".delete-image-btn").on("click", async function () {
    const imageUrl = $(this).data("image-url");
    const productId = "{{product._id}}";

    try {
      // Send a POST request to the server to delete the image
      const response = await fetch(`/delete-image/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        // If the image deletion is successful, remove the deleted image from the DOM
        $(this).parent().remove();
      } else {
        console.log("Error deleting image.");
      }
    } catch (error) {
      console.log("Error deleting image:", error);
    }
  });
});
