import axios from 'axios';

async function testApi() {
  try {
    const res = await axios.get('http://localhost:3001/products/slug/brand-patterned-napkin');
    const product = res.data;
    
    console.log(`Product: ${product.name}`);
    product.variants?.forEach((v: any, i: number) => {
      console.log(`\nVariant ${i}: ${v.sku}`);
      console.log(`Pattern object: ${JSON.stringify(v.pattern)}`);
      console.log(`Color object: ${JSON.stringify(v.color)}`);
    });
  } catch (err: any) {
    console.error("API call failed:", err.message);
  }
}

testApi();
