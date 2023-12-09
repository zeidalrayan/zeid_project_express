var express = require('express');
var router = express.Router();
var connection = require('../library/database');
var fileSystem = require('fs');
var multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/addProduct', function(req, res) {
    res.render('addProduct', {
        action: '/store',
        name_product: '',
        price: '',
        description: '',
        category: '',
        image: ''
    })
});

router.post('/store', upload.single('image'), function(req, res, next) {
    let nameProduct = req.body.name_product
    let price = req.body.price
    let description = req.body.description
    let category = req.body.category
    let image = req.file ? req.file.originalname : '';
    let errors      = false

    if(nameProduct.length === 0 || price.length === 0 || category.length === 0 || description.length === 0 || image.length === 0) {
        errors = true
        req.flash('error', 'Invalid input data')
        res.render('addProduct', {
            name_product: nameProduct,
            price: price,
            description: description,
            category: category,
            image: image
        })
    }

    if(!errors) {
        let formData = {
            name_product: nameProduct,
            price: price,
            description: description,
            category: category,
            image: image
        }
        connection.query('INSERT INTO products SET ?', formData, function(error, result) {
            if(error) {
                req.flash('error', error)
                res.render('addProduct', {
                    name_product: formData.name_product,
                    price: formData.price,
                    description: formData.description,
                    category: formData.category,
                    image: formData.image
                })
            }else {
                req.flash('Success', 'Data Product already be saved');
                res.redirect('/')
            }
        })
    }
});

router.get('/editProduct/:idData', function(req, res, next) {
    let idData = req.params.idData

    connection.query(`SELECT * FROM products WHERE id = ${idData}`, function(error, rows) {
        if(error) throw error

        if(req.length <= 0) {
            req.flash('Error', `Data dengan ID ${idData} tidak ditemukan`);
            res.redirect('/')
        } else {
            res.render('addProduct', { 
                action: `/update/${idData}`,
                name_product: rows[0].name_product,
                price: rows[0].price,
                description: rows[0].description,
                category: rows[0].category,
                image: rows[0].image
            });
        }
    });
});

router.post('/update/:idData', upload.single('image'), function(req, res, next) {
    let idData = req.params.idData
    let nameProduct = req.body.name_product
    let price = req.body.price
    let description = req.body.description
    let category = req.body.category
    let errors = false

    if (nameProduct.length === 0 || price.length === 0 || category.length === 0 || description.length === 0) {
        errors = true
        req.flash('error', 'Invalid input data')
        return res.render('addProduct', {
            name_product: nameProduct,
            price: price,
            description: description,
            category: category,
        })
    }

    connection.query(`SELECT image FROM products WHERE id = ${idData}`, function(error, results) {
        if (error) {
            req.flash("error", error);
            return res.render("addProduct", {
                name_product: nameProduct,
                price: price,
                description: description,
                category: category,
            });
        }

        let prevImage = results[0].image

        if (prevImage) {
            fileSystem.unlinkSync('public/images/' + prevImage);
        }

        let formData = {
            name_product: nameProduct,
            price: price,
            description: description,
            category: category,
        }

        if (req.file) {
            formData.image = req.file.originalname
        }

        connection.query(`UPDATE products SET ? WHERE id = ${idData}`, formData, function(error, result) {
            if (error) {
                req.flash('error', error)
                return res.render('addProduct', {
                    name_product: formData.name_product,
                    price: formData.price,
                    description: formData.description,
                    category: formData.category,
                    image: formData.image
                })
            } else {
                req.flash('success', 'Product data has been updated');
                return res.redirect('/')
            }
        })
    })
});

module.exports = router