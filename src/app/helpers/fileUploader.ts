import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import config from '../config';
import { ICLoudinaryResponse, IFile } from '../interfaces/file';

cloudinary.config({
  cloud_name: config.cloudinary.CLOUD_NAME,
  api_key: config.cloudinary.CLOUD_API_KEY,
  api_secret: config.cloudinary.CLOUD_API_SECRET,
});

// multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//
const uploadToCloudinary = async (
  file: IFile,
): Promise<ICLoudinaryResponse> => {
  // Upload an image

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      (error: Error, result: ICLoudinaryResponse) => {
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
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
