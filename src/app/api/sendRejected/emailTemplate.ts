export const emailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Re: Your Application to Join SWOM Exchange Community</title>
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
        .button-container {
            text-align: center;
            margin: 20px 0;
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
        <img src="https://i.imgur.com/dtMoLw1.jpeg" alt="Header Image" class="banner">
        <div class="headline">
            <h1>Re: Your Application to Join SWOM Exchange Community</h1>
        </div>
        <div class="separator"></div>
        <div class="message">
            <p>Dear ${name},</p>
            <p>Thank you for your interest in the SWOM Exchange Community. Regrettably, we cannot accommodate your application at this time. However, please know that we will keep your information on file, and should opportunities change in the future, we will be in touch.</p>
            <p>Best regards,</p>
            <p><strong>SWOM Exchange Community Team</strong></p>
        </div>
        <div class="separator"></div>
        <div class="footer">
            <p>If you have any questions or need assistance, feel free to contact us:</p>
            <p>Email: <a href="mailto:info@swom.travel">info@swom.travel</a></p>
            <p>Happy swoming!</p>
        </div>
    </div>
</body>
</html>
`;
