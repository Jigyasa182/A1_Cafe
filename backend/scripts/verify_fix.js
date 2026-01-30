import http from 'http';

const tableName = `Test Seat ${Date.now()}`;
const postData = JSON.stringify({ name: tableName });

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/table/add',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log(`🚀 Attempting to add table: ${tableName}`);

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('📦 Response:', parsed);
            if (parsed.success) {
                console.log('✅ SUCCESS: Table added successfully!');
            } else {
                console.log('❌ FAILURE:', parsed.message);
            }
        } catch (e) {
            console.log('📦 Raw Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ ERROR: ${e.message}`);
});

req.write(postData);
req.end();
