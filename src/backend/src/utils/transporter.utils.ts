import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const sendMail = async () => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/home';
  const refreshToken = process.env.OAUTH_REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken.token) throw new Error('Failed to get access token');

    console.log(accessToken.token);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'aqua.retro1@gmail.com',
        clientId,
        clientSecret,
        refreshToken,
        accessToken: accessToken.token
      }
    });

    const mailOptions = {
      from: 'aqua.retro1@gmail.com',
      to: 'mckee.p@northeastern.edu',
      subject: 'Test email',
      text: 'This is a test email'
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    throw error;
  }
};

export default sendMail;
