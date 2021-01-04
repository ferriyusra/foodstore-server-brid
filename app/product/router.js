//  import router dari express
const router = require('express').Router()

const multer = require('multer')
const os = require('os')

//  import product controller
const productController = require('./controller')

// route endpoint dengan method get untuk daftar product
router.get('/products', productController.index)

// route endpoint dengan method post untuk tambah data
router.post('/products', multer({
    dest: os.tmpdir()
}).single('image'), productController.store)

// route endpoint dengan method put untuk update data
router.put('/products/:id', multer({
    dest:
        os.tmpdir()
}).single('image'), productController.update);

// route endpoint dengan method delete untuk delete data
router.delete('/products/:id', productController.destroy)

// export router 
module.exports = router;