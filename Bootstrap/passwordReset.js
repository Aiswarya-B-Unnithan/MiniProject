document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  console.log(form);
  const passwordInput = form.elements.password;
  const confirmPasswordInput = form.elements.confirmpassword;

  console.log("script");

  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validate password
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    if (!passwordRegex.test(passwordInput.value)) {
      confirmPasswordError.textContent = "";
      passwordError.textContent =
        "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one number.";
      return;
    }
    passwordError.textContent = "";
    // Validate confirm password
    if (passwordInput.value !== confirmPasswordInput.value) {
      passwordError.textContent = "";
      confirmPasswordError.textContent = "Passwords do not match.";
      return;
    }
    confirmPasswordError.textContent = "";
    // All validation passed
    form.submit();
  });
});
