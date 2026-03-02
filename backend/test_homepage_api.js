const http = require('http');

http.get('http://localhost:3001/homepage', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Homepage Sections:', json.length);
      
      json.forEach(section => {
        console.log(`\nSection: ${section.type}`);
        
        let products = [];
        if (section.data && section.data.products) {
          products = section.data.products;
        } else if (Array.isArray(section.data)) {
          products = section.data;
        }
        
        products.forEach(p => {
          if (p.id) { // Only log if it looks like a product
            console.log(`  - Product: ${p.name} (${p.slug})`);
            console.log(`    Has Variants: ${!!p.variants}`);
            if (p.variants) {
              console.log(`    Variants Count: ${p.variants.length}`);
              if (p.variants.length > 0) {
                 console.log(`    First Variant SKU: ${p.variants[0].sku}`);
              }
            }
          }
        });
      });
    } catch (e) {
      console.error('Failed to parse:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Fetch failed:', e.message);
});
