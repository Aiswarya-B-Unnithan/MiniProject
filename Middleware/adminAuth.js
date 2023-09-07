const isAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.render("admin/admin-login");
  }
};
module.exports = isAdmin;
