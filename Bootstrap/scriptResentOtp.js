// Function to resend OTP
function resendOTP() {
  fetch("/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: "{{email}}" }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Handle the response data, if needed
      console.log(data);
    })
    .catch((error) => {
      console.error("Error resending OTP:", error);
    });
}

// Countdown function for OTP expiration time
function startCountdown(expirationTime) {
  const countdownElement = document.getElementById("countdown");

  function updateCountdown() {
    const currentTime = new Date().getTime();
    const timeDifference = expirationTime - currentTime;

    if (timeDifference <= 0) {
      // If OTP has expired, hide the Resend button
      document.getElementById("resendButton").style.display = "none";
      countdownElement.innerHTML = "expired";
      return;
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `${minutes}m ${seconds}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}
