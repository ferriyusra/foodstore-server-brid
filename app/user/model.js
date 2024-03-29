const mongoose = require('mongoose')
const { model, Schema } = mongoose

const bcrypt = require('bcrypt')
const HASH_ROUND = 10

const AutoIncrement = require('mongoose-sequence')(mongoose)

let userSchema = Schema({
    full_name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        maxlength: [255, 'Panjang nama harus antara 3 - 255 karakter'],
        minlength: [3, 'Panjang nama harus antara 3 - 255 karakter']
    },

    customer_id: {
        type: Number
    },

    email: {
        type: String,
        required: [true, 'Email harus diisi'],
        maxlength: [255, 'Panjang email maksimal 255 karakter']
    },

    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        minlength: [6, 'Panjang password minimal 6 karakter'],
        maxlength: [255, 'Panjang passowrd maksimal 255 karakter']

    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    token: [String]

}, { timestamps: true })


userSchema.path('email').validate(async function (value) {
    try {
        // (1) lakukan pencarian ke _collection_ User berdasarkan `email`
        const count = await this.model('User').count({ email: value });

        // (2) kode ini mengindikasikan bahwa jika user ditemukan akan 
        // mengembalikan `false` jika tidak ditemukan mengembalikan `true`
        // jika `false` maka validasi gagal
        // jika `true` maka validasi berhasil
        return !count;
    } catch (err) {
        throw err
    }
}, attr => `${attr.value} sudah terdaftar`)

userSchema.path('email').validate(function (value) {
    // (1) email regular expression
    const emailRE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    // (2) test email, hasilnya adalah `true` atau `false`
    // jika ternyata `true` maka validasi berhasil
    // jika ternyata `false` maka validasi gagal
    return emailRE.test(value)

}, attr => `${attr.value} harus merupakan email yang valid!`)

userSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND)
    next()
});

userSchema.plugin(AutoIncrement, { inc_field: 'customer_id' })

module.exports = model('User', userSchema);
