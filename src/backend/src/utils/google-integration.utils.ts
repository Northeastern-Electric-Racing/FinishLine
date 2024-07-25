import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { HttpException } from './errors.utils';
import stream, { Readable } from 'stream';
import concat from 'concat-stream';
import { Design_Review, User, WBS_Element } from '@prisma/client';
import { transformDate } from './datetime.utils';
import { transformStartTime } from './design-reviews.utils';

const { OAuth2 } = google.auth;
const {
  GOOGLE_DRIVE_FOLDER_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  EMAIL_REFRESH_TOKEN,
  USER_EMAIL,
  DRIVE_REFRESH_TOKEN,
  CALENDAR_REFRESH_TOKEN
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

export const sendMailToAdvisor = async (subject: string, text: string, advisor: User) => {
  try {
    //this sends an email from our email to our advisor: professor Goldstone
    const mailOptions = {
      from: USER_EMAIL,
      to: advisor.email,
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

export const createCalendar = async (teamTypeName: string) => {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    oauth2Client.setCredentials({
      refresh_token: CALENDAR_REFRESH_TOKEN
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const createdCalendar = await calendar.calendars.insert({
      requestBody: { summary: `NER ${teamTypeName} Meetings`, description: `A Team Type Within NER` }
    });

    return createdCalendar.data.id;
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * Creates A Google Calendar Event on the NER Google Calendar
 * @param members required and optional members
 * @param teamType
 * @param designReview
 * @returns the id of the calendar event
 */
export const createCalendarEvent = async (
  members: User[],
  calendarId: string | null,
  designReview: Design_Review & {
    wbsElement: WBS_Element;
  }
) => {
  if (process.env.NODE_ENV !== 'production') return;
  if (!calendarId) throw Error('no calendar id provided');
  try {
    oauth2Client.setCredentials({
      refresh_token: CALENDAR_REFRESH_TOKEN
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const startTime = transformStartTime(designReview.meetingTimes);
    const eventInput = {
      location: designReview.isInPerson ? designReview.location : designReview.zoomLink,
      summary: `Design Review - ${designReview.wbsElement.projectNumber} ${designReview.wbsElement.name}`,
      start: {
        dateTime: `${transformDate(designReview.dateScheduled)}T${startTime}:00:00-04:00`,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: `${transformDate(designReview.dateScheduled)}T${startTime + 1}:00:00-04:00`,
        timeZone: 'America/New_York'
      },
      attendees: members.map((user) => {
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
      calendarId,
      requestBody: eventInput
    });

    return calendarEvent.data.id;
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * Updates a Google Calendar Event
 * @param calendarId Id of the calendar the event is on
 * @param eventId Id of the calendar event
 * @param members required and optional members
 * @param designReview
 * @returns the id of the updated calendar event
 */
export const updateCalendarEvent = async (
  calendarId: string | null,
  eventId: string,
  members: User[],
  designReview: Design_Review & {
    wbsElement: WBS_Element;
  }
) => {
  if (!calendarId) throw Error('no calendar id provided');
  try {
    oauth2Client.setCredentials({
      refresh_token: CALENDAR_REFRESH_TOKEN
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const startTime = transformStartTime(designReview.meetingTimes);
    const eventInput = {
      location: designReview.isInPerson ? designReview.location : designReview.zoomLink,
      summary: `Design Review - ${designReview.wbsElement.projectNumber} ${designReview.wbsElement.name}`,
      start: {
        dateTime: `${transformDate(designReview.dateScheduled)}T${startTime}:00:00-04:00`,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: `${transformDate(designReview.dateScheduled)}T${startTime + 1}:00:00-04:00`,
        timeZone: 'America/New_York'
      },
      attendees: members.map((user) => {
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
    const calendarEvent = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventInput
    });
    return calendarEvent.data.id;
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * deletes a Google Calendar Event
 * @param calendarId id of the calendar the event is on
 * @param eventId the id of the calendar event
 * @returns the deleted calendar event
 */
export const deleteCalendarEvent = async (calendarId: string | null, eventId: string) => {
  if (!calendarId) throw Error('No calendar id provided');
  try {
    oauth2Client.setCredentials({
      refresh_token: CALENDAR_REFRESH_TOKEN
    });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarEvent = await calendar.events.delete({
      calendarId,
      eventId
    });
    return calendarEvent;
  } catch (error: unknown) {
    throw error;
  }
};
