const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of icons to install
const icons = [
  // Workspace related icons
  'desk',
  'building-2',
  'armchair',
  'coffee',
  'users',
  'wifi',
  'monitor',
  'calendar-check',
  'map-pin',
  'star',
  'heart',
  'search',
  'home',
  'building',
  'mail',
  'message-circle',
  'phone',
  'clock',
  'dollar-sign',
  'credit-card',
  'check-circle',
  'x-circle',
  'alert-circle',
  'info',
  'settings',
  'user',
  'key',
  'lock',
  'unlock',
  'log-out',
  'log-in',
  'upload',
  'download',
  'camera',
  'image',
  'file',
  'folder',
  'trash',
  'edit',
  'copy',
  'clipboard',
  'bookmark',
  'tag',
  'filter',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'plus',
  'minus',
  'check',
  'x',
  'menu',
  'share',
  'globe',
  'map',
  'navigation',
  'car',
  'bus',
  'train',
  'plane',
  'sun',
  'moon',
  'cloud',
  'umbrella',
  'thermometer',
  'zap',
  'battery-full',
  'bluetooth-connected',
  'wifi-off',
  'bell',
  'message-square',
  'phone-call',
  'video',
  'mic',
  'music',
  'volume-2',
  'volume-x',
  'book',
  'book-open',
  'award',
  'gift',
  'shopping-bag',
  'shopping-cart',
  'truck',
  'package',
  'calendar',
  'printer',
  'paperclip',
  'link',
  'external-link',
  'refresh-cw',
  'rotate-cw',
  'loader',
  'alert-triangle',
  'shield',
  'flag',
  'tool',
  'wrench',
  'cpu',
  'database',
  'server',
  'activity',
  'bar-chart',
  'pie-chart',
  'trending-up',
  'trending-down',
  'eye',
  'eye-off',
];

// Create a log file to track installation progress
const logFile = path.join(__dirname, 'icon-installation.log');
fs.writeFileSync(logFile, `Icon installation started at ${new Date().toISOString()}\n`);

// Function to log messages to both console and file
function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, `${message}\n`);
}

// Install icons one by one
async function installIcons() {
  let successCount = 0;
  let failCount = 0;
  const failedIcons = [];

  for (const icon of icons) {
    try {
      log(`Installing icon: ${icon}`);
      // Use --force to handle React 19 peer dependency issues
      execSync(`npx shadcn@latest add "https://icons.pqoqubbw.dev/c/${icon}.json" --force`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
      });
      log(`✅ Successfully installed ${icon}`);
      successCount++;
    } catch (error) {
      log(`❌ Failed to install ${icon}: ${error.message}`);
      failCount++;
      failedIcons.push(icon);
    }

    // Add a small delay between installations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Log summary
  log('\n==== Installation Summary ====');
  log(`Total icons attempted: ${icons.length}`);
  log(`Successfully installed: ${successCount}`);
  log(`Failed to install: ${failCount}`);
  
  if (failedIcons.length > 0) {
    log('\nFailed icons:');
    failedIcons.forEach(icon => log(`- ${icon}`));
  }
}

// Run the installation
installIcons().catch(error => {
  log(`Error during installation: ${error.message}`);
  process.exit(1);
});
