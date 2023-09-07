const User = require("../../models/userModel");
const mongoose = require("mongoose");
module.exports = {
  Get_All_Users: async (req, res) => {
    const admin = req.session.admin;
    // Fetch list of users from the database
    User.find()
      .lean()
      .then((users) => {
        res.render("admin/userManagement", { users, admin });
      })
      .catch((error) => {
        res.render("admin/userManagement", { error: "Error fetching users" });
      });
  },
  Block_User: async (req, res) => {
    const userId = req.params.userId;

    // Fetch the user from the database
    User.findById(userId)
      .then((user) => {
        // Toggle the blocked status
        user.blocked = !user.blocked;
        // Save the updated user in the database
        return user.save();
      })
      .then((updatedUser) => {
        req.session.user = updatedUser;
        res.redirect("/admin/users");
      })
      .catch((error) => {
        res.redirect("/admin/users");
      });
  },
};
