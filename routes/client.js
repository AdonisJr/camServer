const express = require('express');
const router = express.Router();

router.use('/auth', require('../controller/auth/index'));
router.use('/uploadID', require('../controller/uploadID/index'));

module.exports = router;