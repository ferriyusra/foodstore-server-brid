// import router dari express
const router = require('express').Router()

// import multer
const multer = require('multer')
const { route } = require('../product/router')

// import tag controller
const tagController = require('./controller')

// buat route baru
router.post('/tags', multer().none(), tagController.store)

router.put('/tags/:id', multer().none(), tagController.update)

router.delete('/tags/:id', multer().none(), tagController.destroy)

// export router agar bisa digunakan di app js
module.exports = router