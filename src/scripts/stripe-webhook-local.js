/**
 * Local Stripe webhook listener for development
 * 
 * This script sets up a local webhook listener that forwards Stripe events to your local Next.js app.
 * It uses the Stripe CLI to listen for events and forward them to your webhook endpoint.
 * 
 * Usage:
 * 1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login to your Stripe account: stripe login
 * 3. Run this script: node src/scripts/stripe-webhook-local.js
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/payments/webhook';
const WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed'
];

console.log(chalk.blue('🔄 Starting Stripe webhook listener...'));
console.log(chalk.gray(`Forwarding events to ${WEBHOOK_URL}`));

// Build the command arguments
const args = [
  'listen',
  '--forward-to',
  WEBHOOK_URL,
];

// Add specific events to listen for
if (WEBHOOK_EVENTS.length > 0) {
  WEBHOOK_EVENTS.forEach(event => {
    args.push('--events');
    args.push(event);
  });
}

// Start the Stripe CLI process
const stripeProcess = spawn('stripe', args, { shell: true });

// Handle process output
stripeProcess.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('Ready')) {
    console.log(chalk.green('✅ Webhook listener is ready!'));
    console.log(chalk.yellow('💡 Use this webhook signing secret in your .env.local file:'));
  } else if (output.includes('webhook signing secret')) {
    // Extract and highlight the webhook secret
    const secretMatch = output.match(/whsec_[a-zA-Z0-9]+/);
    if (secretMatch) {
      console.log(chalk.cyan(`STRIPE_WEBHOOK_SECRET=${secretMatch[0]}`));
    }
  }
  
  console.log(output.trim());
});

stripeProcess.stderr.on('data', (data) => {
  console.error(chalk.red(`Error: ${data}`));
});

stripeProcess.on('close', (code) => {
  console.log(chalk.yellow(`Stripe webhook listener exited with code ${code}`));
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nStopping Stripe webhook listener...'));
  stripeProcess.kill();
  process.exit(0);
});
