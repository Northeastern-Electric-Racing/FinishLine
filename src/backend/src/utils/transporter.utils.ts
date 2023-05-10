import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const { OAuth2 } = google.auth;

// const sendMail = async () => {
//   const clientId = process.env.OAUTH_CLIENT_ID;
//   const clientSecret = process.env.OAUTH_CLIENT_SECRET;
//   const redirectUri = 'http://localhost:3000/home';
//   const refreshToken = process.env.OAUTH_REFRESH_TOKEN;

//   const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

//   oAuth2Client.setCredentials({ refresh_token: refreshToken });
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();
//     if (!accessToken.token) throw new Error('Failed to get access token');

//     console.log(accessToken.token);

//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//         type: 'OAuth2',
//         user: 'aqua.retro1@gmail.com',
//         clientId,
//         clientSecret,
//         refreshToken,
//         accessToken: accessToken.token
//       }
//     });

//     const mailOptions = {
//       from: 'aqua.retro1@gmail.com',
//       to: 'mckee.p@northeastern.edu',
//       subject: 'Test email',
//       text: 'This is a test email'
//     };

//     const info = await transporter.sendMail(mailOptions);

//     console.log(`Message sent: ${info.messageId}`);
//   } catch (error) {
//     throw error;
//   }
// };

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });

    let accessToken: string | null | undefined;

    await oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log('*ERR: ', err);
        throw err;
      }
      accessToken = token;
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.USER_EMAIL,
        accessToken: accessToken?.toString(),
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
      }
    });
    return transporter;
  } catch (err) {
    return err;
  }
};

const sendMail = async (subject: string, text: string) => {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: 'mckee.p@northeastern.edu',
      subject,
      text
    };

    const emailTransporter = (await createTransporter()) as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log('ERROR: ', err);
  }
};

export default sendMail;
