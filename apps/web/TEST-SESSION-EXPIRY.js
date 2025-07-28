// 🧪 SESSION EXPIRY TESTING SCRIPT
// Run this in browser console after logging in

console.log("🧪 Session Expiry Testing Script Loaded");

// Test 1: Check current token status
function checkCurrentToken() {
    console.log("\n=== CURRENT TOKEN STATUS ===");

    try {
        // Try to get NextAuth session from localStorage or sessionStorage
        const nextAuthSession = localStorage.getItem('next-auth.session-token') ||
            sessionStorage.getItem('next-auth.session-token');

        if (!nextAuthSession) {
            console.log("❌ No NextAuth session found");
            return;
        }

        console.log("✅ NextAuth session found");

        // Try to get the JWT from the current session
        if (window.next_auth_session) {
            const token = window.next_auth_session.accessToken;
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = new Date(payload.exp * 1000);
                const now = new Date();
                const timeLeft = expiry - now;

                console.log("🕐 Token expires at:", expiry.toLocaleString());
                console.log("🕐 Current time:", now.toLocaleString());
                console.log("⏰ Time left:", Math.floor(timeLeft / 1000), "seconds");

                if (timeLeft <= 0) {
                    console.log("❌ TOKEN IS EXPIRED!");
                } else if (timeLeft <= 10 * 60 * 1000) {
                    console.log("⚠️ Token expires in less than 10 minutes");
                } else {
                    console.log("✅ Token is valid");
                }
            }
        }
    } catch (error) {
        console.error("Error checking token:", error);
    }
}

// Test 2: Simulate expired token API call
async function testExpiredTokenAPI() {
    console.log("\n=== TESTING API WITH EXPIRED TOKEN ===");

    try {
        const response = await fetch('/api/auth/session', {
            headers: {
                'Authorization': 'Bearer expired-invalid-token-for-testing'
            }
        });

        console.log("Response status:", response.status);
        console.log("Response:", await response.text());
    } catch (error) {
        console.error("API call error:", error);
    }
}

// Test 3: Trigger session expiry warning manually
function triggerSessionWarning() {
    console.log("\n=== TRIGGERING SESSION WARNING ===");

    // Dispatch custom event to trigger warning
    window.dispatchEvent(new CustomEvent('test-session-warning', {
        detail: { timeLeft: 5 * 60 * 1000 } // 5 minutes left
    }));

    console.log("✅ Session warning event dispatched");
}

// Test 4: Force session expiry
function forceSessionExpiry() {
    console.log("\n=== FORCING SESSION EXPIRY ===");

    // Clear all session storage
    localStorage.clear();
    sessionStorage.clear();

    // Dispatch expiry event
    window.dispatchEvent(new CustomEvent('force-session-expiry'));

    console.log("✅ Session cleared and expiry event dispatched");
    console.log("🔄 Page should redirect to login...");
}

// Test 5: Monitor API calls for auth errors
function monitorAPIcalls() {
    console.log("\n=== MONITORING API CALLS ===");

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        if (response.status === 401) {
            console.log("🚨 401 UNAUTHORIZED detected!");
            console.log("URL:", args[0]);
            console.log("Status:", response.status);
        }

        return response;
    };

    console.log("✅ API monitoring enabled");
}

// Main testing function
function runSessionTests() {
    console.log("🧪 Running all session expiry tests...\n");

    checkCurrentToken();

    setTimeout(() => testExpiredTokenAPI(), 1000);
    setTimeout(() => triggerSessionWarning(), 2000);

    monitorAPIcalls();

    console.log("\n📋 Available test functions:");
    console.log("- checkCurrentToken()");
    console.log("- testExpiredTokenAPI()");
    console.log("- triggerSessionWarning()");
    console.log("- forceSessionExpiry()");
    console.log("- monitorAPIcalls()");
}

// Auto-run tests
runSessionTests();

// Make functions available globally
window.sessionTests = {
    checkCurrentToken,
    testExpiredTokenAPI,
    triggerSessionWarning,
    forceSessionExpiry,
    monitorAPIcalls,
    runSessionTests
};

console.log("\n✅ Testing script ready! Use window.sessionTests.* to run individual tests"); 