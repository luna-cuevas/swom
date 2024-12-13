import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { emailTemplate } from './emailTemplate';


export async function POST(req: Request) {

  try {
    // Parse the request body
    const { email, name } = await req.json();

    // Validate required fields
    if (!email || !name) {
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
        from: 's.cuevas14@gmail.com', // Sender's email (the applicant's email, for example)
        to: email, // Recipient's email
        subject: 'Re: Your Application to Join SWOM Exchange Community',
        text: `Dear ${name},

        Congratulations! We are thrilled to inform you that your application to join the SWOM Exchange Community has been accepted.
        
        To get started, please follow these steps:
        1. Check your email for a password reset link and follow the steps to set your password.
        2. After you set a password, a verification code will be sent to the same email. Enter that code.
        3. Once verified, you will be redirected to make your payment securely through Stripe.
        4. After your payment is confirmed, log in, revise your listing, edit your profile, and update your login information within your member dashboard.
        
        Welcome to our community! We look forward to your active participation and sharing wonderful experiences with fellow SWOM Exchange members.
        
        If you have any questions or need assistance during the onboarding process, please don't hesitate to reach out.
        
        Best regards,
        Ana Gomez
        SWOM Exchange Community Team
        
        If you need help, feel free to contact us:
        Email: info@swom.travel`,
        html: emailTemplate(name),
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
