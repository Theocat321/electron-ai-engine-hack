// Simple test script for FastAPI backend integration
const API_BASE_URL = 'http://localhost:8000';

async function testHealthEndpoint() {
    console.log('\n=== Testing Health Endpoint ===');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check passed:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function testStatusEndpoint() {
    console.log('\n=== Testing Status Endpoint ===');
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        console.log('✅ Status check passed:', data);
        return true;
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
        return false;
    }
}

async function testResetEndpoint() {
    console.log('\n=== Testing Reset Endpoint ===');
    try {
        const response = await fetch(`${API_BASE_URL}/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('✅ Reset check passed:', data);
        return true;
    } catch (error) {
        console.error('❌ Reset check failed:', error.message);
        return false;
    }
}

async function testInitializeEndpoint() {
    console.log('\n=== Testing Initialize Endpoint ===');
    try {
        // Create a simple base64 test image (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const response = await fetch(`${API_BASE_URL}/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_query: 'Test query for integration',
                screenshot_base64: testImageBase64
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Initialize endpoint passed:', data);
        
        // Verify response structure
        const requiredFields = ['x', 'y', 'task', 'task_description', 'is_completed'];
        const missingFields = requiredFields.filter(field => !(field in data));
        
        if (missingFields.length > 0) {
            console.warn('⚠️  Missing fields in response:', missingFields);
        } else {
            console.log('✅ Response structure is correct');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Initialize endpoint failed:', error.message);
        return false;
    }
}

async function testUpdateScreenshotEndpoint() {
    console.log('\n=== Testing Update Screenshot Endpoint ===');
    try {
        // First initialize a session
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        await fetch(`${API_BASE_URL}/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_query: 'Test session for update',
                screenshot_base64: testImageBase64
            })
        });

        // Then test update screenshot
        const response = await fetch(`${API_BASE_URL}/update_screenshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                screenshot_base64: testImageBase64
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Update screenshot endpoint passed:', data);
        
        // Verify response structure
        const requiredFields = ['x', 'y', 'task', 'task_description', 'is_completed'];
        const missingFields = requiredFields.filter(field => !(field in data));
        
        if (missingFields.length > 0) {
            console.warn('⚠️  Missing fields in response:', missingFields);
        } else {
            console.log('✅ Response structure is correct');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Update screenshot endpoint failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 Starting FastAPI Backend Integration Tests');
    console.log('==============================================');

    const tests = [
        testHealthEndpoint,
        testStatusEndpoint,
        testResetEndpoint,
        testInitializeEndpoint,
        testUpdateScreenshotEndpoint
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await test();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== Test Results ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);

    if (failed === 0) {
        console.log('🎉 All tests passed! Backend integration is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the backend is running and accessible.');
    }

    return failed === 0;
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // Browser environment
    window.runIntegrationTests = runAllTests;
    console.log('Integration test functions loaded. Run `runIntegrationTests()` to start.');
}