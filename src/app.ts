import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import status from 'http-status';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';

// import dotenv from 'dotenv';
// import path from 'path';

// // ✅ এটা প্রথম লাইনে কল করো
// dotenv.config({ path: path.join(process.cwd(), '.env') });
// console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.status(status.OK).json({
    success: true,
    message: 'Server Is Running',
  });
});

app.use('/api/v1', router);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
