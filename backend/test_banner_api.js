
const fs = require('fs');

async function testBannerAPI() {
    let output = '';

    try {
        output += 'Testing GET /api/v1/banners/public?position=main ...\n';
        const resPublic = await fetch('http://localhost:5000/api/v1/banners/public?position=main');
        output += `Public Banner Response Status: ${resPublic.status}\n`;
        if (resPublic.ok) {
            const data = await resPublic.json();
            output += `Public Banner Data: ${JSON.stringify(data)}\n`;
        } else {
            output += `Public Banner Error: ${resPublic.statusText}\n`;
        }
    } catch (error) {
        output += `Public Banner Fetch Error: ${error.message}\n`;
    }

    try {
        output += '\nTesting GET /api/v1/banners (Protected) ...\n';
        const resProtected = await fetch('http://localhost:5000/api/v1/banners');
        output += `Protected Banner Response Status: ${resProtected.status}\n`;
        if (resProtected.status === 403) output += 'Caught 403 Forbidden as expected.\n';
        if (resProtected.status === 401) output += 'Caught 401 Unauthorized as expected.\n';
    } catch (error) {
        output += `Protected Banner Fetch Error: ${error.message}\n`;
    }

    fs.writeFileSync('banner_test_output.txt', output);
    console.log('Test completed, output written to banner_test_output.txt');
}

testBannerAPI();
