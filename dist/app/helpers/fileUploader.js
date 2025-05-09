"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploads = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const config_1 = __importDefault(require("../config"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary.CLOUD_NAME,
    api_key: config_1.default.cloudinary.CLOUD_API_KEY,
    api_secret: config_1.default.cloudinary.CLOUD_API_SECRET,
});
const upload = (0, multer_1.default)({ dest: 'temp/' });
// Function to upload file to Cloudinary
const uploadToCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Starting upload to Cloudinary...');
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(file.path, (error, result) => {
            fs_1.default.unlinkSync(file.path);
            if (error) {
                // console.error('Error uploading to Cloudinary:', error);
                reject(error);
            }
            else {
                // console.log('File uploaded successfully to Cloudinary:', result);
                resolve(result);
            }
        });
    });
});
exports.fileUploads = {
    upload,
    uploadToCloudinary,
};
