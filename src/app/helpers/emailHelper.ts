/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';
import AppError from '../errors/AppError';
import status from 'http-status';

type EmailAttachment = {
  filename: string;
  content: Buffer;
  encoding: string;
};

const sendEmail = async (
  email: string,
  html: string,
  subject: string,
  attachment?: EmailAttachment
): Promise<any> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Next-Event" <support@nextevent.com>',
      to: email,
      subject,
      html,
      attachments: attachment
        ? [
            {
              filename: attachment.filename,
              content: attachment.content,
              encoding: attachment.encoding,
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.messageId);
    return info;
  } catch {
    throw new Error('Failed to send email');
  }
};

const createEmailContent = async (
  data: Record<string, any>,
  templateType: string
): Promise<string> => {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateType}.template.hbs`);
    const content = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(content);
    return compiled(data);
  } catch {
    throw new AppError(status.FORBIDDEN, 'Failed to create email content');
  }
};

export const EmailHelper = {
  sendEmail,
  createEmailContent,
};
