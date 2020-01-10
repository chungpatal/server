var express = require('express');
var router = express.Router();

// placeController
const placeController = require('../controller/placeController');

// 장소 리스트 가져오기
router.get('/list/:categoryIdx', placeController.getList);

// 장소 검색
router.get('/search', placeController.getSearch);

// 장소 상세보기
router.get('/detail/:placeIdx', placeController.getDetail);

// 장소 추가
router.post('/', placeController.postPlace);

// 장소 수정
router.put('/', placeController.putPlace);

module.exports = router;
