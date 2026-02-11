const http = require('http');
const fs = require('fs');

const email = 'newuser' + Date.now() + '@example.com';
const data = JSON.stringify({
  email: email,
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
});

console.log('Registering with email:', email);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
    fs.writeFileSync('test_output.txt', `Status: ${res.statusCode}\nBody: ${body}\n`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
