import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { email, language } = await req.json();

    // Validate required fields
    if (!email || !language) {
      return NextResponse.json({ message: 'Email and language are required' }, { status: 400 });
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or use a different email service like SendGrid, Mailgun, etc.
      auth: {
        user: 's.cuevas14@gmail.com', // Your Gmail address
        pass: process.env.GMAIL_PASSWORD, // Gmail App password
      },
    });

    const mailOptions = {
        from: email, // Sender's email (the applicant's email, for example)
        to: 'mgehring9@gmail.com', // Recipient's email
        subject: 'Re: Your Application to Join SWOM Exchange Community',
        text: `Dear ${email},
      
      Thank you for your interest in the SWOM Exchange Community. Regrettably, we cannot accommodate your application at this time. However, please know that we will keep your information on file, and should opportunities change in the future, we will be in touch.
      
      Best regards,
      SWOM Exchange Community Team`,
        html: `
          <h2>Re: Your Application to Join SWOM Exchange Community</h2>
          <p>Dear ${email},</p>
          <p>Thank you for your interest in the SWOM Exchange Community. Regrettably, we cannot accommodate your application at this time. However, please know that we will keep your information on file, and should opportunities change in the future, we will be in touch.</p>
          <br />
          <p>Best regards,</p>
          <p>SWOM Exchange Community Team</p>
        `,
      };

    // Send the email
    const response = await transporter.sendMail(mailOptions);

    // Return a success response
    return NextResponse.json({ message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    // Return an error response
    return NextResponse.json({ message: 'Error sending email', error }, { status: 500 });
  }
}
