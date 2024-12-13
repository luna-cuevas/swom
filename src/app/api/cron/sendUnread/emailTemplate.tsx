export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unread Message Notification</title>
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
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007BFF;
            text-decoration: none;
            border-radius: 5px;
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
            <h1>A new message awaits in your SWOM Inbox</h1>
        </div>
        <div class="separator"></div>
        <div class="message">
            <p>Hi there!</p>
            <p>Just a friendly reminder that a <b>potential home swap</b> might be hiding in your SWOM inbox!</p>
            <p>Open it up and discover who could be your <b>host for an unforgettable adventure!</b></p>
        </div>
        <div class="button-container">
            <a href="https://www.swom.travel" class="button">Head over to SWOM now!</a>
        </div>
        <div class="separator"></div>
        <div class="footer">
            <p>P.S. Still have questions about SWOM? Our friendly support team is here to help!</p>
            <p>Email: <a href="mailto:info@swom.travel">info@swom.travel</a></p>
            <p>Happy swoming!</p>
        </div>
    </div>
</body>
</html>
`;
