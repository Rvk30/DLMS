const http = require('http');

const FRONTEND_URL = 'http://localhost:3000';

const routesToCheck = [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/search',
    '/fines',
    '/transactions'
];

async function checkRoute(route) {
    try {
        const res = await fetch(`${FRONTEND_URL}${route}`);
        return { route, status: res.status, ok: res.ok };
    } catch (error) {
        return { route, status: 'ERROR', ok: false, message: error.message };
    }
}

async function verifyFrontend() {
    console.log("🚀 Starting Frontend Verification...");
    console.log("-----------------------------------------");

    let allPassed = true;

    for (const route of routesToCheck) {
        const result = await checkRoute(route);
        if (result.ok) {
            console.log(`✅ [${result.status}] ${result.route}`);
        } else {
            console.log(`❌ [${result.status}] ${result.route} - ${result.message || 'Failed to load'}`);
            allPassed = false;
        }
    }

    console.log("-----------------------------------------");
    if (allPassed) {
        console.log("🏁 All frontend routes rendered successfully.");
    } else {
        console.log("⚠ Some frontend routes failed to render.");
    }
}

verifyFrontend();
