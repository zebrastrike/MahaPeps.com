import * as dotenv from 'dotenv';
import * as path from 'path';
import Mailgun from 'mailgun.js';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import FormData using require (needed for mailgun.js)
const formData = require('form-data');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

async function sendTestEmail() {
  console.log('\n🚀 Testing Mailgun Email Configuration...\n');
  console.log('Configuration:');
  console.log(`  - Domain: ${process.env.MAILGUN_DOMAIN}`);
  console.log(`  - From: ${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`);
  console.log(`  - Zelle ID: ${process.env.ZELLE_ID}`);
  console.log(`  - CashApp Tag: ${process.env.CASHAPP_TAG}`);
  console.log('');

  const testRecipients = ['edward@giddyupp.com', 'scott@mahapeps.com'];

  // Use the configured from email address
  const fromAddress = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;

  const emailData = {
    from: `${process.env.MAILGUN_FROM_NAME} <${fromAddress}>`,
    to: testRecipients,
    subject: 'Test Order Confirmation #TEST123 - Payment Instructions',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <h1 style="color: #111827; margin-bottom: 8px;">Test Order Confirmation</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Order #TEST123</p>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ This is a Test Email</p>
            <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
              Testing Mailgun configuration with payment information.
            </p>
          </div>

          <h2 style="color: #111827; font-size: 18px; margin-top: 32px; margin-bottom: 16px;">Payment Information Test</h2>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
              Order Number: <span style="color: #2563eb; font-size: 28px; font-family: monospace;">#TEST123</span>
            </p>
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #111827;">
              Total Amount Due: <span style="color: #059669; font-size: 24px;">$150.00</span>
            </p>

            <p style="margin: 16px 0 8px 0; font-weight: 600; color: #111827;">Payment Methods:</p>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">
                <strong>Zelle:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${process.env.ZELLE_ID}</code>
                <br><span style="font-size: 13px; color: #6b7280;">Include "#TEST123" in note field</span>
              </li>
              <li style="margin-bottom: 8px;">
                <strong>CashApp:</strong> Send to <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${process.env.CASHAPP_TAG}</code>
                <br><span style="font-size: 13px; color: #6b7280;">Include "#TEST123" in note field</span>
              </li>
              <li><strong>Wire Transfer:</strong> Contact support@mahapeps.com for wire instructions</li>
            </ul>
          </div>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              ✅ <strong>Email Configuration Working!</strong> Payment information is correctly displayed.
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">
              <strong>RESEARCH USE ONLY</strong><br>
              All products sold on this platform are intended solely for lawful laboratory research and analytical use.
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log(`📧 Sending test email to: ${testRecipients.join(', ')}\n`);

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN || '', emailData);

    console.log('✅ Email sent successfully!\n');
    console.log('Response:', response);
    console.log('\n📬 Check inboxes at:');
    testRecipients.forEach(email => console.log(`   - ${email}`));
    console.log('\n💡 Using domain:', process.env.MAILGUN_DOMAIN);

  } catch (error: any) {
    console.error('\n❌ Error sending email:\n');
    console.error(error.message);
    if (error.details) {
      console.error('\nDetails:', error.details);
    }
    process.exit(1);
  }
}

// Run the test
sendTestEmail()
  .then(() => {
    console.log('\n✨ Test completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
