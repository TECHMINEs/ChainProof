const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@chainproof.io';

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn('Sendgrid credentials not configured, skipping Email');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: 'ChainProof System' },
        subject: subject,
        content: [{ type: 'text/html', value: htmlBody }],
      })
    });

    if (!response.ok) {
      throw new Error(`Sendgrid API Error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to send Email:', error);
    return false;
  }
}
