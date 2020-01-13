const mysql = require('../library/mysql');
const gradeDao = require('./gradeDao');

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

/*
 * POST PLACE and GRADE
 */

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

/*
 * PUT PLACE and GRADE
 */

async function updatePlaceTransaction(body) {
    const { name, address, legal_name, num, pk, use_idx } = body;
    const { place_idx, detail_info } = body;

    const grade_cnt = detail_info.length;
    let grade_sum = 0;

    let serverList = [];
    let userList = [];

    for (let i=0; i<detail_info.length; i++) {
        grade_sum += detail_info[i].grade;

// From here === GRADE DB maintain
        userList.push(detail_info[i].category_idx);
    }

    // GRADE DB maintain
    const serverGrades = await gradeDao.selectGradeDetailByPlaceIdx(place_idx);

    for (let i=0; i<serverGrades.length; i++) {
        serverList.push(serverGrades[i].category_idx);
    }

    const ins = userList.filter(x => !serverList.includes(x));
    const upd = userList.filter(x => serverList.includes(x));
    const del = serverList.filter(x => !userList.includes(x));

    await mysql.transaction(async (conn) => {
        await updatePlace(conn, place_idx, name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt);
        await insertGradesByList(conn, ins, place_idx, detail_info);
        await updateGradesByList(conn, upd, place_idx, detail_info);
        await deleteGradesByList(conn, del, place_idx);
    });
}

async function updatePlace(conn, place_idx, name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt) {
    const sql = `
    UPDATE PLACE SET name = ?, legal_name = ?, num = ?, pk = ?, use_idx = ?, address = ?, grade_sum = ?, grade_cnt = ?
    WHERE idx = ?
    `;

    const result = await conn.query(sql, [name, legal_name, num, pk, use_idx, address, grade_sum, grade_cnt, place_idx]);

    return result.insertId;
}

async function insertGradesByList(conn, idxList, place_idx, detail_info) {
    for (let i=0; i<detail_info.length; i++) {
        if (idxList.indexOf(detail_info[i].category_idx) != -1) {
            const sql = `
            INSERT INTO GRADE(place_idx, category_idx, grade, detail)
            VALUES(?, ?, ?, ?)
            `;
        
            await conn.query(sql, [place_idx, detail_info[i].category_idx, detail_info[i].grade, detail_info[i].detail]);
        }
    }
}

async function updateGradesByList(conn, idxList, place_idx, detail_info) {
    for (let i=0; i<detail_info.length; i++) {
        if (idxList.indexOf(detail_info[i].category_idx) != -1) {
            const sql = `
            UPDATE GRADE SET grade = ?, detail = ?
            WHERE place_idx = ? AND category_idx = ?
            `;
        
            await conn.query(sql, [detail_info[i].grade, detail_info[i].detail, place_idx, detail_info[i].category_idx]);
        }
    }
}

async function deleteGradesByList(conn, idxList, place_idx) {
    for (let i=0; i<idxList.length; i++) {
        const sql = `
        DELETE FROM GRADE
        WHERE place_idx = ? AND category_idx = ?
        `;
    
        await conn.query(sql, [place_idx, idxList[i]]);
    }
}

module.exports = {
    selectAllPlace,
    selectPlaceByIdx,
    selectPlaceByQuery,
    selectPlaceDetailByIdx,
    insertPlaceTransaction,
    updatePlaceTransaction,
};
