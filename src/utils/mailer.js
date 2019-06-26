import nodemailer from 'nodemailer';
import { google } from 'googleapis';

function setup(accessToken) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_ACCOUNT,
      clientId: process.env.GOOGLE_API_CLIENT_ID,
      clientSecret: process.env.GOOGLE_API_CLIENT_SECRE,
      refreshToken: process.env.GOOGLE_API_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
}

export async function sendResetPasswordEmail(user) {
  const from = 'Grand Photo Salon ' + '<' + process.env.GMAIL_ACCOUNT + '>';
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URL,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN,
  });
  const tokens = await oauth2Client.refreshAccessToken();
  const accessToken = tokens.credentials.access_token;
  const transport = setup(accessToken);
  const mailOptions = {
    from,
    to: user.email,
    subject: 'Reset password',
    generateTextFromHTML: true,
    html: `
    To reset password follow this link.

    ${user.generateResetPasswordLink()}
    `,
  };

  transport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    transport.close();
  });
}

export async function sendConfirmationEmail(user) {
  const from = 'Grand Photo Salon ' + '<' + process.env.GMAIL_ACCOUNT + '>';
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_API_CLIENT_ID,
    process.env.GOOGLE_API_CLIENT_SECRET,
    process.env.GOOGLE_API_REDIRECT_URL,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_API_REFRESH_TOKEN,
  });
  const tokens = await oauth2Client.refreshAccessToken();
  const accessToken = tokens.credentials.access_token;
  const transport = setup(accessToken);
  const mailOptions = {
    from,
    to: user.email,
    subject: 'Welcome to Grand Photo Salon',
    generateTextFromHTML: true,
    html: `
    Welcom to Grand Photo Salon. Please, confirm your email.

    ${user.generateConfirmationUrl()}
    `,
  };

  transport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    transport.close();
  });
}
