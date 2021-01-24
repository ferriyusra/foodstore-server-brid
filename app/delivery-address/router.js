const router = require('express').Router();
const multer = require('multer');

// import addressController
const addressController = require('./controller')

// definisikan _route_ untuk _endpoint_ `create` alamat pengiriman
router.post('/delivery-addresses', multer().none(), addressController.store)
router.put('/delivery-addresses/:id', multer().none(), addressController.update)
router.delete('/delivery-addresses/:id', addressController.destroy)
router.get('/delivery-addresses', addressController.index)


module.exports = router;
