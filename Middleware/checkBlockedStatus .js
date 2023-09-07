// authMiddleware.js
const checkBlockedStatus = (req, res, next) => {
  console.log("session", req.session.user);
  console.log("hi");
  if (req.session.user && req.session.user.blocked) {
    // Clear the session and log the user out
    console.log("hello");
    req.session.destroy((err) => {
      if (err) {
        console.log("Error logging out:", err);
      }
      res.redirect("/login"); // Redirect to the login page after logging out
    });
  } else {
    next(); // Continue to the next middleware or route handler
  }
};

module.exports = {
  checkBlockedStatus,
};
