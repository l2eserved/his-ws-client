import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();


const dbConfig = {
    host: process.env.dbhost,
    port: process.env.dbport,
    user: process.env.dbuser,
    password: process.env.dbpass,
    database: process.env.dbname,
    charset:process.env.dbcharset
};

// ✅ ฟังก์ชันดึงข้อมูลจาก View (รองรับ Params)
 async function fetchViewData(viewName, params = {}) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.query("SET NAMES utf8");
        const condition = Object.keys(params).map(key => `${key} = ?`).join(' AND ');
        const query = condition ? `SELECT * FROM ${viewName} WHERE ${condition}` : `SELECT * FROM ${viewName}`;
        const [rows] = await connection.execute(query, Object.values(params));
        return rows;
    } catch (error) {
        console.error(`[❌] Database Error: ${error.message}`);
        return [];
    } finally {
        if (connection) await connection.end();
    }
}


// ✅ ฟังก์ชันดึงรายชื่อ View ทั้งหมดใน Database
 async function fetchAllViewNames() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.query("SET NAMES utf8");
        const query = "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_NAME like 'onep_%' ";
        const [rows] = await connection.execute(query, [dbConfig.database]);
        return rows.map(row => row.TABLE_NAME);
    } catch (error) {
        console.error(`[❌] Error fetching view names: ${error.message}`);
        return [];
    } finally {
        if (connection) await connection.end();
    }
}


export { fetchViewData, fetchAllViewNames };

