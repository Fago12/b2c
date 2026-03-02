const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/homepage',
  method: 'GET',
  headers: {
    'x-region-code': 'NG'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY:', data.substring(0, 1000), '...');
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.end();
