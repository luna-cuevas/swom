import { NextResponse } from 'next/server';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function POST(req: Request) {
  try {
    const { email, language, reason, message, recaptchaToken } = await req.json();

    if (!email || !reason || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Please complete the captcha' },
        { status: 400 }
      );
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'SWOM Contact',
          email: 'ana@swom.travel'
        },
        to: [{
          email: process.env.CONTACT_FORM_RECIPIENT,
          name: 'SWOM Team'
        }],
        replyTo: {
          email: email,
        },
        subject: `New Contact Form Submission - ${reason} (${language})`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #7F8119; padding-bottom: 10px;">New Contact Form Submission</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>From:</strong> ${email}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Language:</strong> ${language}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 5px; border-radius: 5px; white-space: pre-wrap; margin-top: 10px;">
                ${message}
              </div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This email was sent from the SWOM contact form. Please reply to the sender's email address directly.
            </p>
          </div>
        `,
        headers: {
          "List-Unsubscribe": `<mailto:unsubscribe@swom.travel>`,
          "X-Entity-Ref-ID": new Date().getTime().toString(),
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 