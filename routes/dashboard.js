const express = require("express");
const router = express.Router();
const isAdminMiddleware = require("../middleware/isAdmin");
var connection = require("../config/database");
const fs = require("fs");
// add image
const multer = require("multer");

// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder for the uploaded files
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    // Define how the files should be named
    cb(null, file.originalname);
  },
});

// Initialize multer instance
const upload = multer({ storage: storage });

router.get("/toko", (req, res) => {
  connection.query(
    "SELECT * FROM jenis ORDER BY id desc",
    function (err, rows) {
      if (err) {
        req.flash("error", err);
        res.render("toko", {
          product: "semua produk",
          username: req.session.username,
          role: req.session.role,
          data: [], // Provide an empty array if there's an error
        });
      } else {
        res.render("toko", {
          product: "semua produk",
          username: req.session.username,
          role: req.session.role,
          data: rows || [], // Pass retrieved data or an empty array if no data is present
        });
      }
    }
  );
});

router.get("/makanan", (req, res) => {
  connection.query(
    'SELECT * FROM jenis WHERE jenis_produk = "makanan" ORDER BY id desc',
    function (err, rows) {
      if (err) {
        req.flash("error", err);
        res.render("toko", {
          product: "makanan",
          username: req.session.username,
          role: req.session.role,

          data: [], // render dashboard with empty data on error
        });
      } else {
        res.render("toko", {
          product: "makanan",
          username: req.session.username,
          role: req.session.role,

          data: rows || [], // render dashboard with retrieved data
        });
      }
    }
  );
});

router.get("/minuman", (req, res) => {
  connection.query(
    'SELECT * FROM jenis WHERE jenis_produk = "minuman" ORDER BY id desc',
    function (err, rows) {
      if (err) {
        req.flash("error", err);
        res.render("toko", {
          product: "minuman",
          username: req.session.username,
          role: req.session.role,
          data: [],
        });
      } else {
        res.render("toko", {
          product: "minuman",
          username: req.session.username,
          role: req.session.role,

          data: rows || [], // render dashboard with retrieved data
        });
      }
    }
  );
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/toko");
});
// router.get("/add-data", isAdminMiddleware, (req, res) => {
//   res.render("creat", {
//     nama: "",
//     jenis_produk: "",
//     harga: "",
//     deskripsi: "",
//     gambar: "",
//   });
// });
router.get("/edit-data", isAdminMiddleware, (req, res) => {
  res.render("update", {
    nama: "",
    jenis_produk: "",
    harga: "",
    deskripsi: "",
    gambar: "",
  });
});

router.get("/toko/delete/:idData", function (req, res, next) {
  let idData = req.params.idData; // Pastikan mengambil idData dari params

  connection.query(
    `SELECT gambar FROM jenis WHERE id=${idData}`,
    function (err, result) {
      if (err) {
        req.flash("error", result);
        res.redirect("/toko");
      } else {
        let imageName = result[0].gambar;
        var deleteData = `DELETE FROM jenis WHERE id=${idData}`; // Perbaiki penamaan tabel

        connection.query(deleteData, function (err, result) {
          if (err) {
            req.flash("error", result);
            res.redirect("/toko");
          } else {
            if (imageName) {
              fs.unlinkSync(`public/images/${imageName}`);
            }
            // req.flash("success", "Data berhasil dihapus");
            res.redirect("/toko");
          }
        });
      }
    }
  );
});

router.get("/add-data", isAdminMiddleware, function (req, res) {
  res.render("creat", {
    action: "/store",
    nama: "",
    harga: "",
    deskripsi: "",
    jenis_produk: "",
    gambar: "",
  });
});

