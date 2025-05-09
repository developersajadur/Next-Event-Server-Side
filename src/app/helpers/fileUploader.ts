import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';
import { ICLoudinaryResponse, IFile } from '../interfaces/file';

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUD_API_KEY,
  api_secret: config.cloudinary.CLOUD_API_SECRET,
});

const upload = multer({ dest: 'temp/' });

// Function to upload file to Cloudinary
const uploadToCloudinary = async (
  file: IFile,
): Promise<ICLoudinaryResponse> => {
  // console.log('Starting upload to Cloudinary...');

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      (error: Error, result: ICLoudinaryResponse) => {
        fs.unlinkSync(file.path);

        if (error) {
          // console.error('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          // console.log('File uploaded successfully to Cloudinary:', result);
          resolve(result);
        }
      },
    );
  });
};

export const fileUploads = {
  upload,
  uploadToCloudinary,
};
