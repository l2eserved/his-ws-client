import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import WebSocket from 'ws';
import { fetchViewData, fetchAllViewNames } from './dbManager.js';

const firebaseConfig = { 
    apiKey: "AIzaSyCdYavvULjAoZzlGwH2M0apdCnyhhbB9Us",
    authDomain: "tgh-auth.firebaseapp.com",
    projectId: "tgh-auth",
    storageBucket: "tgh-auth.firebasestorage.app",
    messagingSenderId: "697488607080",
    appId: "1:697488607080:web:d755283d1aa2db0ffb78dd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let socket = null;
let isConnecting = false;
let isLoggedIn = false;
let isLoggingIn = false;
let client_id = null; // เก็บ UID ของผู้ใช้

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
    socket = new WebSocket(`ws://localhost:9090?token=${token}`);

    socket.onopen = async () => {
        console.log('[✅] WebSocket connected');
        const views = (await fetchAllViewNames()).filter(view => view !== 'user');

        socket.send(JSON.stringify({
            action: 'initial_views',
            client_id: client_id,  // ✅ ส่ง client_id ไปกับ Views
            views: views
        }));

        socket.send(JSON.stringify({ action: 'sync_all' }));
    };

    socket.onmessage = async (message) => {
        const response = JSON.parse(message.data);
        
        if (response.action === 'sync_view') {
            console.log(`[🔄] Syncing data for view: ${response.view}`);
            await checkAndUpdateData(response.view, response.params);
        } else if (response.action === 'sync_all') {
            console.log(`[🔄] Syncing all views`);
            const views = (await fetchAllViewNames()).filter(view => view !== 'user');
            socket.send(JSON.stringify({
                action: 'client_views',
                client_id: client_id,  // ✅ ส่ง client_id ไปให้ Server
                views: views
            }));
            
        }else if (response.action === 'broadcast') {
            console.log(`[🔄] Broadcast Message From Server IS ${JSON.stringify(response.message)}`);        
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

async function checkAndUpdateData(viewName) {
    const viewData = await fetchViewData(viewName);
    if (viewData.length === 0) {
        console.log(`[⚠] No data found in view "${viewName}", skipping update...`);
        return;
    }

    socket.send(JSON.stringify({
        action: 'update_data',
        client_id: client_id,  // ✅ ส่ง client_id ไปให้ Server
        view: viewName,
        data: viewData
    }));

    console.log(`[🚀] Sent ${viewData.length} records from ${viewName} to server`);
}

async function loginUser() {
    if (isLoggingIn) {
        console.log('[⚠] Already logging in, skipping...');
        return;
    }
    isLoggingIn = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, 'tgh-client@ppho.go.th', 'tgh-client@11263*');
        const user = userCredential.user;
        client_id = user.uid;  // ✅ เก็บ client_id
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
        client_id = user.uid;  // ✅ เก็บ client_id
        user.getIdToken(true).then(token => connectWebSocket(token));
    } else {
        loginUser();
    }
});

loginUser();
