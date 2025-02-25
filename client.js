import {
    initializeApp
} from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth';
import WebSocket from 'ws';
import {
    fetchViewData,
    fetchAllViewNames,
    fetchQueryData,
    fetchProducerData,
    fetchAllStoredProcedures
} from './dbManager.js';
import {
    firebaseConfig
} from './firebase_setting.js';

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
// โหลด list view จากไฟล์
const viewsConfigPath = path.join(process.cwd(), 'viewsConfig.json');
let viewsConfig = [];


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let socket = null;
let isConnecting = false;
let isLoggedIn = false;
let isLoggingIn = false;
let client_id = null; // เก็บ UID ของผู้ใช้


function keepAlive() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: "keep_alive" }));
        //console.log("[🔄] Sent Keep Alive message.");
    }
    setTimeout(keepAlive, 30000); // เรียกทุก 30 วินาที
}



function loadViewsConfig() {
    if (fs.existsSync(viewsConfigPath)) {
        try {
            viewsConfig = JSON.parse(fs.readFileSync(viewsConfigPath, 'utf8'));
            //console.log(`[📄] Loaded ${viewsConfig.length} views from config`);
            //console.log(`[🔍] First View Config:`, JSON.stringify(viewsConfig[0], null, 2)); // ✅ ตรวจสอบโครงสร้าง
        } catch (err) {
            console.error(`[❌] Error reading viewsConfig.json:`, err);
            viewsConfig = [];
        }
    } else {
        console.warn(`[⚠] viewsConfig.json not found!`);
    }
}

// ✅ โหลด list view ตอนเริ่มทำงาน
loadViewsConfig();


// ✅ โหลด SQL query จากไฟล์
function loadSQLQuery(viewConfig) {
    if (viewConfig.sqlfile) {
        const filePath = path.join(process.cwd(), viewConfig.sqlfile);
        if (fs.existsSync(filePath)) {
            try {
                const sqlContent = fs.readFileSync(filePath, 'utf8').trim(); // ✅ โหลดเนื้อหา SQL จริง
                console.log(`[✅] Loaded SQL from file: ${filePath}`);
                //console.log(`[📝] SQL Content (First 100 chars): ${sqlContent.substring(0, 100)}...`); // ✅ ตรวจสอบ SQL ที่โหลดมา
                return sqlContent;
            } catch (err) {
                console.error(`[❌] Error reading SQL file: ${filePath}`, err);
                return null;
            }
        } else {
            console.error(`[❌] SQL file not found: ${filePath}`);
            return null;
        }
    }
    return viewConfig.sqlquery || null;
}

function generateParams(sql, params = []) {
    // นับจำนวน "?" ใน SQL
    const placeholderCount = (sql.match(/\?/g) || []).length;

    // เติมค่า params ให้มีจำนวนเท่ากับ placeholderCount
    const filledParams = Array.from({ length: placeholderCount }, (_, i) => params[i] ?? '');

    return filledParams;
}

