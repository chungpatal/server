const mysql = require('../library/mysql');``

async function selectAllPlace() {
    const sql = `
    SELECT idx AS place_idx, name, pk, CONCAT(legal_name, "/", num) AS info, (grade_sum / grade_cnt) AS grade
    FROM Checkmate.PLACE
    ORDER BY grade DESC
    `;

    const result = await mysql.query(sql, []);

    return result
}

async function selectPlaceByIdx(placeIdx) {
    const sql = `
    SELECT idx AS place_idx, name, pk, CONCAT(legal_name, "/", num) AS info, (grade_sum / grade_cnt) AS grade
    FROM Checkmate.PLACE
    WHERE idx = (?)
    `;

    const result = await mysql.query(sql, [placeIdx]);

    return result
}

module.exports = {
    selectAllPlace,
    selectPlaceByIdx,
};
