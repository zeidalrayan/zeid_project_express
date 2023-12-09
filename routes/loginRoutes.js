const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { route } = require(".");
const { Result } = require("express-validator");

router.get("/login", (req, res) => {
  res.render("login", {
    error: req.session.error,
  });
  req.session.error = null;
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM user WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      req.session.username = username;
      req.session.role = result[0].role;
      res.redirect("/toko");
    } else {
      req.session.error = "Ada yang salah di bagian username atau password";
      res.redirect("/login");
    }
  });
});

module.exports = router;
