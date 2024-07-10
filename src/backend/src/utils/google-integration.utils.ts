import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { HttpException } from './errors.utils';
import stream, { Readable } from 'stream';
import concat from 'concat-stream';
import { DesignReview } from 'shared';

const { OAuth2 } = google.auth;
const {
  GOOGLE_DRIVE_FOLDER_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  EMAIL_REFRESH_TOKEN,
  USER_EMAIL,
  DRIVE_REFRESH_TOKEN,
  ADVISOR_EMAIL,
  CALENDAR_REFRESH_TOKEN,
  CALENDAR_ACCESS_TOKEN
} = process.env;

const oauth2Client = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');

const createTransporter = async () => {
  try {
    oauth2Client.setCredentials({
      refresh_token: EMAIL_REFRESH_TOKEN
    });

    let accessToken: string | null | undefined;

    oauth2Client.getAccessToken((_err, token) => {
      accessToken = token;
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER_EMAIL,
        accessToken: accessToken?.toString(),
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN
      }
    });
    return transporter;
  } catch (err) {
    console.log('ERROR: ' + err);
    if (err instanceof Error) throw new HttpException(500, 'Failed to Create Transporter ' + err.message);
    throw err;
  }
};

export const sendMailToAdvisor = async (subject: string, text: string) => {
  try {
    //this sends an email from our email to our advisor: professor Goldstone
    const mailOptions = {
      from: USER_EMAIL,
      to: ADVISOR_EMAIL,
      subject,
      text
    };

    const emailTransporter = (await createTransporter()) as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    await emailTransporter.sendMail(mailOptions);
  } catch (err) {
    console.log('Error: ' + err);
    if (err instanceof Error) throw new HttpException(500, 'Failed to send Email ' + err.message);
  }
};

interface GoogleDriveErrorListError {
  domain: string;
  reason: string;
  message: string;
}

interface GoogleDriveError {
  errors: GoogleDriveErrorListError[];
  code: number;
  message: string;
}

//tutorial used to set this up: https://www.labnol.org/google-drive-api-upload-220412
export const uploadFile = async (fileObject: Express.Multer.File) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  oauth2Client.setCredentials({
    refresh_token: DRIVE_REFRESH_TOKEN
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
        parents: [GOOGLE_DRIVE_FOLDER_ID || '']
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
  } catch (error: unknown) {
    if ((error as GoogleDriveError).errors) {
      const gError = error as GoogleDriveError;
      throw new HttpException(
        gError.code,
        `Failed to Upload Receipt(s): ${gError.message}, ${gError.errors.reduce(
          (acc: string, curr: GoogleDriveErrorListError) => {
            return acc + ' ' + curr.message + ' ' + curr.reason;
          },
          ''
        )}`
      );
    } else if (error instanceof Error) {
      throw new HttpException(500, `Failed to Upload Receipt(s): ${error.message}`);
    }
    console.log('error' + error);
    throw error;
  }
};

//converts a Readable to a Buffer
const readableToBuffer = async (readable: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const concatStream = concat((data: Buffer) => {
      resolve(data);
    });

    readable.on('error', reject);
    readable.pipe(concatStream);
  });
};

//given the google file id, downloads the image data and return it as a Buffer along with the image type
export const downloadImageFile = async (fileId: string) => {
  oauth2Client.setCredentials({
    refresh_token: DRIVE_REFRESH_TOKEN
  });
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.get(
      {
        fileId,
        alt: 'media'
      },
      { responseType: 'stream' }
    );
    const bufferData = await readableToBuffer(res.data);
    return { buffer: bufferData, type: res.headers['content-type'] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new HttpException(500, `Failed to Download Image(${fileId}): ${error.message}`);
    }
    throw error;
  }
};

export const createCalendarEvent = async (designReview: DesignReview) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: CALENDAR_REFRESH_TOKEN,
      access_token: CALENDAR_ACCESS_TOKEN
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarIds = (await calendar.calendarList.list()).data.items?.map((calendar) => calendar.id);
    if (!calendarIds) throw Error('no calendar ids');
    const eventInput = {
      location: designReview.isInPerson ? designReview.location : designReview.zoomLink,
      summary: `${designReview.wbsNum} ${designReview.wbsName}`,
      start: {
        dateTime: '2024-07-05T09:00:00-04:00',
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: '2024-07-05T10:00:00-04:00',
        timeZone: 'America/New_York'
      },
      attendees: designReview.attendees.map((user) => {
        return { email: user.email };
      }),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const calendarEvent = await calendar.events.insert({
      calendarId: calendarIds[9] ?? 'primary',
      requestBody: eventInput,
      sendUpdates: 'all'
    });

    return calendarEvent;
  } catch (error: unknown) {
    throw error;
  }
};
