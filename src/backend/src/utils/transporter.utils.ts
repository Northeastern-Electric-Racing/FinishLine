import nodemailer from 'nodemailer';

const sendEmail = async () => {
  // configure the OAuth2 client

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET
    }
  });

  console.log('transporter', transporter);

  const mailOptions = {
    from: 'aqua.retro1@gmail.com',
    to: 'mckee.p@northeastern.edu',
    subject: 'Test Email',
    text: 'Hello World!',
    auth: {
      user: 'aqua.retro1@gmail.com',
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  };

  const info = await transporter.sendMail(mailOptions)
  
  console.log(info)
};

export default sendEmail;
