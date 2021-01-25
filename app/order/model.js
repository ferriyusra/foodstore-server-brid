const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = Schema({
    status: {
        type: String,
        enum: ['waiting payment', 'processing', 'in_delivery', 'delivered'],
        default: 'waiting payment'
    },

    delviery_fee: {
        type: Number,
        default: 0
    },

    delivery_address: {
        provinsi: {
            type: String, required: [true, 'provinsi harus diisi.']
        },
        kabupaten: {
            type: String, required: [true, 'kabupaten harus diisi.']
        },
        kecamatan: {
            type: String, required: [true, 'kecamatan harus diisi.']
        },
        kelurahan: {
            type: String, required: [true, 'kelurahan harus diisi.']
        },
        detail: { type: String }
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    ordeer_items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }]

}, { timestamps: true })


orderSchema.plugin(AutoIncrement, { inc_field: 'order_number' })

orderSchema.virtual('items_count').get(function () {
    return this.order_items.reduce((total, item) => { return total + parseInt(item.qty) }, 0)
})

module.exports = model('Order', orderSchema)