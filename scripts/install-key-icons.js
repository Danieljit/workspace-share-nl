const { execSync } = require('child_process');
const path = require('path');

// List of key icons to install (smaller set for manual installation)
const icons = [
  'building',      // For workspace buildings
  'desk',          // For desk workspaces
  'coffee',        // For co-working spaces
  'calendar-days', // For booking dates
  'map-pin',       // For location
  'star',          // For ratings
  'search',        // For search functionality
  'home',          // For home navigation
  'user',          // For user profiles
  'settings'       // For settings
];

console.log('=== Installing Key Animated Icons ===');
console.log('For each icon, select "Use --force" when prompted');
console.log('Press Ctrl+C to stop the script at any time');
console.log('======================================');

// Install icons one by one (manual prompt handling)
let currentIndex = 0;

function installNextIcon() {
  if (currentIndex >= icons.length) {
    console.log('\n✅ All key icons installed successfully!');
    return;
  }
  
  const icon = icons[currentIndex];
  console.log(`\nInstalling icon ${currentIndex + 1}/${icons.length}: ${icon}`);
  
  try {
    // Run the command and let the user handle the prompt
    execSync(`npx shadcn@latest add "https://icons.pqoqubbw.dev/c/${icon}.json"`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log(`✅ Successfully installed ${icon}`);
  } catch (error) {
    console.log(`❌ Failed to install ${icon}: ${error.message}`);
  }
  
  currentIndex++;
  installNextIcon();
}

// Start the installation process
installNextIcon();
