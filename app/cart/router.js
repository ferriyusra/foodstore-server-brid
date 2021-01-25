//  import `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');


// import controller
const cartController = require('./controller')
// route update keranjang
router.put('/carts', multer().none(), cartController.update)

// route untuk view cart
router.get('/carts', cartController.index)

module.exports = router