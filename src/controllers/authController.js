const passport = require("passport");
const generateToken = require("../../utils/generateToken");

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }

    const token = generateToken(user);
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.FRONTEND_URL);
  });
};

module.exports = {
  googleAuth,
  googleCallback,
  logout,
};
