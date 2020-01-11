const mysql = require('../library/mysql');``

async function selectAllPlace() {
    const sql = `
    SELECT idx AS place_idx, name, pk, CONCAT(legal_name, "/", num) AS info, (grade_sum / grade_cnt) AS grade
    FROM Checkmate.PLACE
    ORDER BY grade DESC
    `;

    const result = await mysql.query(sql, []);

    return result;
}

async function selectPlaceByIdx(placeIdx) {
    const sql = `
    SELECT idx AS place_idx, name, pk, CONCAT(legal_name, "/", num) AS info, (grade_sum / grade_cnt) AS grade
    FROM Checkmate.PLACE
    WHERE idx = (?)
    `;

    const result = await mysql.query(sql, [placeIdx]);

    return result;
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

    return result;
}

async function selectPlaceDetailByIdx(placeIdx) {
    const sql = `
    SELECT idx AS place_idx, name, address,(grade_sum / grade_cnt) AS grade, legal_name, num, use_idx, pk
    FROM Checkmate.PLACE
    WHERE idx = (?)
    `;

    const result = await mysql.query(sql, [placeIdx]);

    return result;
}


async function insertPlaceTransaction(body) {
    const { name, address, legal_name, num, pk, use_idx } = body;
    const { detail_info } = body;

    const grade_cnt = detail_info.length;
    let grade_sum = 0;

    for (let i=0; i<detail_info.length; i++) {
        grade_sum += detail_info[i].grade;
    }

    await mysql.transaction(async (conn) => {
        const placeIdx = await insertPlace(conn, name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt);
        await insertGrades(conn, placeIdx, detail_info);
    });
}

async function insertPlace(conn, name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt) {
    const sql = `
    INSERT INTO PLACE(name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await conn.query(sql, [name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt]);

    return result.insertId;
}

async function insertGrades(conn, placeIdx, detail_info) {
    for (let i=0; i<detail_info.length; i++) {
        const sql = `
        INSERT INTO GRADE(place_idx, category_idx, grade, detail)
        VALUES(?, ?, ?, ?)
        `;
    
        await conn.query(sql, [placeIdx, detail_info[i].category_idx, detail_info[i].grade, detail_info[i].detail]);
    }
}

module.exports = {
    selectAllPlace,
    selectPlaceByIdx,
    selectPlaceByQuery,
    selectPlaceDetailByIdx,
    insertPlaceTransaction,
};
