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

    // Email options
    const mailOptions = {
      from: email, // Sender's email
      to: 'ana@swom.travel', // Recipient's email
      subject: `New help request from ${email}`,
      text: language,
      html: `
        <h2>New help request from ${email}</h2>
        <p>Language: ${language}</p>
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
