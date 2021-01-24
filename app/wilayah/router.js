const router = require('express').Router()

const wilayahController = require('./controller')

router.get('/wilayah/provinsi', wilayahController.getProvinsi)

module.exports = router