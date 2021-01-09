// import mongoose 
const mongoose = require('mongoose')

//  dapatkan module model dan Schema dari package mongoose
const { model, Schema } = mongoose

//  buat schema
const tagSchema = Schema({
    name: {
        type: String,
        minlength: [3, 'Panjang nama kategori minimal 3 karakter'],
        maxlength: [20, 'Panjang nama kategori maksimal 20 karakter'],
        required: [true, 'Nama kategori harus diisi']
    }
})

// buat model berdasarkan schema sekaligus export
module.exports = model('Tag', tagSchema)