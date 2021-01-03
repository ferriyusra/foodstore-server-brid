const fs = require('fs')
const path = require('path')

// (1) import model `Product`
const Product = require('./model')

// import config
const config = require('../config')


// buat function index untuk endpoint daftar product
async function index(req, res, next) {
    try {

        // pagination
        let { limit = 5, skip = 0 } = req.query

        let products =
            await Product.find()
                .limit(parseInt(limit))
                .skip(parseInt(skip))

        // kembalikan data products
        return res.json(products)

    } catch (err) {
        next(err)
    }
}

// buat function store untuk endpoint tambah data
async function store(req, res, next) {

    try {
        // > tangkap data form yang dikirimkan oleh client sebagai variabel `payload`
        let payload = req.body

        // cek apakah yg diupload file
        if (req.file) {
            // tangkap lokasi sementara file yg diupload
            let tmp_path = req.file.path;

            // tangkap ekstensi dari file yg diupload
            let originalExt = req.file.originalname.split('.')
            [req.file.originalname.split('.').length - 1]

            // buat nama file baru lengkap dengan ekstensi asli yg sudah ditangkap tadi
            let filename = req.file.filename + '.' + originalExt

            // note:
            // req.file.originalname merupakan nama file asli sementara req.file.filename
            // merupakan nama random yang digenerate oleh multer.
            //-------------------------------------------------------//

            // mengkonfigurasi tempat penyimpanan untuk file yang diupload
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`)

            // (1) baca file yang masih di lokasi sementara 
            const src = fs.createReadStream(tmp_path)

            // (2) pindahkan file ke lokasi permanen
            const dest = fs.createWriteStream(target_path)

            // (3) mulai pindahkan file dari `src` ke `dest`
            src.pipe(dest)

            src.on('end', async () => {
                let product = new Product({ ...payload, image_url: filename })

                // simpan Product yang baru dibuat ke MongoDB
                await product.save()

                // berikan response kepada client dengan mengembalikan product yang baru dibuat
                return res.json(product)

            })

            // deteksi apabila error
            src.on('error', async () => {
                next(err)
            })

        } else {
            // jika tidak ada gambar diupload lanjutkan dengan pengisian data tanpa gambar
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }

    } catch (err) {

        // ----- cek tipe error ---- //
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        // tangkap apabila terjadi kesalahan kemudian gunakan method next
        next(err)
    }

}

module.exports = {
    index,
    store
}