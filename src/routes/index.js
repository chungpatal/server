var express = require('express');
var router = express.Router();

// place route
const place = require('./place');

// place 경로의 요청
router.use('/place', place);

module.exports = router;
