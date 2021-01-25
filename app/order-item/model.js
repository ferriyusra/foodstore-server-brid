const mongoose = require('mongoose');
const { model, Schema } = mongoose;


const orderItemSchema = Schema({
    name: {
        type: String,
        minlength: [5, 'Panjang nama makanan minimal 50 karakter'],
        required: [true, 'name must be filled']
    },

    price: {
        type: Number,
        required: [true, 'Harga item harus diisi']
    },

    qty: {
        type: Number,
        min: [1, 'Kuantitas harus diisi'],
        required: [true, 'Kuantitas harus diisi']
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }

})

module.exports = model('OrderItem', orderItemSchema);