async function connectWebSocket(token) {
    if (isConnecting) {
        console.log('[⚠] WebSocket is already connecting...');
        return;
    }
    isConnecting = true;

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log('[⚠] WebSocket is already connected or connecting. Skipping new connection...');
        return;
    }

    console.log(`[🔗] Connecting to WebSocket with Token: ${token.substring(0, 20)}...`);
    socket = new WebSocket(`${process.env.ws_server}?token=${token}`);


    socket.onopen = async () => {
        console.log('[✅] WebSocket connected');
        keepAlive();
        for (const view of viewsConfig) {
            if (view.run_on_startup && !view.is_produce) {
                console.log(`[🔄] Running startup sync for view: ${view.viewname}`);

                let sqlQuery = loadSQLQuery(view);

                if (!sqlQuery) {
                    console.error(`[❌] No valid SQL query found for ${view.viewname}`);
                    continue;
                }

                console.log(`[📝] Executing SQL for view: ${view.viewname}`);
                //console.log(`[📝] SQL Query Preview: ${sqlQuery.substring(0, 100)}...`); // ✅ ตรวจสอบ SQL ก่อนรัน

                try {
                    const data = await fetchQueryData(sqlQuery); // ✅ ใช้ SQL query ที่โหลดจากไฟล์

                    socket.send(JSON.stringify({
                        action: 'update_data',
                        client_id: client_id,
                        view: view.viewname,
                        data
                    }));

                    console.log(`[🚀] Sent ${data.length} records from ${view.viewname} to server`);
                } catch (sqlError) {
                    console.error(`[❌] SQL execution failed for ${view.viewname}: ${sqlError.message}`);
                }
            }
            else if ( view.run_on_startup && view.is_produce ) {
                console.log(`[📝] Executing Produce for view: ${view.viewname}`);
                let params = ['',''];
                try {
                    params = generateParams(view.cmd,params)
                    const data = await fetchProducerData(view.cmd,params);
                    //console.log(data);
                    socket.send(JSON.stringify({
                        action: 'update_data',
                        client_id: client_id,
                        view: view.viewname,
                        data
                    }));

                    console.log(`[🚀] Sent ${data.length} records from ${view.viewname} to server`);
                } catch (sqlError) {
                    console.error(`[❌] SQL execution failed for ${view.viewname}: ${sqlError.message}`);
                }
            }
        }

        const views = (await fetchAllViewNames()).filter(view => view !== 'user');
        socket.send(JSON.stringify({
            action: 'initial_views',
            client_id: client_id, // ✅ ส่ง client_id ไปกับ Views
            views: views
        }));

        socket.send(JSON.stringify({
            action: 'sync_all'
        }));

        socket.send(JSON.stringify({
            action: 'register',
            client_id: client_id, // ✅ ส่ง client_id ไปกับ Views
            views: views
        }));
    };


    socket.onmessage = async (message) => {
        const response = JSON.parse(message.data);
        //console.log("[📥] Received WebSocket Request:", response);
        
        if (response.action === 'sync_view') {
            console.log(`[🔄] Syncing data for view: ${response.view}`);
            const allViewNames = await fetchAllViewNames();
            // ✅ ตรวจสอบว่า view นี้มีอยู่ใน `viewsConfig` หรือไม่
            const viewConfig = viewsConfig.find(v => v.viewname === response.view);

            // console.log("✅ viewConfig:", viewConfig);
            //console.log("✅ allViewNames:", allViewNames);
            //console.log("✅ response.view:", response.view);
            // console.log("✅ allViewNames.includes(response.view):", allViewNames.includes(response.view));


            let data;
            if (viewConfig && !allViewNames.includes(response.view)) {
                console.log(`[📝] Found viewConfig for ${response.view}, using SQL query.`);
                if(viewConfig.is_produce)
                    {
                  data = await fetchProducerData(viewConfig.cmd,['','']);         
                    }
                    else
                    {
                        const sqlQuery = loadSQLQuery(viewConfig);
                        data = await fetchQueryData(sqlQuery); // ✅ ใช้ SQL query
                    }
                socket.send(JSON.stringify({
                    action: 'update_data',
                    client_id: client_id,
                    view: response.view,
                    data
                }));
            } else if (viewConfig === undefined && allViewNames.includes(response.view)) {
                console.log(`[📝] Found Original View for ${response.view}`);
                data = await fetchViewData(response.view); // ✅ ดึงจาก View ปกติ
                // ✅ ส่งข้อมูลกลับไปที่ Server
                socket.send(JSON.stringify({
                    action: 'update_data',
                    client_id: client_id,
                    view: response.view,
                    data
                }));
            } else {
                console.error(`[❌] No viewSQLConfig and  DATABASE view name in : ${response.view}`);
            }
        }else if (response.action === 'sync_view_wait') {
            console.log(`[🔄] Syncing data for sync_view_wait: ${response.view}`);
            console.log(`[🔄] response.requestId : ${response.reqId}`);
            const allViewNames = await fetchAllViewNames();
            // ✅ ตรวจสอบว่า view นี้มีอยู่ใน `viewsConfig` หรือไม่
            const viewConfig = viewsConfig.find(v => v.viewname === response.view);

            let data;
            if (allViewNames.includes(response.view)) {
                console.log(`[📝] Found Original View for ${response.view}`);
                data = await fetchViewData(response.view); // ✅ ดึงจาก View ปกติ
                // ✅ ส่งข้อมูลกลับไปที่ Server
                socket.send(JSON.stringify({
                    action: 'update_data_sql',
                    client_id: client_id,
                    view: response.view,
                    data,
                    requestId: response.reqId, // ✅ ใส่ requestId ให้ตรงกับที่ API ส่งมา
                }));

                //console.log("sync_view_wait sync_view_wait sync_view_wait : ",response.reqId);
            } else {
                console.error(`[❌] No viewSQLConfig and  DATABASE view name in : ${response.view}`);
            }
        }
        else if (response.action === 'sync_pro_wait') {
            console.log(`[🔄] Syncing data for procedure : ${response.view}`);
            console.log(`[🔄] response.requestId : ${response.reqId}`);
            console.log(`[🔄] response.requestId : ${JSON.stringify(response.params)}`);
            const allprocedureNames = await fetchAllStoredProcedures();
            let data;
            if (allprocedureNames.includes(response.view)) {
                console.log(`[📝] Found Procedure View for ${response.view}`);

                const viewConfig = viewsConfig.find(v => v.viewname === response.view);
                console.log(`[📝] Found CODE Procedure View for ${viewConfig.cmd}`);
                data = await fetchProducerData(viewConfig.cmd,response.params); // ✅ ใช้ SQL query

                // ✅ ส่งข้อมูลกลับไปที่ Server
                socket.send(JSON.stringify({
                    action: 'update_data_sql',
                    client_id: client_id,
                    view: response.view,
                    data,
                    requestId: response.reqId, // ✅ ใส่ requestId ให้ตรงกับที่ API ส่งมา
                }));

                //console.log("sync_view_wait sync_view_wait sync_view_wait : ",response.reqId);
            } else {
                console.error(`[❌] No viewSQLConfig and  DATABASE view name in : ${response.view}`);
            }
        }
        else if (response.action === 'sync_view_client_config') { //ใช้สำหรับโลหด view ที่มีใน config เครื่อง client
            console.log(`[🔄] Syncing data for view_P: ${response.view}`);
            const allViewNames = await fetchAllViewNames();
            // ✅ ตรวจสอบว่า view นี้มีอยู่ใน `viewsConfig` หรือไม่
            const viewConfig = viewsConfig.find(v => v.viewname === response.view);
            let data;
            if (viewConfig && !allViewNames.includes(response.view)) {
                console.log(`[📝] Found viewConfig for ${response.view}, using SQL query.`);
                const sqlQuery = loadSQLQuery(viewConfig);
                data = await fetchQueryData(sqlQuery); // ✅ ใช้ SQL query
                socket.send(JSON.stringify({
                    action: 'update_data_sql',
                    client_id: client_id,
                    view: response.view,
                    data,
                    requestId: response.requestId, // ✅ ใส่ requestId ให้ตรงกับที่ API ส่งมา
                }));
            } else if (viewConfig === undefined && allViewNames.includes(response.view)) {
                console.log(`[📝] Found Original View for ${response.view}`);
                data = await fetchViewData(response.view); // ✅ ดึงจาก View ปกติ
                // ✅ ส่งข้อมูลกลับไปที่ Server
                socket.send(JSON.stringify({
                    action: 'update_data_sql',
                    client_id: client_id,
                    view: response.view,
                    requestId: response.requestId, // ✅ ใส่ requestId ให้ตรงกับที่ API ส่งมา
                    data
                }));
            } else {
                console.error(`[❌] No viewSQLConfig and  DATABASE view name in : ${response.view}`);
            }
        } else if (response.action === 'sync_all') {
            console.log(`[🔄] Syncing all views`);

            // ✅ ดึงชื่อ views ทั้งหมด
            const allViews = await fetchAllViewNames();
             console.log(`[🔄] allViews:`, allViews);

            //console.log(`[🔄] viewsConfig:`, viewsConfig);

            // ✅ กรองเฉพาะ viewsConfig ที่มี run_on_startup: true
            const startupViews = viewsConfig.filter(v => v.run_on_startup);
            //console.log(`[🔄] startupViews after filtering:`, startupViews);

            // ✅ รวม allViews และ viewsConfig ที่มี run_on_startup: true
            const viewsToSync = [
                ...allViews, // เพิ่ม views ทั้งหมดจาก allViews
                ...startupViews.filter(config => !allViews.includes(config.viewname)) // เพิ่มเฉพาะ views จาก viewsConfig ที่ไม่อยู่ใน allViews
            ].map(view => (typeof view === 'object' ? view.viewname : view)); // ตรวจสอบให้เป็นชื่อ view ที่ถูกต้อง

            console.log(`[🔄] viewsToSync:`, viewsToSync);  // ตรวจสอบ views ที่จะทำการ sync

            // ✅ ถ้า viewsToSync มีข้อมูล
            if (viewsToSync.length > 0) {
                // ✅ วนลูปเพื่อดึงข้อมูลจากแต่ละ view ที่จะ sync
                for (let view of viewsToSync) {
                    const viewConfig = viewsConfig.find(v => v.viewname === view);
                    let data;
                    //console.log(`[🔄] Syncing view: ${view} ${ JSON.stringify(viewConfig)}`);

                    if (viewConfig && viewConfig.sqlfile && viewConfig.run_on_startup ) {

                        console.log(`[📝] Found viewConfig for ${view}, using SQL query.`);
                        const sqlQuery = loadSQLQuery(viewConfig);
                        data = await fetchQueryData(sqlQuery); // ✅ ใช้ SQL query
                    } else if (viewConfig  && viewConfig.run_on_startup &&  viewConfig.is_produce) {                    
                        data = await fetchProducerData(viewConfig.cmd,['','']); // ✅ ใช้ SQL query
                    } else{
                        //console.log(`[⚠️] No SQL file or run_on_startup for ${view}, using default fetchViewData.`);
                        data = await fetchViewData(view); // ✅ ดึงจาก View ปกติ
                    }

                    // ✅ ส่งข้อมูลกลับไปที่ Server สำหรับแต่ละ view
                    console.log(`[🔄] Sending data for ${view} to server.`);
                    socket.send(JSON.stringify({
                        action: 'update_data',
                        client_id: client_id,
                        view: view,
                        data
                    }));
                }
            } else {
                console.log(`[⚠️] No views to sync. Please check the filters.`);
            }
        } else if (response.action === 'broadcast') {
            console.log(`[🔄] Broadcast Message From Server IS ${JSON.stringify(response.message)}`);
        } else if (response.action === 'run_sql') {

            console.log(`[📝] Running custom SQL for view: ${response.view}`);
            if (!response.sql) {
                console.error(`[❌] No SQL query provided for ${response.view}`);
                return;
            }

            try {   
                //console.log(`[✅] SQL codeyyyy , ${JSON.stringify(response.sql)}`);
                // 🔄 แปลง `\"` เป็น `"` และ `\n` เป็นช่องว่าง และลบ `\`
                //let sqlString = response.sql.replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\/g, '');

                //console.log(`[✅] SQL codexxxx , ${JSON.stringify(sqlString)}`);
                //console.log(`[✅] inclient req id , ${response.reqId}`);
                const result = await fetchQueryData(response.sql); // ✅ รัน SQL query
                console.log(`[✅] SQL executed, ${result.length} records found and Send.`);

                //console.log(`[✅] SQL executed, ${JSON.stringify(result)}`);

                socket.send(JSON.stringify({
                    action: 'update_data_sql',
                    client_id: client_id,
                    view: response.view,
                    requestId: response.reqId, // ✅ ใส่ requestId ให้ตรงกับที่ API ส่งมา
                    data: result

                }));

            } catch (error) {
                console.error(`[❌] SQL execution failed: ${error.message}`);
            }
        }
    };

    socket.onerror = (error) => {
        console.error('[❌] WebSocket error:', error);
        isConnecting = false;
    };

    socket.onclose = (event) => {
        console.log(`[❌] WebSocket closed (Code: ${event.code}, Reason: ${event.reason || 'No reason'}). Reconnecting in 3s...`);
        isConnecting = false;
        setTimeout(() => loginUser(), 3000);
    };
}


async function loginUser() {
    if (isLoggingIn) {
        console.log('[⚠] Already logging in, skipping...');
        return;
    }
    isLoggingIn = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, process.env.email, process.env.password);
        const user = userCredential.user;
        client_id = user.uid; // ✅ เก็บ client_id
        const token = await user.getIdToken(true);
        console.log(`[🔑] Firebase Token: ${token.substring(0, 20)}...`);
        connectWebSocket(token);
    } catch (error) {
        console.error('[❌] Login failed:', error);
    } finally {
        isLoggingIn = false;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user && !isLoggedIn) {
        isLoggedIn = true;
        client_id = user.uid; // ✅ เก็บ client_id
        user.getIdToken(true).then(token => connectWebSocket(token));
    } else {
        loginUser();
    }
});


loginUser();