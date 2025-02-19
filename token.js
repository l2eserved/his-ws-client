import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from './firebase_setting.js';

import dotenv from 'dotenv';
dotenv.config();


// ✅ เริ่ม Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ ฟังก์ชัน Login และดึง ID Token
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken(); // ✅ ดึง ID Token
        console.log(`[✅] ID Token: ${idToken}`);
        return idToken;
    } catch (error) {
        console.error('[❌] Login failed:', error.message);
    }
}

const param1 = process.argv[2]; // ค่าพารามิเตอร์ตัวแรก
const param2 = process.argv[3]; // ค่าพารามิเตอร์ตัวที่สอง

if(process.argv.slice(2) == [] || param2 == undefined || param1 == undefined)
    {
        console.log('UID env : ', process.env.email);
        console.log('PEM env : ', process.env.password);
        // ✅ ทดลอง Login
        loginUser(process.env.email, process.env.password);

    }
    else
    {
        console.log('UID param : ', param1);
        console.log('PEM param : ', param2);
        loginUser(param1, param2);
    }

