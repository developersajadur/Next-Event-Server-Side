import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is missing');
}
if (!process.env.ACCESS_TOKEN_EXPIRES_IN) {
  throw new Error('ACCESS_TOKEN_EXPIRES_IN is missing');
}

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  client_site_url: process.env.CLIENT_SITE_URL,
  cloudinary: {
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  },
  jwt: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '',
    RESET_PASSWORD_SECRET: process.env.RESET_PASSWORD_SECRET || '',
    RESET_PASSWORD_TOKEN_EXP_IN: process.env.RESET_PASSWORD_TOKEN_EXP_IN || '',
    RESET_PASSWORD_LINK: process.env.RESET_PASSWORD_LINK || '',
  },



  emailSender: {
    email: process.env.EMAIL,
    app_password: process.env.APP_PASSWORD,
  },
  ssl: {
    store_name: process.env.STORE_NAME,
    payment_api: process.env.PAYMENT_API,
    validation_api: process.env.VALIDATION_API,
    ipn_url: process.env.SSL_IPN_URL,
    store_id: process.env.STORE_ID,
    store_pass: process.env.STORE_PASSWORD,
    validation_url: process.env.VALIDATION_URL,
    success_url: process.env.SUCCESS_URL,
    failed_url: process.env.FAILED_URL,
    cancel_url: process.env.CANCEL_URL,
  },
};



