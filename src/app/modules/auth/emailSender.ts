import nodemailer from 'nodemailer';
import config from '../../config';

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_password,
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  });

  await transporter.sendMail({
    from: '"nextEvent" <hydravulgaris760@gmail.com>',
    to: email,
    subject: 'Reset Password Link ',
    html,
  });
};

export default emailSender;
