const placeService = require('../service/placeService');
const { response, errorResponse } = require('../library/response');


async function getList(req, res) {
    try {
        const result = await placeService.getList(req.params.categoryIdx); 
        response('Success', result, res, 200);

    } catch (error) {
        console.log(error);
        errorResponse(error.message, res, error.statusCode);
    }
}

async function getSearch(req, res) {
    try {
        const result = await placeService.getSearch(req.query.q); 
        response('Success', result, res, 200);

    } catch (error) {
        console.log(error);
        errorResponse(error.message, res, error.statusCode);
    }
}

async function getDetail(req, res) {
    try {
        const result = await placeService.getDetail(req.params.placeIdx); 
        response('Success', result, res, 200);

    } catch (error) {
        console.log(error);
        errorResponse(error.message, res, error.statusCode);
    }
}

async function postPlace(req, res) {
    try {
        const result = await placeService.postPlace(req.body); 
        response('Success', result, res, 200);

    } catch (error) {
        console.log(error);
        errorResponse(error.message, res, error.statusCode);
    }
}

async function putPlace(req, res) {
    try {
        const result = await placeService.putPlace(req.body); 
        response('Success', result, res, 200);

    } catch (error) {
        console.log(error);
        errorResponse(error.message, res, error.statusCode);
    }
}

module.exports = {
    getList,
    getSearch,
    getDetail,
    postPlace,
    putPlace,
};
