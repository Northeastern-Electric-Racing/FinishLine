import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'northeasternelectricracing@northeastern.edu',
    pass: process.env.EMAIL_PASSWORD
  }
});

export default transporter;
