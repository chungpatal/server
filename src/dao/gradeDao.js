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

module.exports = {
    selectPlaceIdxByCategoryIdx,
};
