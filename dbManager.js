import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';


dotenv.config();


const dbConfig = {
    host: process.env.dbhost,
    port: process.env.dbport,
    user: process.env.dbuser,
    password: process.env.dbpass,
    database: process.env.dbname
};

// ✅ ฟังก์ชันดึงข้อมูลจาก View
async function fetchViewData(viewName, params = {}) {
    let connection;
    try {
        // ดึง Views จากฐานข้อมูลและ viewsConfig.json
        const [dbViews, configViews] = await Promise.all([
            fetchAllViewNames(),
            loadAllowedViews()
        ]);

        // ✅ อัปเดตเงื่อนไข: ต้องมีอยู่ใน fetchAllViewNames() หรือ viewsConfig.json อย่างใดอย่างหนึ่ง
        if (!dbViews.includes(viewName) && !configViews.includes(viewName)) {
            throw new Error(`Invalid viewName: ${viewName} is not allowed`);
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.query("SET NAMES utf8");

        // สร้าง Query โดยใช้ Parameterized Query
        const condition = Object.keys(params).map(key => `${key} = ?`).join(" AND ");
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


// ✅ ฟังก์ชันรัน SQL query ที่กำหนดเอง
async function fetchQueryData(sqlQuery) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.query("SET NAMES utf8");

        console.log(`[📝] Executing custom SQL query`);
        const [rows] = await connection.execute(sqlQuery); // ✅ รัน query ตรงๆ

        return rows;
    } catch (error) {
        console.error(`[❌] Database Error (Query): ${error.message}`);
        return [];
    } finally {
        if (connection) await connection.end();
    }
}

// ✅ ฟังก์ชันดึงชื่อ Views จากฐานข้อมูล
async function fetchAllViewNames() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.query("SET NAMES utf8");

        const query = "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_NAME LIKE 'onep_%'";
        const [rows] = await connection.execute(query);

        return rows.map(row => row.TABLE_NAME); // คืนชื่อ Views เป็น Array
    } catch (error) {
        console.error(`[❌] Error fetching view names: ${error.message}`);
        return [];
    } finally {
        if (connection) await connection.end();
    }
}

// ✅ ฟังก์ชันโหลด viewsConfig.json
async function loadAllowedViews() {
    try {
        const data = await fs.readFile("viewsConfig.json", "utf8");
        const config = JSON.parse(data);
        return config.map(item => item.viewname) || [];
    } catch (error) {
        console.error(`[❌] Error reading viewsConfig.json: ${error.message}`);
        return [];
    }
}

export { fetchViewData, fetchAllViewNames,fetchQueryData};

