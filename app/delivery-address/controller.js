const DeliveryAddress = require('./model')

const { policyFor } = require('../policy')

const { subject } = require('@casl/ability');


async function store(req, res, next) {
    let policy = policyFor(req.user)

    if (!policy.can('create', 'DeliveryAddress')) {

        return res.json({
            error: 1,
            message: `You're not allowed to perform this action`
        })

    }

    try {

        let payload = req.body
        let user = req.user

        // buat instance `DeliveryAddress` berdasarkan payload dan data `user`
        let address = new DeliveryAddress({ ...payload, user: user._id })

        //  simpan ke instance di atas ke MongoDB
        await address.save()

        //  respon dengan data `address` dari MongoDB
        return res.json(address)

    } catch (err) {

        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }

}

async function update(req, res, next) {
    let policy = policyFor(req.user);

    try {
        // dapatkan id dari req.params
        let { id } = req.params

        // buat payload dan keluarkan _id
        let { _id, ...payload } = req.body

        // (1) cek policy
        let address = await DeliveryAddress.findOne({
            _id:
                id
        });
        let subjectAddress = subject('DeliveryAddress',
            { ...address, user_id: address.user });

        if (!policy.can('update', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to modify this resource`
            });
        }
        // (1) end

        // (1) update ke MongoDB
        address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
            new:
                true
        });
        // (2) respon dengan data `address`
        return res.json(address);


    } catch (err) {
        if (err && err.name == 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

async function destroy(req, res, next) {
    let policy = policyFor(req.user);
    try {
        let { id } = req.params;

        // (1) cari address yang mau dihapus
        let address = await DeliveryAddress.findOne({
            _id: id
        });
        // (2) buat subject address
        let subjectAddress = subject({ ...address, user: address.user });

        if (!policy.can('delete', subjectAddress)) {
            return res.json({
                error: 1,
                message: `You're not allowed to delete this resource`
            });
        }

        await DeliveryAddress.findOneAndDelete({ _id: id });

        // (1) respon ke _client_
        return res.json(address);

    } catch (err) {

        if (err && err.name == 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err)

    }
}

async function index(req, res, next) {
    const policy = policyFor(req.user);

    if (!policy.can('view', 'DeliveryAddress')) {
        return res.json({
            error: 1,
            message: `You're not allowed to
            perform this action`
        });
    }

    try {
        let { limit = 10, skip = 0 } = req.query

        // (1) dapatkan jumlah data alamat pengiriman
        const count = await DeliveryAddress.find({
            user:
                req.user._id
        }).countDocuments();

        const deliveryAddresses =
            await DeliveryAddress
                .find({ user: req.user._id })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .sort('-createdAt')

        // (1) respon `data` dan `count`, `count` digunakan untuk pagination client
        return res.json({ data: deliveryAddresses, count: count })

    } catch (err) {
        if (err && err.name == 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }
        next(err)

    }

}


module.exports = {
    store,
    update,
    destroy,
    index
}
