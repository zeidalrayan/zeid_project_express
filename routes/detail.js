const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/detail/:id", (req, res) => {
  db.query(
    `SELECT * FROM jenis WHERE id=${req.params.id}`,
    function (err, rows) {
      if (err) {
        // req.flash('error', err);
        res.redirect("/");
      } else {
        if (rows.length > 0) {
          const dataToSend = {
            harga: rows[0].harga,
            gambar: rows[0].gambar,
            nama: rows[0].nama,
            jenis_produk: rows[0].jenis_produk,
            deskripsi: rows[0].deskripsi,
          };
          res.render("detail", { data: dataToSend });
        } else {
          res.send("Data not found");
        }
      }
    }
  );
});

module.exports = router;
