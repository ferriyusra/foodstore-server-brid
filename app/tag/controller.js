// import model
const Tag = require('./model')

async function store(req, res, next) {
    try {
        // dapatkan data dari request yang dikirimkan client
        let payload = req.body

        // buat objek tag baru berdasarkan payload
        let tag = new Tag(payload)

        // simpan tag ke mongodb
        await tag.save()

        // respon ke client data tag yang baru saja disimpan
        return res.json(tag)

    } catch (err) {

        // tangani error validasi dan error lain
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        next(err)

    }
}

async function update(req, res, next) {
    try {
        // dapatkan data dari request yang dikirimkan client
        let payload = req.body

        let tag = await Tag.findOneAndUpdate({ _id: req.params.id }, payload, { new: true, runValidators: true })

        // respon ke client data tag yang baru saja disimpan
        return res.json(tag)

    } catch (err) {

        // tangani error validasi dan error lain
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        next(err)

    }
}

async function destroy(req, res, next) {
    try {
        let tag = await Tag.findOneAndDelete({ _id: req.params.id })

        return res.json(tag)

    } catch (err) {
        // (1) tangani error yang disebabkan oleh validasi model
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        // (2) tangani error yang tidak kita ketahui
        next(err)

    }
}

module.exports = {
    store,
    update,
    destroy
}