router.post("/store", upload.single("gambar"), function (req, res, next) {
  let nama = req.body.nama;
  let harga = req.body.harga;
  let deskripsi = req.body.deskripsi;
  let jenis_produk = req.body.jenis_produk;
  let gambar = req.file ? req.file.originalname : "";
  let errors = false;

  if (
    nama.length === 0 ||
    harga.length === 0 ||
    jenis_produk.length === 0 ||
    deskripsi.length === 0 ||
    gambar.length === 0
  ) {
    errors = true;
    req.flash("error", "Invalid input data");
    res.render("creat", {
      nama: nama,
      harga: harga,
      deskripsi: deskripsi,
      jenis_produk: jenis_produk,
      gambar: gambar,
    });
  }

  if (!errors) {
    let formData = {
      nama: nama,
      harga: harga,
      deskripsi: deskripsi,
      jenis_produk: jenis_produk,
      gambar: gambar,
    };
    connection.query(
      "INSERT INTO jenis SET ?",
      formData,
      function (error, result) {
        if (error) {
          req.flash("error", error);
          res.render("creat", {
            nama: formData.nama,
            harga: formData.harga,
            deskripsi: formData.deskripsi,
            jenis_produk: formData.jenis_produk,
            gambar: formData.gambar,
          });
        } else {
          // req.flash("Success", "Data Product already be saved");
          res.redirect("/toko");
        }
      }
    );
  }
});

router.get("/edit-data/:idData", function (req, res, next) {
  let idData = req.params.idData;

  connection.query(
    `SELECT * FROM jenis WHERE id = ${idData}`,
    function (error, rows) {
      if (error) throw error;

      if (req.length <= 0) {
        req.flash("Error", `Data dengan ID ${idData} tidak ditemukan`);
        res.redirect("/toko");
      } else {
        res.render("creat", {
          action: `/update/${idData}`,
          page: "Halaman edit",
          nama: rows[0].nama,
          harga: rows[0].harga,
          deskripsi: rows[0].deskripsi,
          jenis_produk: rows[0].jenis_produk,
          gambar: rows[0].gambar,
        });
      }
    }
  );
});

router.post(
  "/update/:idData",
  upload.single("gambar"),
  function (req, res, next) {
    let idData = req.params.idData;
    let nama = req.body.nama;
    let harga = req.body.harga;
    let deskripsi = req.body.deskripsi;
    let jenis_produk = req.body.jenis_produk;
    let errors = false;

    if (
      nama.length === 0 ||
      harga.length === 0 ||
      jenis_produk.length === 0 ||
      deskripsi.length === 0
    ) {
      errors = true;
      req.flash("error", "Invalid input data");
      return res.render("creat", {
        nama: nama,
        harga: harga,
        deskripsi: deskripsi,
        jenis_produk: jenis_produk,
      });
    }

    connection.query(
      `SELECT gambar FROM jenis WHERE id = ${idData}`,
      function (error, results) {
        if (error) {
          req.flash("error", error);
          return res.render("creat", {
            page: "Halaman edit",
            nama: nama,
            harga: harga,
            deskripsi: deskripsi,
            jenis_produk: jenis_produk,
          });
        }

        let prevImage = results[0].gambar;

        if (prevImage) {
          fs.unlinkSync("public/images/" + prevImage);
        }

        let formData = {
          nama: nama,
          harga: harga,
          deskripsi: deskripsi,
          jenis_produk: jenis_produk,
        };

        if (req.file) {
          formData.gambar = req.file.originalname;
        }

        connection.query(
          `UPDATE jenis SET ? WHERE id = ${idData}`,
          formData,
          function (error, result) {
            if (error) {
              req.flash("error", error);
              return res.render("creat", {
                nama: formData.nama,
                harga: formData.harga,
                deskripsi: formData.deskripsi,
                jenis_produk: formData.jenis_produk,
                gambar: formData.gambar,
              });
            } else {
              // req.flash("success", "Product data has been updated");
              return res.redirect("/toko");
            }
          }
        );
      }
    );
  }
);

// router.get('add-data', function (req, res, next) {
//     res.render('creat', {
//         nama: "",
//         jenis_produk: "",
//         harga: "",
//         deskripsi: "",
//         gambar: "",
//         title: ''
//     });
// });

/**
 * STORE POST
 */
// router.post("/store", upload.single("gambar"), function (req, res, next) {
//   let nama = req.body.nama;
//   let jenis_produk = req.body.jenis_produk;
//   let harga = req.body.harga;
//   let deskripsi = req.body.deskripsi;

//   let gambar = "";

//   if (req.file && req.file.originalname) {
//     gambar = req.file.originalname;
//   }

//   let formData = {
//     nama: nama,
//     jenis_produk: jenis_produk,
//     harga: harga,
//     deskripsi: deskripsi,
//     gambar: gambar,
//   };

