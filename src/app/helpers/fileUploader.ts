import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import config from '../config';
import { ICLoudinaryResponse } from '../interfaces/file';

// Cloudinary config
cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUD_API_KEY,
  api_secret: config.cloudinary.CLOUD_API_SECRET,
});


// Use memory storage instead of writing to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to convert buffer to stream
const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Function to upload file buffer to Cloudinary
const uploadToCloudinary = async (
  file: Express.Multer.File, // file from multer memory storage
): Promise<ICLoudinaryResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (error) return reject(error);
        resolve(result as any);
      }
    );

    bufferToStream(file.buffer).pipe(uploadStream);
  });
};

export const fileUploads = {
  upload,
  uploadToCloudinary,
};
