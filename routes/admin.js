const express = require('express');
const router = express.Router();

router.use('/user', require('../controller/user/index'));
router.use('/person', require('../controller/personOfConcern/index'));
router.use('/crime', require('../controller/crime/index'));
router.use('/fileUpload', require('../controller/fileUpload/index'));
router.use('/history', require('../controller/history/index'));
router.use('/personHistory', require('../controller/personHistory/index'));
module.exports = router;