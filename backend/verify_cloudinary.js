const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verify() {
  console.log('--- CLOUDINARY VERIFICATION START ---');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  try {
    const result = await cloudinary.api.ping();
    console.log('Ping Result:', result);
    if (result.status === 'ok') {
      console.log('SUCCESS: Cloudinary credentials are valid and active!');
    } else {
      console.log('WARNING: Cloudinary ping returned unexpected status:', result);
    }
  } catch (error) {
    console.error('ERROR: Cloudinary verification failed!');
    console.error('Error Details:', error.message);
  }
  console.log('--- CLOUDINARY VERIFICATION END ---');
}

verify();
