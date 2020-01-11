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

async function selectPlaceByQuery(q) {
    // 검색 기준: name, address, legal_name, pk, num
    const sql = `
    SELECT idx AS place_idx, name, pk, CONCAT(legal_name, "/", num) AS info, (grade_sum / grade_cnt) AS grade
    FROM Checkmate.PLACE
    WHERE name LIKE ("%${q}%")
    OR address LIKE ("%${q}%")
    OR legal_name LIKE ("%${q}%")
    OR pk LIKE ("%${q}%")
    OR num LIKE ("%${q}%")
    `;

    const result = await mysql.query(sql, []);

    return result
}

module.exports = {
    selectAllPlace,
    selectPlaceByIdx,
    selectPlaceByQuery,
};
