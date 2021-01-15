const fs = require('fs')
const path = require('path')

// (1) import model `Product`
const Product = require('./model')

// import model category untuk relasi one to one
const Category = require('../categories/model');

// import model tag untuk relasi one to many
const Tag = require('../tag/model')

// import config
const config = require('../config');


// buat function index untuk endpoint daftar product
async function index(req, res, next) {
    try {

        // pagination
        let { limit = 10, skip = 0, q = '', category = '', tags = [] } = req.query

        // variabel criteria untuk kita gunakan saat melakukan query ke MongoDB
        let criteria = {}

        // lakukan pengecekkan apakah variabel q memiliki nilai teks yang artinya client 
        // mengirimkan query string q
        if (q.length) {
            // jika variabel q memiliki nilai, kita gabungkan dengan variabel criteria

            // --- gabungkan dengan criteria --- //
            criteria = {
                ...criteria,
                name: { $regex: `${q}`, $options: 'i' }
            }
        }


        // melakukan pengecekkan apakah variabel category memiliki nilai
        if (category.length) {
            // mencari category tersebut di collection categories
            category = await Category.findOne({ name: { $regex: `${category}`, $options: 'i' } })
            // jika kategori ditemukan
            if (category) {
                criteria = { ...criteria, category: category._id }
            }
        }

        //  cek apakah tags memiliki isi
        if (tags.length) {
            // jika Array tags memiliki isi, maka kita gunakan untuk mencari ke collection Tag
            tags = Tag.findOne({ name: { $in: tags } })
            // gabungkan ke dalam criteria untuk mencari Product, untuk masing-masing tag tadi 
            // kita ambil _id nya menggunakan fungsi map
            citeria = { ...criteria, tags: { $in: tags.map(tag => tag) } }
        }


        let products =
            await Product.find(criteria)
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .populate('category')
                .populate('tags')

        // kembalikan data products
        return res.json(products)

        //////////////////////////////////////

        // kode dibawah apabila ingin menggunakan message response

        // if (products.length > 0) {
        //     res.send({
        //         status: 'success',
        //         message: 'list products ditemukan',
        //         data: products
        //     })
        // } else {
        //     res.send({
        //         status: 'success',
        //         message: 'list products tidak ditemukan',
        //     })
        // }

        //////////////////////////////////////////////////////////


    } catch (err) {
        next(err)
    }
}

// buat function store untuk endpoint tambah data
async function store(req, res, next) {

    try {
        // > tangkap data form yang dikirimkan oleh client sebagai variabel `payload`
        let payload = req.body

        // apakah ada categori yg dimasukkan
        if (payload.category) {
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } })

            if (category) {
                payload = { ...payload, category: category._id }
            } else {
                delete payload.category
            }

        }

        // apakah ada tag yg dimasukkan
        if (payload.tags && payload.tags.length) {

            let tags = await Tag.find({ name: { $in: payload.tags } })

            // (1) cek apakah tags membuahkan hasil
            if (tags.length) {

                // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
                payload = { ...payload, tags: tags.map(tag => tag._id) }

            }

        }

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

                // kode dibawah apabila ingin menggunakan message response

                // if (product) {
                //     res.send({
                //         status: 'success',
                //         message: 'add product success',
                //         data: product
                //     })
                // } else {
                //     res.send({
                //         status: 'warning',
                //         message: 'add product failed',
                //         data: product
                //     })
                // }

                //////////////////////////////////////////////////////////

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

// buat function update untuk endpoint update data
async function update(req, res, next) {

    try {
        // > tangkap data form yang dikirimkan oleh client sebagai variabel `payload`
        let payload = req.body

        // apakah ada categori yg dimasukkan
        if (payload.category) {
            let category = await Category.findOne({ name: { $regex: payload.category, $options: 'i' } })

            if (category) {
                payload = { ...payload, category: category._id }
            } else {
                delete payload.category
            }

        }

        // apakah ada tag yg dimasukkan
        if (payload.tags && payload.tags.length) {

            let tags = await Tag.find({ name: { $in: payload.tags } })

            // (1) cek apakah tags membuahkan hasil
            if (tags.length) {

                // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
                payload = { ...payload, tags: tags.map(tag => tag._id) }

            }

        }

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

                // (1) cari produk yang akan diupdate
                let product = await Product.findOne({ _id: req.params.id })

                // (2) dapatkan absolut path ke gambar dari produk yang akan diupdate
                let currentImage = `${config.rootPath}/public/upload/${product.image_url}`

                // (3) cek apakah absolute path memang ada di file system
                if (fs.existsSync(currentImage)) {

                    // (4) jika ada hapus dari file system
                    fs.unlinkSync(currentImage)
                }

                // (5) update produk ke MongoDB
                product = await Product.findOneAndUpdate(
                    { _id: req.params.id },
                    { ...payload, image_url: filename },
                    { new: true, runValidators: true }
                )

                return res.json(product)
            })

            // deteksi apabila error
            src.on('error', async () => {
                next(err)
            })

        } else {
            // (6) update produk jika tidak ada file upload
            let product = await Product.findOneAndUpdate(
                {
                    _id: req.params.id
                },
                payload,
                {
                    new: true, runValidators: true
                }
            )

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


async function destroy(req, res, next) {
    try {
        let product = await Product.findOneAndDelete({ _id: req.params.id })

        // cek apakah data produk memiliki file gambar terkait dan hapus gambar juga jika ada
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`

        if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage)
        }

        return res.json(product)

        // kode dibawah apabila ingin menggunakan message response

        // masih ada kekeliruan logic
        // jika product.deletedCount diganti jadi == 1 maka statement yg dieksekusi yg bawah

        // if (product.deletedCount != 1) {
        //     res.send({
        //         status: 'success',
        //         message: 'delete product success',
        //         data: product
        //     })
        // } else {
        //     res.send({
        //         status: 'warning',
        //         message: 'delete product failed',
        //         data: product
        //     })
        // }

        //////////////////////////////////////////////////////////

    } catch (err) {
        next(err)
    }
}

module.exports = {
    index,
    store,
    update,
    destroy
}