//   connection.query("INSERT INTO jenis SET ?", formData, function (err, result) {
//     if (err) {
//       // Handle error
//       res.render("/creat", {
//         nama: nama,
//         jenis_produk: jenis_produk,
//         harga: harga,
//         deskripsi: deskripsi,
//         // gambar:gambar,
//       });
//     } else {
//       // Redirect upon successful insertion
//       res.redirect("/toko");
//     }
//   });
// });

// router.get("/edit-data/:id", function (req, res, next) {
//   let idData = req.params.id;

//   connection.query(
//     `SELECT * FROM jenis WHERE id=${idData}`,
//     function (err, rows, fields) {
//       if (err) throw err;

//       if (rows.length <= 0) {
//         req.flash("error", `Data dengan ID ${idData} tidak ditemukan`);
//         res.redirect("/toko");
//       } else {
//         res.render("update", {
//           id: idData, // Mengirimkan variabel id ke halaman update.ejs
//           nama: rows[0].nama,
//           jenis_produk: rows[0].jenis_produk,
//           harga: rows[0].harga,
//           deskripsi: rows[0].deskripsi,
//           gambar: rows[0].gambar,
//         });
//       }
//     }
//   );
// });

// router.get("/edit-data/:id", function (req, res) {
//   let idData = req.params.id;

//   // Lakukan query ke database untuk mendapatkan data yang akan diedit
//   connection.query(
//     "SELECT * FROM data WHERE id = ?",
//     idData,
//     function (error, results) {
//       if (error) throw error;

//       if (results.length > 0) {
//         // Render halaman edit dengan data yang telah diambil dari database
//         res.render("edit-page", { data: results[0] }); // 'edit-page' adalah halaman edit yang akan dirender
//       } else {
//         res.send("Data tidak ditemukan"); // Atau respons yang sesuai jika data tidak ditemukan
//       }
//     }
//   );
// });

// Route untuk memproses pembaruan data
// router.post(
//   "/edit-data/update/:id",
//   upload.single("image"),
//   function (req, res) {
//     let idData = req.params.id;
//     let nama = req.body.nama;
//     let jenis_produk = req.body.jenis_produk;
//     let harga = req.body.harga;
//     let deskripsi = req.body.deskripsi;
//     let gambar = req.file ? req.file.originalname : "";

//     let errors = false;

//     // Validasi
//     if (
//       !nama ||
//       !jenis_produk ||
//       !harga ||
//       !deskripsi ||
//       nama.length === 0 ||
//       jenis_produk.length === 0 ||
//       harga.length === 0 ||
//       deskripsi.length === 0
//     ) {
//       errors = true;

//       req.flash("error", "Silahkan masukkan data anda");
//       return res.render("update", {
//         nama: nama,
//         jenis_produk: jenis_produk,
//         harga: harga,
//         deskripsi: deskripsi,
//       });
//     }

//     if (!errors) {
//       connection.query(
//         `SELECT gambar FROM jenis WHERE id = ${idData}`,
//         function (err, results) {
//           if (err) {
//             req.flash("error", err);
//             return res.render("update", {
//               nama: nama,
//               jenis_produk: jenis_produk,
//               harga: harga,
//               deskripsi: deskripsi,
//             });
//           } else {
//             // let previousImage = results[0].gambar;

//             if (req.file) {
//               // Menghapus gambar sebelumnya jika ada gambar baru yang diunggah
//               fs.unlinkSync("public/images/" + gambar);
//             }

//             let formData = {
//               nama: nama,
//               jenis_produk: jenis_produk,
//               harga: harga,
//               deskripsi: deskripsi,
//               gambar: previousImage, // Mengasumsikan previousImage adalah field yang benar
//             };

//             if (req.file) {
//               // Memperbarui formData dengan gambar baru jika diunggah
//               formData.gambar = req.file.originalname;
//             }

//             connection.query(
//               `UPDATE jenis SET ? WHERE id = ${idData}`,
//               formData,
//               function (err, result) {
//                 if (err) {
//                   req.flash("error", err);
//                   return res.render("update", {
//                     nama: nama,
//                     jenis_produk: jenis_produk,
//                     harga: harga,
//                     deskripsi: deskripsi,
//                   });
//                 } else {
//                   req.flash("success", "Data berhasil di Edit");
//                   return res.redirect(`/toko`);
//                 }
//               }
//             );
//           }
//         }
//       );
//     }
//   }
// );

module.exports = router;