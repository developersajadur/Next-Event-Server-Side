import nodemailer from "nodemailer";
import config from "../../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
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

  // async..await is not allowed in global scope, must use a wrapper
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"PH Health Care👻" <hydravulgaris760@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Reset Password Link ✔", // Subject line
    html,
  });

  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

export default emailSender;