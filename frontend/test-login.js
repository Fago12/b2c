
async function main() {
  console.log('Testing POST /api/auth/sign-in/email...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000' 
      },
      body: JSON.stringify({
        email: 'ayoyemisola@gmail.com',
        password: '12345678A'
      })
    });
    
    console.log(`Response Status: ${response.status}`);
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
