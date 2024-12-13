export const emailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SWOM Exchange Community!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
        }
        .banner {
            width: 100%;
            height: auto;
        }
        .headline {
            padding: 20px;
            text-align: center;
            background-color: #f8f8f8;
        }
        .separator {
            width: 100%;
            height: 2px;
            background-color: #000000;
        }
        .message {
            padding: 20px;
        }
        .list {
            padding-left: 20px;
            margin: 10px 0;
        }
        .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f8f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://i.imgur.com/CAQjsjK.jpeg" alt="Header Image" class="banner">
        <div class="headline">
            <h1>Welcome to SWOM Exchange Community!</h1>
        </div>
        <div class="separator"></div>
        <div class="message">
            <p>Dear ${name},</p>
            <p>Congratulations! We are thrilled to inform you that your application to join the SWOM Exchange Community has been accepted.</p>
            <p>To get started, please follow these steps:</p>
            <ol class="list">
                <li>Check your email for a password reset link and follow the steps to set your password.</li>
                <li>After you set a password a verification code will be sent to the same email. Enter that code.
                </li>
                <li>Once verified, you will be redirected to make your payment securely through Stripe.</li>
                <li>After your payment is confirmed, log in, revise your listing, edit your profile, and update your login information within your member dashboard.</li>
            </ol>
            <p>Welcome to our community! We look forward to your active participation and sharing wonderful experiences with fellow SWOM Exchange members.</p>
            <p>If you have any questions or need assistance during the onboarding process, please don't hesitate to reach out.</p>
            <p>Best regards,</p>
            <p><strong>Ana Gomez</strong><br>SWOM Exchange Community Team</p>
        </div>
        <div class="separator"></div>
        <div class="footer">
            <p>If you need help, feel free to contact us:</p>
            <p>Email: <a href="mailto:info@swom.travel">info@swom.travel</a></p>
        </div>
    </div>
</body>
</html>
`;
