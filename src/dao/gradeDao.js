const mysql = require('../library/mysql');

async function selectPlaceIdxByCategoryIdx(categoryIdx) {
    const sql = `
    SELECT place_idx
    FROM Checkmate.GRADE
    WHERE category_idx = (?);
    `;

    const result = await mysql.query(sql, [categoryIdx]);

    return result
}

async function selectGradeDetailByPlaceIdx(placeIdx) {
    const sql = `
    SELECT category_idx, grade, detail
    FROM Checkmate.GRADE
    WHERE place_idx = (?);
    `;

    const result = await mysql.query(sql, [placeIdx]);

    return result
}

module.exports = {
    selectPlaceIdxByCategoryIdx,
    selectGradeDetailByPlaceIdx,
};
