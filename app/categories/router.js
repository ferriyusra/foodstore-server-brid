// dapatkan router dari Express
const router = require('express').Router()

// import multer untuk menangani form data
const multer = require('multer')

// import category controller
const categoryController = require('./controller')

//endpoint untuk membuat kategori baru
router.post('/categories', multer().none(), categoryController.store)

//endpoint untuk update kategori baru
router.put('/categories/:id', multer().none(), categoryController.update)

//endpoint untuk delete kategori
router.delete('/categories/:id', multer().none(), categoryController.destroy)

// export router agar bisa dipakai di file `app.js`
module.exports = router