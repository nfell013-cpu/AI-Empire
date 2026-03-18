/**
 * Notification System
 * Send SMS and email notifications for ad events
 * Uses Resend SDK for email delivery
 */

import { Resend } from 'resend';

const ADMIN_PHONE = '720-246-1534';
const ADMIN_EMAIL = 'nfell013@gmail.com';

// Initialize Resend client
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Notifications] RESEND_API_KEY not set, emails will be logged only');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send SMS notification (uses a webhook/API approach)
 * In production, integrate Twilio or similar
 */
export async function sendAdminSMS(message: string): Promise<boolean> {
  try {
    console.log(`[SMS to ${ADMIN_PHONE}]: ${message}`);

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
 * Send email notification using Resend SDK
 */
export async function sendAdminEmail(subject: string, body: string): Promise<boolean> {
  try {
    console.log(`[Email to ${ADMIN_EMAIL}]: ${subject}`);

    const resend = getResendClient();

    if (resend) {
      const { data, error } = await resend.emails.send({
        from: 'AI Empire <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject,
        html: body,
      });

      if (error) {
        console.error('[Resend] Email send error:', error);
        return false;
      }

      console.log('[Resend] Email sent successfully:', data?.id);
      return true;
    }

    // Fallback: log to console
    console.log(`[Email Body]: ${body}`);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Send a custom email to any recipient using Resend
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  from?: string
): Promise<boolean> {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.log(`[Email to ${to}]: ${subject} - ${html}`);
      return true;
    }

    const recipients = Array.isArray(to) ? to : [to];

    const { data, error } = await resend.emails.send({
      from: from || 'AI Empire <onboarding@resend.dev>',
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error('[Resend] Email error:', error);
      return false;
    }

    console.log('[Resend] Email sent:', data?.id);
    return true;
  } catch (error) {
    console.error('sendEmail error:', error);
    return false;
  }
}

/**
 * Send both SMS and email for new ad submission
 */
export async function notifyNewAdSubmission(
  adTitle: string,
  advertiserEmail: string,
  amountDollars: string
): Promise<void> {
  const smsMessage = `🆕 New Ad Submitted: "${adTitle}" by ${advertiserEmail} ($${amountDollars}). Review at /admin/ads`;
  const emailSubject = `New Ad Submission: ${adTitle}`;
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🆕 New Ad Submission Requires Review</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Ad Title:</strong> ${adTitle}</p>
        <p><strong>Advertiser:</strong> ${advertiserEmail}</p>
        <p><strong>Amount Paid:</strong> $${amountDollars}</p>
      </div>
      <p>
        <a href="${process.env.NEXTAUTH_URL || 'https://aiempire.com'}/admin/ads"
           style="background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
          Review Ad →
        </a>
      </p>
    </div>
  `;

  const results = await Promise.allSettled([
    sendAdminSMS(smsMessage),
    sendAdminEmail(emailSubject, emailBody),
  ]);

  results.forEach((result, index) => {
    const channel = index === 0 ? 'SMS' : 'Email';
    if (result.status === 'rejected') {
      console.error(`[Notification] ${channel} failed:`, result.reason);
    }
  });
}
