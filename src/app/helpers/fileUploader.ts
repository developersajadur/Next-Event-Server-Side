import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import config from '../config';
import { ICLoudinaryResponse } from '../interfaces/file';

// Cloudinary config
cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUD_API_KEY,
  api_secret: config.cloudinary.CLOUD_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload using Buffer instead of path
const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<ICLoudinaryResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'user-profile-images' }, 
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          return reject(error);
        }
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve(result as unknown as ICLoudinaryResponse);
      }
    );

    uploadStream.end(file.buffer); 
  });
};

export const fileUploads = {
  upload,
  uploadToCloudinary,
};
