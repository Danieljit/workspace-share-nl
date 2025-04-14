// Script to test Cloudinary connection
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with hardcoded credentials
cloudinary.config({
  cloud_name: 'dsbf4alw4',
  api_key: '779398313839322',
  api_secret: 'Sj5dduhVPp57FHok5zD471-fXlo'
});

// Function to test the connection
async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  console.log('Cloud Name: dsbf4alw4');
  
  try {
    // Try to get account info to verify credentials
    const result = await cloudinary.api.ping();
    console.log('\u2705 Successfully connected to Cloudinary!');
    console.log('Response:', result);
    
    // Check if the upload preset exists
    console.log('\nChecking upload preset...');
    const presets = await cloudinary.api.upload_presets({ max_results: 500 });
    const uploadPreset = 'workspace_share';
    const foundPreset = presets.presets.find(preset => preset.name === uploadPreset);
    
    if (foundPreset) {
      console.log(`\u2705 Upload preset '${uploadPreset}' exists!`);
    } else {
      console.log(`\u274c Upload preset '${uploadPreset}' not found. You need to create it in the Cloudinary dashboard.`);
    }
    
  } catch (error) {
    console.error('\u274c Failed to connect to Cloudinary:');
    console.error(error.message);
    if (error.http_code) {
      console.error(`HTTP Status: ${error.http_code}`);
    }
  }
}

// Run the test
testCloudinaryConnection();
