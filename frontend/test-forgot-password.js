
// Native fetch in Node 18+

async function main() {
  console.log('Testing POST /api/auth/request-password-reset...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000' 
      },
      body: JSON.stringify({
        email: 'ayoyemisola@gmail.com',
        redirectTo: '/reset-password'
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
