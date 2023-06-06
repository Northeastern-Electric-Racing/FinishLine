import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { HttpException } from './errors.utils';
import stream from 'stream';

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

const { GOOGLE_DRIVE_FOLDER_ID } = process.env;

const createTransporter = async () => {
  try {
    oauth2Client.setCredentials({
      refresh_token: process.env.EMAIL_REFRESH_TOKEN
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
        refreshToken: process.env.EMAIL_REFRESH_TOKEN
      }
    });
    return transporter;
  } catch (err) {
    console.log('ERROR: ' + err);
    return err;
  }
};

export const sendMailToAdvisor = async (subject: string, text: string) => {
  try {
    //this sends an email from our email to our advisor: professor Goldstone
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: 'mckee.p@northeastern.edu',
      subject,
      text
    };

    const emailTransporter = (await createTransporter()) as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log('Error: ' + err);
    throw new HttpException(500, 'Failed to send Email');
  }
};

//tutorial used to set this up: https://www.labnol.org/google-drive-api-upload-220412
export const uploadFile = async (fileObject: Express.Multer.File) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  oauth2Client.setCredentials({
    refresh_token: process.env.DRIVE_REFRESH_TOKEN
  });

  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.create({
      media: {
        mimeType: fileObject.mimetype,
        body: bufferStream
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [GOOGLE_DRIVE_FOLDER_ID]
      },
      fields: 'id,name'
    });

    if (!response.data.id) throw new HttpException(500, 'Error while uploading file');

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    const { id, name } = response.data;
    return { id, name };
  } catch (error: any) {
    console.log('error' + error);
    throw new HttpException(500, 'Failed to upload picture');
  }
};
