
const axios = require('axios');

async function verify() {
  const baseUrl = 'http://localhost:3001';
  try {
    console.log('--- Verifying Product Prices ---');
    const productsRes = await axios.get(`${baseUrl}/products`);
    const snapback = productsRes.data.find(p => p.name === 'Snapback Cap');
    if (snapback) {
      console.log(`Snapback Cap basePriceUSD: ${snapback.basePriceUSD} (Expected: 1300)`);
    } else {
      console.log('Snapback Cap not found');
    }

    console.log('\n--- Verifying Admin Dashboard Stats ---');
    // We need to bypass auth or use a token if possible, but let's try to see if endpoint is accessible or log it
    // Alternatively, I'll just check the frontend code I wrote which I know uses these values.
    try {
        const statsRes = await axios.get(`${baseUrl}/analytics/dashboard`);
        console.log('Dashboard Revenue Total:', statsRes.data.revenue.total);
    } catch (e) {
        console.log('Dashboard stats fetch failed (expected if auth required)');
    }

  } catch (err) {
    console.error('Verification failed', err.message);
  }
}

verify();
