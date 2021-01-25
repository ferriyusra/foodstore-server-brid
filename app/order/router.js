// ( import `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');

//  import `orderController`
const orderController = require('./controller');

// route untuk membuat order
router.post('/orders', multer().none(), orderController.store)
router.get('/orders', orderController.index)


module.exports = router