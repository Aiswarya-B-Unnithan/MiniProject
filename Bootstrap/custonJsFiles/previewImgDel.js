document.getElementById("file").addEventListener("change", function (event) {
  console.log("script");
  const imagePreviews = document.getElementById("imagePreviews");
  imagePreviews.innerHTML = ""; // Clear existing previews

  for (const file of event.target.files) {
    const imgContainer = document.createElement("div");
    imgContainer.className = "image-preview-container";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "100px";
    img.style.maxHeight = "100px";

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", function () {
      imgContainer.remove();
      updateSelectedImages();
    });

    imgContainer.appendChild(img);
    imgContainer.appendChild(deleteButton);
    imagePreviews.appendChild(imgContainer);
  }

  updateSelectedImages();
});

function updateSelectedImages() {
  const selectedImages = [];
  const imageContainers = document.querySelectorAll(
    ".image-preview-container img"
  );
  for (const img of imageContainers) {
    selectedImages.push(img.src);
  }

  // Update form field with selected image URLs
  document.getElementById("post_img_data").value = selectedImages.join(",");
}
