/**
 * Notification System
 * Send SMS and email notifications for ad events
 */

const ADMIN_PHONE = '720-246-1534';
const ADMIN_EMAIL = 'nfell013@gmail.com';

/**
 * Send SMS notification (uses a webhook/API approach)
 * In production, integrate Twilio or similar
 */
export async function sendAdminSMS(message: string): Promise<boolean> {
  try {
    // Log for now - in production, use Twilio
    console.log(`[SMS to ${ADMIN_PHONE}]: ${message}`);

    // Twilio integration placeholder
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuth && twilioFrom) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+1${ADMIN_PHONE.replace(/-/g, '')}`,
          From: twilioFrom,
          Body: message,
        }),
      });
      return response.ok;
    }

    return true; // Return true even without Twilio (logged to console)
  } catch (error) {
    console.error('SMS notification error:', error);
    return false;
  }
}

/**
 * Send email notification
 * Uses Resend API or falls back to console log
 */
export async function sendAdminEmail(subject: string, body: string): Promise<boolean> {
  try {
    console.log(`[Email to ${ADMIN_EMAIL}]: ${subject} - ${body}`);

    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AI Empire Ads <ads@aiempire.com>',
          to: [ADMIN_EMAIL],
          subject,
          html: body,
        }),
      });
      return response.ok;
    }

    return true; // Logged to console
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Send both SMS and email for new ad submission
 */
export async function notifyNewAdSubmission(adTitle: string, advertiserEmail: string, amountDollars: string): Promise<void> {
  const smsMessage = `🆕 New Ad Submitted: "${adTitle}" by ${advertiserEmail} ($${amountDollars}). Review at /admin/ads`;
  const emailSubject = `New Ad Submission: ${adTitle}`;
  const emailBody = `
    <h2>New Ad Submission Requires Review</h2>
    <p><strong>Ad Title:</strong> ${adTitle}</p>
    <p><strong>Advertiser:</strong> ${advertiserEmail}</p>
    <p><strong>Amount Paid:</strong> $${amountDollars}</p>
    <p><a href="${process.env.NEXTAUTH_URL || 'https://aiempire.com'}/admin/ads">Review Ad →</a></p>
  `;

  await Promise.all([
    sendAdminSMS(smsMessage),
    sendAdminEmail(emailSubject, emailBody),
  ]);
}
