const notificationIcon = document.getElementById("notificationIcon");
const notificationModal = document.getElementById("notificationModal");
const notificationCount = document.getElementById("notificationCount");

notificationIcon.addEventListener("click", async () => {
  try {
    const response = await fetch("/admin/notifications/notifications", {
      method: "get",
    });
    const notifications = await response.json();
    console.log(notifications);
    if (notifications.length === 0) {
      Swal.fire("No Notifications", "You have no new notifications.", "info");
    } else {
      let notificationMessage = "<ul>";
      notifications.forEach((notification) => {
        notificationMessage += `
          <li>
            <strong>A New Order Placed:</strong><br>
            Order ID: ${notification._id}<br>
            Total: ${notification.totalPrice}<br>
            ${
              notification.adminViewed
                ? ""
                : `<a href="/admin/notifications/view_order/${notification._id}">View Order</a>`
            }
          </li>
        `;
      });
      notificationMessage += "</ul>";

      Swal.fire({
        title: "Notifications",
        html: notificationMessage,
        confirmButtonText: "Close",
      });
    }
  } catch (error) {
    console.log("Error fetching notifications:", "error");
  }
});

// Close the notification modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === notificationModal) {
    notificationModal.style.display = "none";
  }
});
