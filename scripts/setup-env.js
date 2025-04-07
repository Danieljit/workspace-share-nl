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

  // Create the .env file content
  const envContent = `DATABASE_URL="${process.env.DATABASE_URL}"
`;

  // Add NEXTAUTH variables if they exist
  if (process.env.NEXTAUTH_URL) {
    envContent += `NEXTAUTH_URL="${process.env.NEXTAUTH_URL}"
`;
  }
  
  if (process.env.NEXTAUTH_SECRET) {
    envContent += `NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET}"
`;
  }

  // Write the .env file
  try {
    fs.writeFileSync('.env', envContent);
    console.log('Successfully created .env file for Prisma');
  } catch (error) {
    console.error('Error creating .env file:', error);
    process.exit(1);
  }
};

generateEnvFile();
