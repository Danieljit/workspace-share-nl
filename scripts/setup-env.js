// This script creates a .env file during the Netlify build process
// It uses environment variables set in the Netlify dashboard

const fs = require('fs');

const generateEnvFile = () => {
  // Check if DATABASE_URL is set in the environment
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    console.error('Please set this variable in your Netlify dashboard.');
    process.exit(1);
  }

  // Ensure DATABASE_URL starts with postgresql:// or postgres://
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('DATABASE_URL must start with postgresql:// or postgres://');
    console.error('Current value:', dbUrl);
    process.exit(1);
  }

  // Create the .env file content
  let envContent = `DATABASE_URL="${dbUrl}"
`;

  // Add NEXTAUTH variables if they exist
  if (process.env.NEXTAUTH_URL) {
    envContent += `NEXTAUTH_URL="${process.env.NEXTAUTH_URL}"
`;
  } else {
    // Default value for Netlify deployment
    envContent += `NEXTAUTH_URL="https://workspace-share-nl.netlify.app"
`;
  }
  
  if (process.env.NEXTAUTH_SECRET) {
    envContent += `NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET}"
`;
  } else {
    // Generate a random string for development
    envContent += `NEXTAUTH_SECRET="${Math.random().toString(36).substring(2, 15)}"
`;
  }

  // Add Google OAuth credentials (with empty defaults to prevent build errors)
  envContent += `GOOGLE_CLIENT_ID="${process.env.GOOGLE_CLIENT_ID || ''}"
`;
  envContent += `GOOGLE_CLIENT_SECRET="${process.env.GOOGLE_CLIENT_SECRET || ''}"
`;

  // Add Cloudinary variables if they exist
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    envContent += `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}"
`;
  }
  
  if (process.env.CLOUDINARY_API_KEY) {
    envContent += `CLOUDINARY_API_KEY="${process.env.CLOUDINARY_API_KEY}"
`;
  }
  
  if (process.env.CLOUDINARY_API_SECRET) {
    envContent += `CLOUDINARY_API_SECRET="${process.env.CLOUDINARY_API_SECRET}"
`;
  }
  
  if (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    envContent += `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}"
`;
  }

  // Write the .env file
  try {
    fs.writeFileSync('.env', envContent);
    console.log('Successfully created .env file with the following variables:');
    console.log(envContent.replace(/".*"/g, '"***"')); // Log without exposing sensitive values
  } catch (error) {
    console.error('Error writing .env file:', error);
    process.exit(1);
  }
};

// Run the function
generateEnvFile();
