const placeDao = require('../dao/placeDao');
const gradeDao = require('../dao/gradeDao');
const rp = require('request-promise-native');
const {key_id, key} = require('../../config/naverMapApi');

async function getList(categoryIdx) {
    let res;

    if (categoryIdx==0) {
        // 모든 장소 정보 조회
        res = await placeDao.selectAllPlace();

        for (let i=0; i<res.length; i++) {
            // 2: 양호, 1: 주의, 0: 경고
            if (1.6 <= res[i].grade)
                res[i].grade = 2;

            else if (0.6 <= res[i].grade)
                res[i].grade = 1;

            else
                res[i].grade = 0;
        }

        return res;
    }

    /* 
     * GRADE에서 placeIdx 조회 후
     * PLACE에서 정보 조회
     */
    placeIdxs = await gradeDao.selectPlaceIdxByCategoryIdx(categoryIdx);

    for (let i=0; i<placeIdxs.length; i++) {
        // PLACE에서 정보 조회
        place = await placeDao.selectPlaceByIdx(placeIdxs[i].place_idx);

        placeIdxs[i].name = place[0].name;
        placeIdxs[i].pk = place[0].pk;
        placeIdxs[i].info = place[0].info;

        // 2: 양호, 1: 주의, 0: 경고
        if (1.6 <= placeIdxs[i].grade)
            placeIdxs[i].grade = 2;

        else if (0.6 <= placeIdxs[i].grade)
            placeIdxs[i].grade = 1;

        else
            placeIdxs[i].grade = 0;

    }

    // sort by grade desc
    placeIdxs.sort((a, b) => {
        return a.grade > b.grade ? -1 : a.grade < b.grade ? 1 : 0;
    });

    return placeIdxs;
}

async function getSearch(q) {
    let res = await placeDao.selectPlaceByQuery(q);

    for (let i=0; i<res.length; i++) {
        // 2: 양호, 1: 주의, 0: 경고
        if (1.6 <= res[i].grade)
            res[i].grade = 2;

        else if (0.6 <= res[i].grade)
            res[i].grade = 1;

        else
            res[i].grade = 0;
    }
    
    return res;
}

async function getDetail(placeIdx) {
    let res = await placeDao.selectPlaceDetailByIdx(placeIdx);

    // 2: 양호, 1: 주의, 0: 경고
    if (1.6 <= res[0].grade)
        res[0].grade = 2;

    else if (0.6 <= res[0].grade)
        res[0].grade = 1;

    else
        res[0].grade = 0;

    if (res[0].address != null) {
        // add lat, long
        const {x, y} = await getCoord(res[0].address);

        res[0].long = x;
        res[0].lat = y;
    }

    // add grade
    let grade = await gradeDao.selectGradeDetailByPlaceIdx(placeIdx);

    res[0].detail_info = grade;

    return res[0];
}

async function getCoord(addr) {
    const options = {
        uri: 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode',
        headers: {
            'X-NCP-APIGW-API-KEY-ID': key_id,
            'X-NCP-APIGW-API-KEY': key
        },
        qs: {
            query: addr
        }
    };

    const json = JSON.parse(await rp(options));
    return {x: parseFloat(json.addresses[0].x), y: parseFloat(json.addresses[0].y)};
}

async function postPlace(body) {
    await placeDao.insertPlaceTransaction(body);
}

module.exports = {
    getList,
    getSearch,
    getDetail,
    postPlace,
};
