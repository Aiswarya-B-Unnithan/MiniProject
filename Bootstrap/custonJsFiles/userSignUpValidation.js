const form = document.getElementById("form");
const nameInput = form.elements.name;
const emailInput = form.elements.email;
const phoneInput = form.elements.mobile;
const passwordInput = form.elements.password;
const confirmPasswordInput = form.elements.password1;
const referralCode = form.elements.referralCode.value.trim();
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
console.log(passwordInput);
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Validate name
  if (nameInput.value.trim() === "") {
    nameError.textContent = "Please enter a name.";
    return;
  }
  nameError.textContent = "";

  // Validate phone number
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    phoneError.textContent = "Please enter a 10-digit phone number.";
    return;
  }
  phoneError.textContent = "";

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    emailError.textContent = "Please enter a valid email address.";
    return;
  }
  emailError.textContent = "";

  // Validate password
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  const trimmedPassword = passwordInput.value.trim();
  if (!passwordRegex.test(trimmedPassword)) {
    passwordError.textContent =
      "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one number.";
    return;
  }
  passwordError.textContent = "";

  // Validate confirm password
  console.log("passwordInput.value", passwordInput.value);
  console.log("confirmPasswordInput.value", confirmPasswordInput.value);
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordError.textContent = "Passwords  not match...!";
    return;
  }
  confirmPasswordError.textContent = "";

  // All validation passed
  form.submit();
});
